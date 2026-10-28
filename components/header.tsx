"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { clearSession, currentUser } from "@/lib/api";

export function Header() {
  const [user, setUser] = useState<ReturnType<typeof currentUser>>(null);
  useEffect(() => setUser(currentUser()), []);
  function logout() { clearSession(); setUser(null); window.location.assign("/"); }
  return <header className="nav-blur sticky top-0 z-40"><div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3"><Link href="/" className="serif text-2xl tracking-tight">Topdim<span className="text-[var(--coral)]">!</span></Link><nav className="hidden items-center gap-5 text-sm font-medium md:flex"><Link href="/browse">E’lonlar</Link><Link href="/matches">Mosliklar</Link><Link href="/map">Xarita</Link><Link href="/universities">Kampuslar</Link><Link href="/partners">Hamkorlik</Link></nav><div className="flex items-center gap-2">{user ? <><Link href="/dashboard" className="hidden text-sm font-semibold sm:inline">{user.name.split(" ")[0]}</Link>{(user as any).role === "admin" && <Link href="/admin" className="hidden text-sm font-semibold sm:inline">Admin</Link>}<Link href="/post" className="btn btn-primary !px-3 !py-2 text-sm">E’lon berish</Link><button className="btn btn-ghost !px-3 !py-2 text-sm" onClick={logout}>Chiqish</button></> : <><Link href="/login" className="btn btn-ghost !px-3 !py-2 text-sm">Kirish</Link><Link href="/post" className="btn btn-primary !px-3 !py-2 text-sm">E’lon berish</Link></>}</div></div></header>;
}
