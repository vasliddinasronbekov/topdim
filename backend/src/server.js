require("dotenv").config();
const crypto = require("node:crypto");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const db = require("./database");

const app = express();
const port = Number(process.env.PORT || 4000);
const host = process.env.HOST || "0.0.0.0";
const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32) throw new Error("JWT_SECRET must be at least 32 characters.");

const origins = (process.env.CLIENT_ORIGINS || "http://localhost:3000").split(",").map((value) => value.trim()).filter(Boolean);
app.set("trust proxy", 1);
app.use(helmet());
app.use(cors({ origin(origin, callback) { if (!origin || origins.includes(origin)) return callback(null, true); return callback(new Error("Origin is not allowed by CORS")); }, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

const id = (prefix) => `${prefix}_${crypto.randomBytes(10).toString("hex")}`;
const now = () => new Date().toISOString();
const publicUser = (user) => ({ id: user.id, name: user.name, email: user.email, universityId: user.university_id, role: user.role, createdAt: user.created_at });
const tokenFor = (user) => jwt.sign({ sub: user.id, role: user.role }, jwtSecret, { expiresIn: process.env.JWT_EXPIRES_IN || "30d" });

function auth(req, res, next) {
  const value = req.headers.authorization;
  if (!value?.startsWith("Bearer ")) return res.status(401).json({ error: "Authentication required." });
  try { req.user = jwt.verify(value.slice(7), jwtSecret); return next(); }
  catch { return res.status(401).json({ error: "Your session has expired. Please sign in again." }); }
}
function parse(schema, body, res) {
  const result = schema.safeParse(body);
  if (!result.success) { res.status(422).json({ error: "Please check the highlighted fields.", details: z.flattenError(result.error).fieldErrors }); return null; }
  return result.data;
}
function itemRow(item) {
  const { secret_answer: _secretAnswer, ...safeItem } = item;
  return { ...safeItem, universityId: item.university_id, spotId: item.spot_id, userId: item.user_id, occurredAt: item.occurred_at, createdAt: item.created_at, updatedAt: item.updated_at, secretQuestion: item.secret_question || undefined, color: item.color || undefined, brand: item.brand || undefined };
}
const categories = ["documents", "electronics", "books", "keys", "clothing", "bags", "sport", "other"];
const listingSchema = z.object({
  kind: z.enum(["lost", "found"]), title: z.string().trim().min(3).max(120), description: z.string().trim().min(10).max(3000),
  category: z.enum(categories), universityId: z.string().trim().min(1), spotId: z.string().trim().min(1),
  occurredAt: z.string().trim().refine((value) => !Number.isNaN(Date.parse(value)), "Invalid date and time.").transform((value) => new Date(value).toISOString()), color: z.string().trim().max(60).optional(), brand: z.string().trim().max(80).optional(),
  secretQuestion: z.string().trim().max(200).optional(), secretAnswer: z.string().trim().max(200).optional(),
});

app.get("/health", (_req, res) => res.json({ ok: true, service: "topdim-api", time: now() }));
app.get("/api/v1/universities", (_req, res) => {
  const universities = db.prepare("SELECT * FROM universities ORDER BY short_name").all().map((uni) => ({ id: uni.id, name: uni.name, shortName: uni.short_name, city: uni.city, spots: db.prepare("SELECT id, name, x, y FROM campus_spots WHERE university_id = ? ORDER BY name").all(uni.id) }));
  res.json({ data: universities });
});

app.post("/api/v1/auth/register", async (req, res) => {
  const data = parse(z.object({ name: z.string().trim().min(2).max(80), email: z.string().trim().email().max(254), password: z.string().min(8).max(128), universityId: z.string().min(1) }), req.body, res); if (!data) return;
  const email = data.email.toLowerCase();
  if (db.prepare("SELECT id FROM users WHERE email = ?").get(email)) return res.status(409).json({ error: "This email is already registered." });
  if (!db.prepare("SELECT id FROM universities WHERE id = ?").get(data.universityId)) return res.status(422).json({ error: "Selected university does not exist." });
  const user = { id: id("usr"), name: data.name, email, passwordHash: await bcrypt.hash(data.password, 12), universityId: data.universityId, createdAt: now() };
  db.prepare("INSERT INTO users (id, name, email, password_hash, university_id, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(user.id, user.name, user.email, user.passwordHash, user.universityId, user.createdAt);
  res.status(201).json({ data: { token: tokenFor({ ...user, role: "student" }), user: { id: user.id, name: user.name, email: user.email, universityId: user.universityId, role: "student", createdAt: user.createdAt } } });
});
app.post("/api/v1/auth/login", async (req, res) => {
  const data = parse(z.object({ email: z.string().trim().email(), password: z.string().min(1).max(128) }), req.body, res); if (!data) return;
  const user = db.prepare("SELECT * FROM users WHERE email = ?").get(data.email.toLowerCase());
  if (!user || !(await bcrypt.compare(data.password, user.password_hash))) return res.status(401).json({ error: "Email or password is incorrect." });
  res.json({ data: { token: tokenFor(user), user: publicUser(user) } });
});
app.get("/api/v1/auth/me", auth, (req, res) => {
  const user = db.prepare("SELECT * FROM users WHERE id = ?").get(req.user.sub);
  if (!user) return res.status(401).json({ error: "Account no longer exists." });
  res.json({ data: publicUser(user) });
});

app.get("/api/v1/items", (req, res) => {
  const values = []; const where = ["1 = 1"];
  const allowed = { kind: ["lost", "found"], category: categories, status: ["open", "claimed", "reunited", "closed"] };
  for (const key of Object.keys(allowed)) if (typeof req.query[key] === "string" && allowed[key].includes(req.query[key])) { where.push(`i.${key} = ?`); values.push(req.query[key]); }
  for (const [queryKey, column] of [["universityId", "university_id"], ["spotId", "spot_id"]]) if (typeof req.query[queryKey] === "string" && req.query[queryKey]) { where.push(`i.${column} = ?`); values.push(req.query[queryKey]); }
  if (typeof req.query.q === "string" && req.query.q.trim()) { where.push("(i.title LIKE ? OR i.description LIKE ? OR i.brand LIKE ? OR i.color LIKE ?)"); const q = `%${req.query.q.trim()}%`; values.push(q, q, q, q); }
  const page = Math.max(1, Number(req.query.page) || 1); const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const total = db.prepare(`SELECT COUNT(*) AS total FROM items i WHERE ${where.join(" AND ")}`).get(...values).total;
  const rows = db.prepare(`SELECT i.*, u.name AS university_name, s.name AS spot_name FROM items i JOIN universities u ON u.id=i.university_id JOIN campus_spots s ON s.id=i.spot_id WHERE ${where.join(" AND ")} ORDER BY i.occurred_at DESC LIMIT ? OFFSET ?`).all(...values, limit, (page - 1) * limit).map(itemRow);
  res.json({ data: rows, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
});
app.post("/api/v1/items", auth, (req, res) => {
  const data = parse(listingSchema, req.body, res); if (!data) return;
  const spot = db.prepare("SELECT id FROM campus_spots WHERE id = ? AND university_id = ?").get(data.spotId, data.universityId);
  if (!spot) return res.status(422).json({ error: "The selected place does not belong to this university." });
  const item = { id: id("item"), ...data, userId: req.user.sub, status: "open", createdAt: now() };
  db.prepare("INSERT INTO items (id, kind, title, description, category, university_id, spot_id, occurred_at, user_id, status, color, brand, secret_question, secret_answer, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(item.id, item.kind, item.title, item.description, item.category, item.universityId, item.spotId, item.occurredAt, item.userId, item.status, item.color || null, item.brand || null, item.secretQuestion || null, item.secretAnswer?.toLowerCase() || null, item.createdAt, item.createdAt);
  res.status(201).json({ data: item });
});
app.get("/api/v1/items/:id", (req, res) => {
  const item = db.prepare("SELECT i.*, u.name AS university_name, s.name AS spot_name FROM items i JOIN universities u ON u.id=i.university_id JOIN campus_spots s ON s.id=i.spot_id WHERE i.id = ?").get(req.params.id);
  if (!item) return res.status(404).json({ error: "Listing not found." });
  res.json({ data: itemRow(item) });
});
app.get("/api/v1/items/:id/matches", (req, res) => {
  const item = db.prepare("SELECT * FROM items WHERE id = ?").get(req.params.id);
  if (!item) return res.status(404).json({ error: "Listing not found." });
  const candidates = db.prepare("SELECT i.*, u.name AS university_name, s.name AS spot_name FROM items i JOIN universities u ON u.id=i.university_id JOIN campus_spots s ON s.id=i.spot_id WHERE i.id != ? AND i.university_id = ? AND i.kind != ? AND i.status IN ('open', 'claimed') ORDER BY i.occurred_at DESC LIMIT 100").all(item.id, item.university_id, item.kind);
  const matches = candidates.map((candidate) => {
    let score = 0; const reasons = [];
    if (candidate.category === item.category) { score += 45; reasons.push("same category"); }
    if (candidate.spot_id === item.spot_id) { score += 30; reasons.push("same campus location"); }
    const hoursApart = Math.abs(new Date(candidate.occurred_at).getTime() - new Date(item.occurred_at).getTime()) / 3600000;
    if (hoursApart <= 24) { score += 20; reasons.push("within 24 hours"); }
    else if (hoursApart <= 24 * 7) { score += 10; reasons.push("same week"); }
    if (candidate.color && item.color && candidate.color.toLowerCase() === item.color.toLowerCase()) { score += 5; reasons.push("same color"); }
    return { item: itemRow(candidate), score: Math.min(score, 99), reasons };
  }).filter((match) => match.score >= 45).sort((a, b) => b.score - a.score).slice(0, 12);
  res.json({ data: matches });
});
app.patch("/api/v1/items/:id/status", auth, (req, res) => {
  const data = parse(z.object({ status: z.enum(["open", "closed", "reunited"]) }), req.body, res); if (!data) return;
  const item = db.prepare("SELECT * FROM items WHERE id = ?").get(req.params.id);
  if (!item) return res.status(404).json({ error: "Listing not found." });
  if (item.user_id !== req.user.sub && req.user.role !== "admin") return res.status(403).json({ error: "You can only update your own listing." });
  db.prepare("UPDATE items SET status = ?, updated_at = ? WHERE id = ?").run(data.status, now(), item.id);
  res.json({ data: { id: item.id, status: data.status } });
});
app.get("/api/v1/me/items", auth, (req, res) => {
  const rows = db.prepare("SELECT i.*, u.name AS university_name, s.name AS spot_name FROM items i JOIN universities u ON u.id=i.university_id JOIN campus_spots s ON s.id=i.spot_id WHERE i.user_id = ? ORDER BY i.created_at DESC").all(req.user.sub).map(itemRow);
  res.json({ data: rows });
});

app.post("/api/v1/items/:id/claims", auth, (req, res) => {
  const data = parse(z.object({ message: z.string().trim().min(5).max(1500), secretAttempt: z.string().trim().max(200).optional() }), req.body, res); if (!data) return;
  const item = db.prepare("SELECT * FROM items WHERE id = ?").get(req.params.id);
  if (!item) return res.status(404).json({ error: "Listing not found." });
  if (item.user_id === req.user.sub) return res.status(422).json({ error: "You cannot claim your own listing." });
  if (item.status === "reunited" || item.status === "closed") return res.status(409).json({ error: "This listing is no longer available." });
  try {
    const result = db.transaction(() => {
      const claimId = id("claim"); const createdAt = now();
      db.prepare("INSERT INTO claims (id, item_id, from_user_id, message, secret_attempt, created_at) VALUES (?, ?, ?, ?, ?, ?)").run(claimId, item.id, req.user.sub, data.message, data.secretAttempt || null, createdAt);
      db.prepare("UPDATE items SET status = 'claimed', updated_at = ? WHERE id = ? AND status = 'open'").run(createdAt, item.id);
      let thread = db.prepare("SELECT * FROM threads WHERE item_id = ? AND user_a = ? AND user_b = ?").get(item.id, req.user.sub, item.user_id);
      if (!thread) { thread = { id: id("thread") }; db.prepare("INSERT INTO threads (id, item_id, user_a, user_b, created_at) VALUES (?, ?, ?, ?, ?)").run(thread.id, item.id, req.user.sub, item.user_id, createdAt); }
      db.prepare("INSERT INTO messages (id, thread_id, from_user_id, body, created_at) VALUES (?, ?, ?, ?, ?)").run(id("msg"), thread.id, req.user.sub, data.message, createdAt);
      return { claimId, threadId: thread.id };
    })();
    res.status(201).json({ data: result });
  } catch (error) { if (String(error.message).includes("UNIQUE")) return res.status(409).json({ error: "You have already sent a claim for this listing." }); throw error; }
});
app.get("/api/v1/items/:id/claims", auth, (req, res) => {
  const item = db.prepare("SELECT * FROM items WHERE id = ?").get(req.params.id);
  if (!item) return res.status(404).json({ error: "Listing not found." });
  if (item.user_id !== req.user.sub && req.user.role !== "admin") return res.status(403).json({ error: "You can only view claims for your own listing." });
  const claims = db.prepare("SELECT c.id, c.item_id AS itemId, c.from_user_id AS fromUserId, c.message, c.status, c.created_at AS createdAt, u.name AS claimantName, u.email AS claimantEmail FROM claims c JOIN users u ON u.id = c.from_user_id WHERE c.item_id = ? ORDER BY c.created_at DESC").all(item.id);
  res.json({ data: claims });
});
app.patch("/api/v1/claims/:id", auth, (req, res) => {
  const data = parse(z.object({ status: z.enum(["accepted", "declined"]) }), req.body, res); if (!data) return;
  const claim = db.prepare("SELECT c.*, i.user_id AS owner_id FROM claims c JOIN items i ON i.id = c.item_id WHERE c.id = ?").get(req.params.id);
  if (!claim) return res.status(404).json({ error: "Claim not found." });
  if (claim.owner_id !== req.user.sub && req.user.role !== "admin") return res.status(403).json({ error: "Only the listing owner can decide this claim." });
  db.transaction(() => {
    db.prepare("UPDATE claims SET status = ? WHERE id = ?").run(data.status, claim.id);
    if (data.status === "accepted") {
      db.prepare("UPDATE items SET status = 'reunited', updated_at = ? WHERE id = ?").run(now(), claim.item_id);
      db.prepare("UPDATE claims SET status = 'declined' WHERE item_id = ? AND id != ? AND status = 'pending'").run(claim.item_id, claim.id);
    } else {
      const pending = db.prepare("SELECT id FROM claims WHERE item_id = ? AND status = 'pending' LIMIT 1").get(claim.item_id);
      if (!pending) db.prepare("UPDATE items SET status = 'open', updated_at = ? WHERE id = ? AND status = 'claimed'").run(now(), claim.item_id);
    }
  })();
  res.json({ data: { id: claim.id, status: data.status } });
});
app.get("/api/v1/threads", auth, (req, res) => {
  const rows = db.prepare("SELECT t.*, i.title AS item_title, i.status AS item_status, (SELECT body FROM messages WHERE thread_id=t.id ORDER BY created_at DESC LIMIT 1) AS last_message, (SELECT created_at FROM messages WHERE thread_id=t.id ORDER BY created_at DESC LIMIT 1) AS last_message_at FROM threads t JOIN items i ON i.id=t.item_id WHERE t.user_a=? OR t.user_b=? ORDER BY COALESCE(last_message_at,t.created_at) DESC").all(req.user.sub, req.user.sub);
  res.json({ data: rows });
});
app.get("/api/v1/threads/:id", auth, (req, res) => {
  const thread = db.prepare("SELECT * FROM threads WHERE id = ? AND (user_a = ? OR user_b = ?)").get(req.params.id, req.user.sub, req.user.sub);
  if (!thread) return res.status(404).json({ error: "Conversation not found." });
  const messages = db.prepare("SELECT id, thread_id AS threadId, from_user_id AS fromUserId, body, created_at AS createdAt FROM messages WHERE thread_id = ? ORDER BY created_at").all(thread.id);
  res.json({ data: { ...thread, messages } });
});
app.post("/api/v1/threads/:id/messages", auth, (req, res) => {
  const data = parse(z.object({ body: z.string().trim().min(1).max(1500) }), req.body, res); if (!data) return;
  const thread = db.prepare("SELECT * FROM threads WHERE id = ? AND (user_a = ? OR user_b = ?)").get(req.params.id, req.user.sub, req.user.sub);
  if (!thread) return res.status(404).json({ error: "Conversation not found." });
  const message = { id: id("msg"), threadId: thread.id, fromUserId: req.user.sub, body: data.body, createdAt: now() };
  db.prepare("INSERT INTO messages (id, thread_id, from_user_id, body, created_at) VALUES (?, ?, ?, ?, ?)").run(message.id, message.threadId, message.fromUserId, message.body, message.createdAt);
  res.status(201).json({ data: message });
});

app.use((_req, res) => res.status(404).json({ error: "Route not found." }));
app.use((error, _req, res, _next) => { console.error(error); res.status(error.message === "Origin is not allowed by CORS" ? 403 : 500).json({ error: error.message === "Origin is not allowed by CORS" ? error.message : "Unexpected server error." }); });
app.listen(port, host, () => console.log(`Topdim API listening on http://${host}:${port}`));
