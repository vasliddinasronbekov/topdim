import { createSeed } from "./seed";
import type { Database } from "./types";

declare global {
  var __topdim: Database | undefined;
}

function load(): Database {
  if (globalThis.__topdim) return globalThis.__topdim;
  const seed = createSeed();
  globalThis.__topdim = seed;
  return seed;
}

export function getDb(): Database {
  return load();
}

export function mutate<T>(fn: (db: Database) => T): T {
  const db = load();
  const result = fn(db);
  globalThis.__topdim = db;
  return result;
}

export function resetDb() {
  const seed = createSeed();
  globalThis.__topdim = seed;
  return seed;
}
