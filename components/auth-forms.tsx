"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signIn, signUp, universities } from "@/lib/api";
import type { Lang, University } from "@/lib/types";

export function LoginForm({ lang }: { lang: Lang }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  async function submit(form: FormData) {
    setPending(true); setError("");
    try { await signIn(String(form.get("email")), String(form.get("password"))); window.location.assign("/browse"); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Kirish amalga oshmadi."); setPending(false); }
  }
  return <form action={submit} className="card space-y-4 p-6"><input className="input" name="email" type="email" required placeholder="email" /><input className="input" name="password" type="password" required minLength={8} placeholder="password" />{error && <p className="text-sm text-[var(--coral)]">{error}</p>}<button className="btn btn-primary w-full" disabled={pending}>{pending ? "..." : lang === "uz" ? "Kirish" : "Log in"}</button><p className="text-center text-sm"><Link href="/register" className="underline">{lang === "uz" ? "Hisob yo‘qmi?" : "Need an account?"}</Link></p></form>;
}

export function RegisterForm({ lang }: { lang: Lang }) {
  const [list, setList] = useState<University[]>([]); const [error, setError] = useState(""); const [pending, setPending] = useState(false);
  useEffect(() => { universities().then(setList).catch(() => setError("Universitetlar yuklanmadi.")); }, []);
  async function submit(form: FormData) {
    setPending(true); setError("");
    try { await signUp({ name: String(form.get("name")), email: String(form.get("email")), password: String(form.get("password")), universityId: String(form.get("universityId")) }); window.location.assign("/browse"); }
    catch (reason) { setError(reason instanceof Error ? reason.message : "Ro‘yxatdan o‘tish amalga oshmadi."); setPending(false); }
  }
  return <form action={submit} className="card space-y-4 p-6"><input className="input" name="name" required placeholder={lang === "uz" ? "Ism" : "Name"} /><input className="input" name="email" type="email" required placeholder="email" /><input className="input" name="password" type="password" required minLength={8} placeholder="password" /><select className="select" name="universityId" required disabled={!list.length}><option value="">{lang === "uz" ? "Universitetni tanlang" : "Choose a university"}</option>{list.map((uni) => <option key={uni.id} value={uni.id}>{uni.short} - {uni.nameUz}</option>)}</select>{error && <p className="text-sm text-[var(--coral)]">{error}</p>}<button className="btn btn-primary w-full" disabled={pending || !list.length}>{pending ? "..." : lang === "uz" ? "Kampusga qo‘shilish" : "Join campus"}</button></form>;
}
