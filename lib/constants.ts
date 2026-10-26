import type { Category, Kind } from "./types";

export const CATEGORIES: {
  id: Category;
  emoji: string;
  uz: string;
  en: string;
}[] = [
  { id: "documents", emoji: "🪪", uz: "Hujjatlar", en: "Documents" },
  { id: "electronics", emoji: "🎧", uz: "Elektronika", en: "Electronics" },
  { id: "books", emoji: "📚", uz: "Kitoblar", en: "Books" },
  { id: "keys", emoji: "🔑", uz: "Kalitlar", en: "Keys" },
  { id: "clothing", emoji: "🧥", uz: "Kiyim", en: "Clothing" },
  { id: "bags", emoji: "🎒", uz: "Sumkalar", en: "Bags" },
  { id: "sport", emoji: "⚽", uz: "Sport", en: "Sport" },
  { id: "other", emoji: "📦", uz: "Boshqa", en: "Other" },
];

export const KINDS: { id: Kind; uz: string; en: string }[] = [
  { id: "lost", uz: "Yo‘qolgan", en: "Lost" },
  { id: "found", uz: "Topilgan", en: "Found" },
];

export const STATUSES = [
  { id: "open", uz: "Ochiq", en: "Open" },
  { id: "claimed", uz: "So‘rov bor", en: "Claimed" },
  { id: "reunited", uz: "Egasi topildi", en: "Reunited" },
  { id: "closed", uz: "Yopilgan", en: "Closed" },
] as const;

export function categoryMeta(id: Category) {
  return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[7];
}

export const DEMO_PASSWORD = "topdim2026";
