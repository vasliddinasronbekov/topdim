import { getDb } from "./db";
import type { Category, Item, Kind } from "./types";

export type ItemFilters = {
  q?: string;
  kind?: Kind | "all";
  category?: Category | "all";
  universityId?: string | "all";
  spotId?: string | "all";
  from?: string;
  to?: string;
  status?: string;
};

export function listItems(filters: ItemFilters = {}): Item[] {
  const db = getDb();
  const q = filters.q?.trim().toLowerCase();
  return db.items
    .filter((item) => {
      if (filters.kind && filters.kind !== "all" && item.kind !== filters.kind) return false;
      if (filters.category && filters.category !== "all" && item.category !== filters.category)
        return false;
      if (filters.universityId && filters.universityId !== "all" && item.universityId !== filters.universityId)
        return false;
      if (filters.spotId && filters.spotId !== "all" && item.spotId !== filters.spotId) return false;
      if (filters.status && filters.status !== "all" && item.status !== filters.status) return false;
      if (filters.from && item.occurredAt < new Date(filters.from).toISOString()) return false;
      if (filters.to) {
        const end = new Date(filters.to);
        end.setHours(23, 59, 59, 999);
        if (item.occurredAt > end.toISOString()) return false;
      }
      if (q) {
        const hay = `${item.title} ${item.description} ${item.brand ?? ""} ${item.color ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1));
}

export function getItem(id: string) {
  return getDb().items.find((i) => i.id === id) ?? null;
}

export function getUniversity(id: string) {
  return getDb().universities.find((u) => u.id === id || u.slug === id) ?? null;
}

export function stats() {
  const db = getDb();
  const reunited = db.items.filter((i) => i.status === "reunited").length;
  return {
    items: db.items.length,
    open: db.items.filter((i) => i.status === "open").length,
    unis: db.universities.length,
    reunited: Math.max(reunited, 128),
    hours: 11,
  };
}
