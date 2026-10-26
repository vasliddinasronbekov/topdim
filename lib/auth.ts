import { cookies } from "next/headers";
import { getDb } from "./db";
import { sign, unsign } from "./crypto";
import type { PublicUser, User } from "./types";

const COOKIE = "topdim_session";

export function toPublic(user: User): PublicUser {
  const { passwordHash: _h, ...rest } = user;
  return rest;
}

export async function setSession(userId: string) {
  const jar = await cookies();
  jar.set(COOKIE, sign(userId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getUser(): Promise<PublicUser | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const id = unsign(token);
  if (!id) return null;
  const user = getDb().users.find((u) => u.id === id);
  return user ? toPublic(user) : null;
}

export async function requireUser() {
  const user = await getUser();
  if (!user) throw new Error("auth");
  return user;
}
