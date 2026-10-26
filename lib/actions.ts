"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { getDb, mutate } from "./db";
import { clearSession, getUser, setSession } from "./auth";
import { hashPassword, uid, verifyPassword } from "./crypto";
import type { Category, Kind } from "./types";
import { DEMO_PASSWORD } from "./constants";

function formStr(form: FormData, key: string) {
  return String(form.get(key) ?? "").trim();
}

export async function setLangAction(lang: "uz" | "en") {
  (await cookies()).set("lang", lang, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  revalidatePath("/", "layout");
}

export async function registerAction(_prev: unknown, form: FormData) {
  const name = formStr(form, "name");
  const email = formStr(form, "email").toLowerCase();
  const password = formStr(form, "password");
  const universityId = formStr(form, "universityId");
  if (!name || !email || password.length < 6) {
    return { error: "Ism, email va kamida 6 belgilik parol kerak." };
  }
  const db = getDb();
  if (db.users.some((u) => u.email === email)) {
    return { error: "Bu email allaqachon ro‘yxatdan o‘tgan." };
  }
  if (!db.universities.some((u) => u.id === universityId)) {
    return { error: "Universitetni tanlang." };
  }
  const user = mutate((d) => {
    const created = {
      id: uid("u"),
      name,
      email,
      passwordHash: hashPassword(password),
      universityId,
      role: "student" as const,
      createdAt: new Date().toISOString(),
    };
    d.users.push(created);
    return created;
  });
  await setSession(user.id);
  redirect("/dashboard");
}

export async function loginAction(_prev: unknown, form: FormData) {
  const email = formStr(form, "email").toLowerCase();
  const password = formStr(form, "password");
  const user = getDb().users.find((u) => u.email === email);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { error: `Email yoki parol xato. Demo: dilnoza@student.uz / ${DEMO_PASSWORD}` };
  }
  await setSession(user.id);
  redirect("/dashboard");
}

export async function logoutAction() {
  await clearSession();
  redirect("/");
}

export async function createItemAction(_prev: unknown, form: FormData) {
  const user = await getUser();
  if (!user) return { error: "Avval kiring." };

  const kind = formStr(form, "kind") as Kind;
  const title = formStr(form, "title");
  const description = formStr(form, "description");
  const category = formStr(form, "category") as Category;
  const universityId = formStr(form, "universityId") || user.universityId;
  const spotId = formStr(form, "spotId");
  const occurredAt = formStr(form, "occurredAt");
  if (!title || !description || !spotId || !occurredAt) {
    return { error: "Sarlavha, tavsif, joy va vaqtni to‘ldiring." };
  }

  const hue = Math.floor(Math.random() * 360);
  const emojis: Record<string, string> = {
    documents: "🪪",
    electronics: "🎧",
    books: "📚",
    keys: "🔑",
    clothing: "🧥",
    bags: "🎒",
    sport: "⚽",
    other: "📦",
  };

  const id = mutate((d) => {
    const item = {
      id: uid("it"),
      kind,
      title,
      description,
      category,
      universityId,
      spotId,
      occurredAt: new Date(occurredAt).toISOString(),
      createdAt: new Date().toISOString(),
      userId: user.id,
      status: "open" as const,
      color: formStr(form, "color") || undefined,
      brand: formStr(form, "brand") || undefined,
      secretQuestion: formStr(form, "secretQuestion") || undefined,
      secretAnswer: formStr(form, "secretAnswer").toLowerCase() || undefined,
      emoji: emojis[category] ?? "📦",
      hue,
    };
    d.items.unshift(item);
    return item.id;
  });

  redirect(`/items/${id}`);
}

export async function claimAction(_prev: unknown, form: FormData) {
  const user = await getUser();
  if (!user) return { error: "Avval kiring." };
  const itemId = formStr(form, "itemId");
  const message = formStr(form, "message");
  const secretAttempt = formStr(form, "secretAttempt").toLowerCase();
  const db = getDb();
  const item = db.items.find((i) => i.id === itemId);
  if (!item) return { error: "E’lon topilmadi." };
  if (item.userId === user.id) return { error: "Bu sizning e’loningiz." };
  if (!message) return { error: "Qisqacha izoh yozing." };

  mutate((d) => {
    d.claims.push({
      id: uid("cl"),
      itemId,
      fromUserId: user.id,
      message,
      secretAttempt: secretAttempt || undefined,
      status: "pending",
      createdAt: new Date().toISOString(),
    });
    const itemRef = d.items.find((i) => i.id === itemId);
    if (itemRef && itemRef.status === "open") itemRef.status = "claimed";

    let thread = d.threads.find(
      (t) =>
        t.itemId === itemId &&
        ((t.userA === user.id && t.userB === item.userId) ||
          (t.userB === user.id && t.userA === item.userId)),
    );
    if (!thread) {
      thread = {
        id: uid("th"),
        itemId,
        userA: user.id,
        userB: item.userId,
        createdAt: new Date().toISOString(),
      };
      d.threads.push(thread);
    }
    d.messages.push({
      id: uid("m"),
      threadId: thread.id,
      fromUserId: user.id,
      body: message,
      createdAt: new Date().toISOString(),
    });
  });

  redirect("/messages");
}

export async function sendMessageAction(_prev: unknown, form: FormData) {
  const user = await getUser();
  if (!user) return { error: "Avval kiring." };
  const threadId = formStr(form, "threadId");
  const body = formStr(form, "body");
  if (!body) return { error: "Xabar yozing." };
  const thread = getDb().threads.find((t) => t.id === threadId);
  if (!thread || (thread.userA !== user.id && thread.userB !== user.id)) {
    return { error: "Suhbat topilmadi." };
  }
  mutate((d) => {
    d.messages.push({
      id: uid("m"),
      threadId,
      fromUserId: user.id,
      body,
      createdAt: new Date().toISOString(),
    });
  });
  revalidatePath(`/messages/${threadId}`);
  revalidatePath("/messages");
}

export async function resolveClaimAction(form: FormData) {
  const user = await getUser();
  if (!user) return;
  const claimId = formStr(form, "claimId");
  const decision = formStr(form, "decision") as "accepted" | "declined";
  mutate((d) => {
    const claim = d.claims.find((c) => c.id === claimId);
    if (!claim) return;
    const item = d.items.find((i) => i.id === claim.itemId);
    if (!item || item.userId !== user.id) return;
    claim.status = decision;
    if (decision === "accepted") item.status = "reunited";
    if (decision === "declined" && item.status === "claimed") {
      const others = d.claims.some(
        (c) => c.itemId === item.id && c.id !== claim.id && c.status === "pending",
      );
      if (!others) item.status = "open";
    }
  });
  revalidatePath("/dashboard");
}

export async function partnerLeadAction(_prev: unknown, form: FormData) {
  const org = formStr(form, "org");
  const email = formStr(form, "email");
  const kind = formStr(form, "kind");
  const note = formStr(form, "note");
  if (!org || !email) return { error: "Tashkilot va email kerak." };
  mutate((d) => {
    d.leads.push({
      id: uid("ld"),
      org,
      email,
      kind: kind || "campus",
      note,
      createdAt: new Date().toISOString(),
    });
  });
  return { ok: true as const };
}

