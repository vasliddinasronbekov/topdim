import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/lib/db";
import { getLang } from "@/lib/i18n";
import { formatWhen, spotName, uniName } from "@/lib/format";

export default async function KioskPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const db = getDb();
  const uni = db.universities.find((u) => u.slug === slug);
  if (!uni) notFound();
  const lang = await getLang();
  const items = db.items
    .filter((i) => i.universityId === uni.id && i.status !== "closed")
    .sort((a, b) => (a.occurredAt < b.occurredAt ? 1 : -1))
    .slice(0, 8);

  return (
    <div className="min-h-[80vh] bg-[var(--pine)] px-6 py-8 text-[#f7f1e7]">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 p-8">
        <div className="kiosk-scan" />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="serif text-5xl">
              Topdim<span className="text-[var(--saffron)]">!</span>
            </p>
            <p className="mt-2 text-sm uppercase tracking-[0.3em] text-[var(--saffron)]">{uniName(uni, lang)}</p>
          </div>
          <Link href={`/post?kind=found`} className="btn btn-saffron">
            QR · {lang === "uz" ? "Topdim" : "I found this"}
          </Link>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {items.map((item) => (
            <Link key={item.id} href={`/items/${item.id}`} className="rounded-2xl bg-white/8 p-5">
              <div className="flex items-center justify-between">
                <span className="text-3xl">{item.emoji}</span>
                <span className="text-xs uppercase tracking-widest text-[var(--saffron)]">{item.kind}</span>
              </div>
              <p className="serif mt-3 text-2xl">{item.title}</p>
              <p className="mt-2 text-sm text-[#d7cbb8]">
                {spotName(uni, item.spotId, lang)} · {formatWhen(item.occurredAt, lang)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
