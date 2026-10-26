import fs from "fs";
import path from "path";
import { createSeed } from "./seed";
import type { Database } from "./types";

const DIR = path.join(process.cwd(), "data");
const FILE = path.join(DIR, "db.json");

declare global {
  var __topdim: Database | undefined;
}

function load(): Database {
  if (globalThis.__topdim) return globalThis.__topdim;
  try {
    if (fs.existsSync(FILE)) {
      const parsed = JSON.parse(fs.readFileSync(FILE, "utf8")) as Database;
      globalThis.__topdim = parsed;
      return parsed;
    }
  } catch {
    /* reseed */
  }
  const seed = createSeed();
  persist(seed);
  globalThis.__topdim = seed;
  return seed;
}

function persist(db: Database) {
  fs.mkdirSync(DIR, { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(db, null, 2));
}

export function getDb(): Database {
  return load();
}

export function mutate<T>(fn: (db: Database) => T): T {
  const db = load();
  const result = fn(db);
  persist(db);
  globalThis.__topdim = db;
  return result;
}

export function resetDb() {
  const seed = createSeed();
  persist(seed);
  globalThis.__topdim = seed;
  return seed;
}
