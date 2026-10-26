import Link from "next/link";
import { getDb } from "@/lib/db";
import { getLang } from "@/lib/i18n";
import { uniName } from "@/lib/format";

export default async function UniversitiesPage() {
  const lang = await getLang();
  const unis = getDb().universities;
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="serif text-5xl">{lang === "uz" ? "Kampuslar" : "Campuses"}</h1>
      <p className="mt-3 max-w-2xl text-[var(--ink-soft)]">
        {lang === "uz"
          ? "Har bir universitet — o‘z doskasi, o‘z nuqtalari, o‘z kioski."
          : "Each university gets its own board, spots, and optional kiosk."}
      </p>
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {unis.map((u) => (
          <Link key={u.id} href={`/universities/${u.slug}`} className="card overflow-hidden hover:-translate-y-1">
            <div className="h-3" style={{ background: u.accent }} />
            <div className="p-6">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.2em]">{u.short}</p>
                {u.partner !== "none" && (
                  <span className="chip bg-[var(--saffron)]/30">{u.partner}</span>
                )}
              </div>
              <h2 className="serif mt-2 text-3xl">{uniName(u, lang)}</h2>
              <p className="mt-2 text-sm text-[var(--ink-soft)]">
                {u.city} · {u.students.toLocaleString()} {lang === "uz" ? "talaba" : "students"}
              </p>
              <p className="mt-3">{lang === "uz" ? u.blurbUz : u.blurbEn}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
