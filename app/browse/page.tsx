import { FilterBar } from "@/components/filter-bar";
import { ItemCard } from "@/components/item-card";
import { getDb } from "@/lib/db";
import { getLang, t } from "@/lib/i18n";
import { listItems } from "@/lib/queries";
import type { Category, Kind } from "@/lib/types";

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const lang = await getLang();
  const db = getDb();
  const items = listItems({
    q: sp.q,
    kind: (sp.kind as Kind) || "all",
    category: (sp.category as Category) || "all",
    universityId: sp.universityId || "all",
    spotId: sp.spotId || "all",
    from: sp.from,
    to: sp.to,
  });
  const uni = db.universities.find((u) => u.id === sp.universityId);
  const spots = (uni?.spots ?? db.universities.flatMap((u) => u.spots)).map((s) => ({
    id: s.id,
    name: lang === "uz" ? s.nameUz : s.nameEn,
  }));
  const uniqueSpots = Array.from(new Map(spots.map((s) => [s.id, s])).values());
  const uniById = Object.fromEntries(db.universities.map((u) => [u.id, u]));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs uppercase tracking-[0.25em] text-[var(--ink-soft)]">
        {lang === "uz" ? "Doska" : "The board"}
      </p>
      <h1 className="serif mt-2 text-5xl">{t(lang, "navBrowse")}</h1>
      <p className="mt-3 max-w-2xl text-[var(--ink-soft)]">
        {lang === "uz"
          ? "Tur, kategoriya, universitet, bino va sana — hammasi bir joyda."
          : "Type, category, campus, building and date — all on one board."}
      </p>
      <div className="mt-8">
        <FilterBar lang={lang} universities={db.universities} spots={uniqueSpots} values={sp} />
      </div>
      <p className="mt-6 text-sm text-[var(--ink-soft)]">
        {items.length} {lang === "uz" ? "ta e’lon" : "listings"}
      </p>
      {items.length === 0 ? (
        <p className="card mt-6 p-10 text-center text-[var(--ink-soft)]">{t(lang, "empty")}</p>
      ) : (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} uni={uniById[item.universityId]} lang={lang} />
          ))}
        </div>
      )}
    </div>
  );
}
