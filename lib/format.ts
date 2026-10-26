import type { Lang, University } from "./types";

export function uniName(u: University, lang: Lang) {
  return lang === "uz" ? u.nameUz : u.nameEn;
}

export function spotName(u: University, spotId: string, lang: Lang) {
  const s = u.spots.find((x) => x.id === spotId);
  if (!s) return spotId;
  return lang === "uz" ? s.nameUz : s.nameEn;
}

export function whenLabel(iso: string, lang: Lang) {
  const d = new Date(iso);
  const now = Date.now();
  const diff = now - d.getTime();
  const hours = Math.round(diff / 36e5);
  if (hours < 1) return lang === "uz" ? "hozirgina" : "just now";
  if (hours < 24) return lang === "uz" ? `${hours} soat oldin` : `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 14) return lang === "uz" ? `${days} kun oldin` : `${days}d ago`;
  return d.toLocaleDateString(lang === "uz" ? "uz-UZ" : "en-GB", {
    day: "numeric",
    month: "short",
  });
}

export function formatWhen(iso: string, lang: Lang) {
  return new Date(iso).toLocaleString(lang === "uz" ? "uz-UZ" : "en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function publicUser<T extends { passwordHash?: string }>(u: T) {
  const { passwordHash: _p, ...rest } = u;
  return rest;
}
