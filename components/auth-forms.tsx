"use client";

import { useActionState } from "react";
import Link from "next/link";
import { loginAction, registerAction } from "@/lib/actions";
import { DEMO_PASSWORD } from "@/lib/constants";
import type { Lang, University } from "@/lib/types";

export function LoginForm({ lang }: { lang: Lang }) {
  const [state, action, pending] = useActionState(loginAction, null);
  return (
    <form action={action} className="card space-y-4 p-6">
      <input className="input" name="email" type="email" required placeholder="email" defaultValue="dilnoza@student.uz" />
      <input className="input" name="password" type="password" required defaultValue={DEMO_PASSWORD} />
      {state && "error" in state && state.error ? (
        <p className="text-sm text-[var(--coral)]">{state.error}</p>
      ) : (
        <p className="text-xs text-[var(--ink-soft)]">Demo: dilnoza@student.uz · {DEMO_PASSWORD}</p>
      )}
      <button className="btn btn-primary w-full" disabled={pending}>
        {lang === "uz" ? "Kirish" : "Log in"}
      </button>
      <p className="text-center text-sm">
        <Link href="/register" className="underline">
          {lang === "uz" ? "Hisob yo‘qmi?" : "Need an account?"}
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm({ lang, universities }: { lang: Lang; universities: University[] }) {
  const [state, action, pending] = useActionState(registerAction, null);
  return (
    <form action={action} className="card space-y-4 p-6">
      <input className="input" name="name" required placeholder={lang === "uz" ? "Ism" : "Name"} />
      <input className="input" name="email" type="email" required placeholder="email" />
      <input className="input" name="password" type="password" required minLength={6} placeholder="parol" />
      <select className="select" name="universityId" required>
        {universities.map((u) => (
          <option key={u.id} value={u.id}>
            {u.short} — {lang === "uz" ? u.nameUz : u.nameEn}
          </option>
        ))}
      </select>
      {state && "error" in state && state.error ? (
        <p className="text-sm text-[var(--coral)]">{state.error}</p>
      ) : null}
      <button className="btn btn-primary w-full" disabled={pending}>
        {lang === "uz" ? "Kampusga qo‘shilish" : "Join campus"}
      </button>
    </form>
  );
}
