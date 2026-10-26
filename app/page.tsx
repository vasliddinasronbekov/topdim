import Link from "next/link";
import { getLang, t } from "@/lib/i18n";
import { getDb } from "@/lib/db";
import { stats } from "@/lib/queries";
import { ItemCard } from "@/components/item-card";
import { categoryMeta } from "@/lib/constants";

export default async function Home() {
  const lang = await getLang();
  const db = getDb();
  const s = stats();
  const latest = [...db.items]
    .filter((i) => i.status !== "closed")
    .sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1))
    .slice(0, 6);
  const uniById = Object.fromEntries(db.universities.map((u) => [u.id, u]));

  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-10 pt-12 md:grid-cols-[1.15fr_0.85fr] md:pt-20">
        <div>
          <p className="chip bg-[var(--saffron)]/40">{t(lang, "heroKicker")}</p>
          <h1 className="serif mt-6 text-5xl leading-[1.05] tracking-tight md:text-7xl">
            {t(lang, "heroTitle")}
          </h1>
          <p className="mt-6 max-w-xl text-lg text-[var(--ink-soft)]">{t(lang, "heroBody")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/post?kind=lost" className="btn btn-coral">
              {t(lang, "ctaLost")}
            </Link>
            <Link href="/post?kind=found" className="btn btn-primary">
              {t(lang, "ctaFound")}
            </Link>
            <Link href="/browse" className="btn btn-ghost">
              {t(lang, "ctaBrowse")}
            </Link>
          </div>
          <dl className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              [s.open, t(lang, "statsItems")],
              [s.unis, t(lang, "statsUnis")],
              [`${s.reunited}+`, t(lang, "statsReunited")],
              [s.hours, t(lang, "statsHours")],
            ].map(([n, label]) => (
              <div key={String(label)}>
                <dt className="serif text-4xl">{n}</dt>
                <dd className="mt-1 text-xs uppercase tracking-wide text-[var(--ink-soft)]">{label}</dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative h-[460px]">
          <div className="card float absolute left-0 top-8 w-56 rotate-[-8deg] p-3">
            <div className="rounded-xl bg-[var(--coral)] p-6 text-4xl text-white">🎧</div>
            <p className="mt-3 font-semibold">AirPods Pro</p>
            <p className="text-sm text-[var(--ink-soft)]">WIUT · Cafe 12</p>
          </div>
          <div className="card float float-delay absolute right-2 top-24 w-56 rotate-[7deg] p-3">
            <div className="rounded-xl bg-[var(--pine)] p-6 text-4xl text-white">🪪</div>
            <p className="mt-3 font-semibold">Student ID</p>
            <p className="text-sm text-[var(--ink-soft)]">NUUz · Darvoza</p>
          </div>
          <div className="card absolute bottom-6 left-16 w-64 rotate-[-2deg] p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">
              {lang === "uz" ? "Moslik" : "Match"} · 92%
            </p>
            <p className="serif mt-2 text-2xl">
              {lang === "uz" ? "Bir kampus, bir soat, bir rang." : "Same campus, hour, and color."}
            </p>
          </div>
        </div>
      </section>

      <div className="marquee py-4">
        <div className="marquee-track text-sm font-semibold uppercase tracking-[0.25em] text-[var(--ink-soft)]">
          {[...db.universities, ...db.universities].map((u, i) => (
            <span key={i}>{u.short}</span>
          ))}
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="serif text-4xl">{t(lang, "howTitle")}</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {[
            ["01", t(lang, "how1t"), t(lang, "how1d")],
            ["02", t(lang, "how2t"), t(lang, "how2d")],
            ["03", t(lang, "how3t"), t(lang, "how3d")],
          ].map(([n, title, body]) => (
            <article key={n} className="card p-6">
              <p className="serif text-3xl text-[var(--leaf)]">{n}</p>
              <h3 className="serif mt-3 text-2xl">{title}</h3>
              <p className="mt-3 text-[var(--ink-soft)]">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-8">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="serif text-4xl">{lang === "uz" ? "Yangi e’lonlar" : "Fresh on the board"}</h2>
          <Link href="/browse" className="underline">
            {t(lang, "ctaBrowse")}
          </Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((item) => (
            <ItemCard key={item.id} item={item} uni={uniById[item.universityId]} lang={lang} />
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12">
        <div className="card overflow-hidden bg-[var(--pine)] p-8 text-[#f7f1e7] md:p-12">
          <p className="text-xs uppercase tracking-[0.25em] text-[var(--saffron)]">
            {lang === "uz" ? "Universitetlar uchun" : "For universities"}
          </p>
          <h2 className="serif mt-3 max-w-2xl text-4xl md:text-5xl">{t(lang, "partnersTitle")}</h2>
          <p className="mt-4 max-w-xl text-[#d7cbb8]">{t(lang, "partnersLead")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/partners" className="btn btn-saffron">
              {lang === "uz" ? "Hamkor bo‘lish" : "Become a partner"}
            </Link>
            <Link href="/kiosk/wiut" className="btn btn-ghost border-white/20 text-white">
              {t(lang, "kiosk")}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-3 px-4 pb-16 sm:grid-cols-4">
        {["documents", "electronics", "books", "keys"].map((id) => {
          const c = categoryMeta(id as never);
          return (
            <Link key={id} href={`/browse?category=${id}`} className="card p-5 hover:-translate-y-0.5">
              <span className="text-3xl">{c.emoji}</span>
              <p className="mt-2 font-semibold">{lang === "uz" ? c.uz : c.en}</p>
            </Link>
          );
        })}
      </section>
    </div>
  );
}
