import type { Item, Lang, MatchHit } from "./types";
import { getDb } from "./db";

const STOP = new Set([
  "the",
  "and",
  "with",
  "bor",
  "uchun",
  "yonida",
  "qolgan",
  "yoqolgan",
  "topilgan",
  "bir",
  "this",
  "that",
]);

function tokens(text: string) {
  return text
    .toLowerCase()
    .replace(/[‘’ʻ`]/g, "'")
    .split(/[^a-z0-9'o‘g‘]+/i)
    .map((w) => w.trim())
    .filter((w) => w.length > 2 && !STOP.has(w));
}

function hoursBetween(a: string, b: string) {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 36e5;
}

export function scorePair(base: Item, other: Item): MatchHit | null {
  if (base.id === other.id) return null;
  if (base.kind === other.kind) return null;
  if (base.status === "reunited" || other.status === "reunited") return null;

  let score = 0;
  const reasons: string[] = [];

  if (base.universityId === other.universityId) {
    score += 32;
    reasons.push("campus");
  } else {
    score -= 20;
  }

  if (base.category === other.category) {
    score += 28;
    reasons.push("category");
  } else {
    return null;
  }

  if (base.spotId === other.spotId) {
    score += 18;
    reasons.push("spot");
  }

  const hours = hoursBetween(base.occurredAt, other.occurredAt);
  if (hours <= 6) {
    score += 24;
    reasons.push("hours");
  } else if (hours <= 48) {
    score += 16;
    reasons.push("days");
  } else if (hours <= 24 * 7) {
    score += 8;
    reasons.push("week");
  } else if (hours <= 24 * 14) {
    score += 3;
  } else {
    score -= 10;
  }

  const a = new Set(tokens(`${base.title} ${base.description} ${base.brand ?? ""}`));
  const b = new Set(tokens(`${other.title} ${other.description} ${other.brand ?? ""}`));
  let overlap = 0;
  for (const t of a) if (b.has(t)) overlap++;
  if (overlap >= 2) {
    score += 14;
    reasons.push("words");
  } else if (overlap === 1) {
    score += 6;
  }

  if (base.color && other.color && base.color.toLowerCase() === other.color.toLowerCase()) {
    score += 10;
    reasons.push("color");
  }
  if (base.brand && other.brand && base.brand.toLowerCase() === other.brand.toLowerCase()) {
    score += 10;
    reasons.push("brand");
  }

  if (score < 40) return null;
  return { item: other, score: Math.min(99, Math.round(score)), reasons };
}

export function matchesFor(item: Item, limit = 6): MatchHit[] {
  try {
    const db = getDb();
    return db.items
      .map((other) => scorePair(item, other))
      .filter((x): x is MatchHit => Boolean(x))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  } catch {
    return [];
  }
}

export function reasonLabel(code: string, lang: Lang) {
  const map: Record<string, { uz: string; en: string }> = {
    campus: { uz: "bir kampus", en: "same campus" },
    category: { uz: "bir kategoriya", en: "same category" },
    spot: { uz: "bir joy", en: "same spot" },
    hours: { uz: "bir necha soat ichida", en: "within hours" },
    days: { uz: "ikki kun ichida", en: "within two days" },
    week: { uz: "bir hafta ichida", en: "within a week" },
    words: { uz: "o‘xshash so‘zlar", en: "shared details" },
    color: { uz: "bir xil rang", en: "same color" },
    brand: { uz: "bir brend", en: "same brand" },
  };
  return map[code]?.[lang] ?? code;
}

export function personalMatches(userId: string) {
  try {
    const db = getDb();
    const mine = db.items.filter((i) => i.userId === userId && i.status === "open");
    return mine.flatMap((item) =>
      matchesFor(item, 4).map((hit) => ({
        mine: item,
        ...hit,
      })),
    );
  } catch {
    return [];
  }
}
