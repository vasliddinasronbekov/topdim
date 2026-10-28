import Link from "next/link";
import { notFound } from "next/navigation";
import { ClaimForm } from "@/components/claim-form";
import { ItemPoster } from "@/components/item-poster";
import { getUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { formatWhen, spotName, uniName } from "@/lib/format";
import { getLang } from "@/lib/i18n";
import { matchesFor, reasonLabel } from "@/lib/matching";
import { getItem, getUniversity } from "@/lib/queries";
import { categoryMeta } from "@/lib/constants";
import { getItemApi, universities as apiUniversities } from "@/lib/api";
import type { Item } from "@/lib/types";

export default async function ItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let item: Item | null = getItem(id);
  if (!item) {
    item = await getItemApi(id);
  }
  if (!item) notFound();
  let uni = getUniversity(item.universityId);
  if (!uni) {
    try {
      const list = await apiUniversities();
      uni = list.find((u) => u.id === item!.universityId) || null;
      if (uni && !uni.spots.find((s) => s.id === item!.spotId)) {
        uni = { ...uni, spots: [...uni.spots, { id: item!.spotId, nameUz: (item as any).spot_name || item!.spotId, nameEn: (item as any).spot_name || item!.spotId, x: 50, y: 50 }] } as any;
      }
    } catch {}
  }
  if (!uni) {
    uni = {
      id: item.universityId,
      slug: item.universityId,
      nameUz: (item as any).university_name || item.universityId,
      nameEn: (item as any).university_name || item.universityId,
      short: ((item as any).university_name || item.universityId).toString().slice(0, 4).toUpperCase(),
      city: "",
      students: 0,
      partner: "none",
      accent: "#14372c",
      blurbUz: "",
      blurbEn: "",
      spots: [{ id: item.spotId, nameUz: (item as any).spot_name || item.spotId, nameEn: (item as any).spot_name || item.spotId, x: 50, y: 50 }],
    } as any;
  }
  const lang = await getLang();
  const user = await getUser();
  const db = getDb();
  const owner = db.users.find((u) => u.id === item.userId);
  const hits = matchesFor(item);
  const cat = categoryMeta(item.category);
  const desc = String((item as any).description || "");
  const imgMatch = desc.match(/\[IMAGE:(data:image\/[^;]+;base64,[^\]]+)\]/);
  const cleanDesc = imgMatch ? desc.replace(imgMatch[0], "").trim() : desc;

  return (
    <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 lg:grid-cols-[1.1fr_0.9fr]">
      <article>
        <ItemPoster item={item} className="min-h-[280px]" />
        {imgMatch && <img src={imgMatch[1]} alt={item.title} className="mt-4 w-full max-h-[420px] rounded-2xl object-cover" />}
        <div className="mt-5 flex flex-wrap gap-2">
          <span className={item.kind === "lost" ? "chip chip-lost" : "chip chip-found"}>
            {item.kind === "lost" ? (lang === "uz" ? "Yo‘qolgan" : "Lost") : lang === "uz" ? "Topilgan" : "Found"}
          </span>
          <span className="chip bg-black/5">
            {cat.emoji} {lang === "uz" ? cat.uz : cat.en}
          </span>
          <span className="chip bg-black/5">{item.status}</span>
        </div>
        <h1 className="serif mt-4 text-4xl md:text-5xl">{item.title}</h1>
        <p className="mt-4 text-lg leading-relaxed text-[var(--ink-soft)] whitespace-pre-line">{cleanDesc || desc.replace(/\[IMAGE:[^\]]+\]/, "").trim()}</p>
        <dl className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="card p-4">
            <dt className="text-xs uppercase tracking-wide text-[var(--ink-soft)]">
              {lang === "uz" ? "Joy" : "Place"}
            </dt>
            <dd className="mt-1 font-semibold">
              {uni ? uniName(uni, lang) : (item as any).university_name || item.universityId} · {uni ? spotName(uni, item.spotId, lang) : (item as any).spot_name || item.spotId}
            </dd>
          </div>
          <div className="card p-4">
            <dt className="text-xs uppercase tracking-wide text-[var(--ink-soft)]">
              {lang === "uz" ? "Vaqt" : "When"}
            </dt>
            <dd className="mt-1 font-semibold">{formatWhen(item.occurredAt, lang)}</dd>
          </div>
        </dl>
        <p className="mt-4 text-sm text-[var(--ink-soft)]">
          {lang === "uz" ? "E’lon muallifi" : "Posted by"} · {owner?.name ?? (item as any).userId ?? "—"}
        </p>
        {user && user.id !== item.userId && item.status !== "reunited" ? (
          <ClaimForm itemId={item.id} secretQuestion={item.secretQuestion} lang={lang} />
        ) : !user ? (
          <p className="mt-6">
            <Link className="btn btn-primary" href="/login">
              {lang === "uz" ? "So‘rov uchun kiring" : "Log in to claim"}
            </Link>
          </p>
        ) : null}
      </article>
      <aside>
        <h2 className="serif text-3xl">{lang === "uz" ? "Mos kelishi mumkin" : "Likely matches"}</h2>
        <p className="mt-2 text-sm text-[var(--ink-soft)]">
          {lang === "uz"
            ? "Kategoriya, kampus, joy va 14 kunlik oyna bo‘yicha ball."
            : "Scored by category, campus, spot and a 14-day window."}
        </p>
        <div className="mt-5 space-y-3">
          {hits.length === 0 && (
            <p className="card p-5 text-sm text-[var(--ink-soft)]">
              {lang === "uz" ? "Hozircha juftlik yo‘q — e’lon doskada qoladi." : "No pair yet — it stays on the board."}
            </p>
          )}
          {hits.map((hit) => {
            const hu = getUniversity(hit.item.universityId) || uni;
            return (
              <Link key={hit.item.id} href={`/items/${hit.item.id}`} className="card block p-4 hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{hit.item.title}</p>
                    <p className="text-sm text-[var(--ink-soft)]">
                      {hu ? spotName(hu, hit.item.spotId, lang) : (hit.item as any).spot_name || ""} · {formatWhen(hit.item.occurredAt, lang)}
                    </p>
                    <p className="mt-2 text-xs text-[var(--pine-2)]">
                      {hit.reasons.map((r) => reasonLabel(r, lang)).join(" · ")}
                    </p>
                  </div>
                  <span className="serif text-2xl">{hit.score}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </aside>
    </div>
  );
}
