import type { Category, Item, Kind, PublicUser, University } from "./types";

const API = "https://api.topdim.wwww.uz/api/v1";
const TOKEN_KEY = "topdim_token";
const USER_KEY = "topdim_user";

type ApiUniversity = { id: string; name: string; shortName: string; city: string; spots: { id: string; name: string; x: number; y: number }[] };
type ApiItem = Omit<Item, "emoji" | "hue"> & { university_name?: string; spot_name?: string };

const emoji: Record<Category, string> = { documents: "ID", electronics: "HD", books: "BK", keys: "KY", clothing: "CL", bags: "BG", sport: "SP", other: "OT" };

export function token() { return typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY); }
export function currentUser(): PublicUser | null {
  if (typeof window === "undefined") return null;
  try { return JSON.parse(localStorage.getItem(USER_KEY) || "null") as PublicUser | null; } catch { return null; }
}
export function setSession(nextToken: string, user: PublicUser) { localStorage.setItem(TOKEN_KEY, nextToken); localStorage.setItem(USER_KEY, JSON.stringify(user)); }
export function clearSession() { localStorage.removeItem(TOKEN_KEY); localStorage.removeItem(USER_KEY); }

export async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const authToken = token();
  const response = await fetch(`${API}${path}`, { ...init, headers: { "content-type": "application/json", ...(authToken ? { authorization: `Bearer ${authToken}` } : {}), ...init.headers } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || "Serverga ulanib bo‘lmadi.");
  return body.data as T;
}
export function toUniversity(uni: ApiUniversity): University {
  return { id: uni.id, slug: uni.id, nameUz: uni.name, nameEn: uni.name, short: uni.shortName, city: uni.city, students: 0, partner: "none", accent: "#14372c", blurbUz: "", blurbEn: "", spots: uni.spots.map((spot) => ({ ...spot, nameUz: spot.name, nameEn: spot.name })) };
}
export function toItem(item: ApiItem): Item { return { ...item, emoji: emoji[item.category], hue: 153 }; }
export async function universities() { return (await request<ApiUniversity[]>("/universities")).map(toUniversity); }
export async function items(params = "") { const result = await request<ApiItem[]>(`/items${params ? `?${params}` : ""}`); return result.map(toItem); }
export async function signIn(email: string, password: string) { const data = await request<{ token: string; user: PublicUser }>("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }); setSession(data.token, data.user); return data.user; }
export async function signUp(payload: { name: string; email: string; password: string; universityId: string }) { const data = await request<{ token: string; user: PublicUser }>("/auth/register", { method: "POST", body: JSON.stringify(payload) }); setSession(data.token, data.user); return data.user; }
export async function postItem(payload: { kind: Kind; title: string; description: string; category: Category; universityId: string; spotId: string; occurredAt: string; color?: string; brand?: string; secretQuestion?: string; secretAnswer?: string }) { return toItem(await request<ApiItem>("/items", { method: "POST", body: JSON.stringify(payload) })); }
