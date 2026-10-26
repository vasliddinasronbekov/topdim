import Link from "next/link";
import { notFound } from "next/navigation";
import { CampusMap } from "@/components/campus-map";
import { ItemCard } from "@/components/item-card";
import { getDb } from "@/lib/db";
import { getLang } from "@/lib/i18n";
import { uniName } from "@/lib/format";

export default async function UniversityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const db = getDb();
  const uni = db.universities.find((u) => u.slug === slug);
  if (!uni) notFound();
  const lang = await getLang();
  const items = db.items.filter((i) => i.universityId === uni.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs uppercase tracking-[0.25em]">{uni.city}</p>
      <h1 className="serif mt-2 text-5xl">{uniName(uni, lang)}</h1>
      <p className="mt-3 max-w-xl">{lang === "uz" ? uni.blurbUz : uni.blurbEn}</p>
      <div className="mt-6 flex gap-3">
        <Link href={`/browse?universityId=${uni.id}`} className="btn btn-primary">
          {lang === "uz" ? "Doskani ochish" : "Open board"}
        </Link>
        <Link href={`/kiosk/${uni.slug}`} className="btn btn-ghost">
          Kiosk
        </Link>
      </div>
      <div className="mt-10">
        <CampusMap uni={uni} items={items} lang={lang} />
      </div>
      <h2 className="serif mt-12 text-3xl">{lang === "uz" ? "E’lonlar" : "Listings"}</h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} uni={uni} lang={lang} />
        ))}
      </div>
    </div>
  );
}
