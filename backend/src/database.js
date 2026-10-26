const fs = require("node:fs");
const path = require("node:path");
const Database = require("better-sqlite3");

const databasePath = path.resolve(process.cwd(), process.env.DATABASE_PATH || "data/topdim.db");
fs.mkdirSync(path.dirname(databasePath), { recursive: true });

const db = new Database(databasePath);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS universities (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, short_name TEXT NOT NULL,
    city TEXT NOT NULL DEFAULT 'Tashkent', created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS campus_spots (
    id TEXT PRIMARY KEY, university_id TEXT NOT NULL REFERENCES universities(id) ON DELETE CASCADE,
    name TEXT NOT NULL, x REAL, y REAL
  );
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, name TEXT NOT NULL, email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL, university_id TEXT NOT NULL REFERENCES universities(id),
    role TEXT NOT NULL DEFAULT 'student' CHECK(role IN ('student','admin','partner')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY, kind TEXT NOT NULL CHECK(kind IN ('lost','found')),
    title TEXT NOT NULL, description TEXT NOT NULL,
    category TEXT NOT NULL CHECK(category IN ('documents','electronics','books','keys','clothing','bags','sport','other')),
    university_id TEXT NOT NULL REFERENCES universities(id),
    spot_id TEXT NOT NULL REFERENCES campus_spots(id), occurred_at TEXT NOT NULL,
    user_id TEXT NOT NULL REFERENCES users(id), status TEXT NOT NULL DEFAULT 'open'
      CHECK(status IN ('open','claimed','reunited','closed')),
    color TEXT, brand TEXT, secret_question TEXT, secret_answer TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
  CREATE INDEX IF NOT EXISTS items_search_idx ON items(university_id, kind, category, status, occurred_at DESC);
  CREATE TABLE IF NOT EXISTS claims (
    id TEXT PRIMARY KEY, item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    from_user_id TEXT NOT NULL REFERENCES users(id), message TEXT NOT NULL, secret_attempt TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','accepted','declined')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(item_id, from_user_id)
  );
  CREATE TABLE IF NOT EXISTS threads (
    id TEXT PRIMARY KEY, item_id TEXT NOT NULL REFERENCES items(id) ON DELETE CASCADE,
    user_a TEXT NOT NULL REFERENCES users(id), user_b TEXT NOT NULL REFERENCES users(id),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, UNIQUE(item_id, user_a, user_b)
  );
  CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY, thread_id TEXT NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    from_user_id TEXT NOT NULL REFERENCES users(id), body TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

function seed() {
  const count = db.prepare("SELECT COUNT(*) AS count FROM universities").get().count;
  if (count) return;
  const insertUniversity = db.prepare("INSERT INTO universities (id, name, short_name, city) VALUES (?, ?, ?, ?)");
  const insertSpot = db.prepare("INSERT INTO campus_spots (id, university_id, name, x, y) VALUES (?, ?, ?, ?, ?)");
  const seedData = [
    ["tatu", "Toshkent axborot texnologiyalari universiteti", "TATU", "Toshkent", [["tatu-library", "Kutubxona", 22, 35], ["tatu-main", "Bosh bino", 50, 50], ["tatu-canteen", "Oshxona", 70, 68]]],
    ["wiut", "Westminster International University in Tashkent", "WIUT", "Toshkent", [["wiut-library", "Library", 25, 35], ["wiut-atrium", "Atrium", 50, 50], ["wiut-cafe", "Cafe", 75, 65]]],
    ["inha", "INHA University in Tashkent", "INHA", "Toshkent", [["inha-lobby", "Main lobby", 45, 45], ["inha-library", "Library", 25, 30]]],
  ];
  const transaction = db.transaction(() => {
    for (const [id, name, shortName, city, spots] of seedData) {
      insertUniversity.run(id, name, shortName, city);
      for (const [spotId, spotName, x, y] of spots) insertSpot.run(spotId, id, spotName, x, y);
    }
  });
  transaction();
}

seed();
module.exports = db;
