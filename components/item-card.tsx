import Link from "next/link";
import { ItemPoster } from "./item-poster";
import { categoryMeta } from "@/lib/constants";
import { formatWhen, spotName, uniName } from "@/lib/format";
import type { Item, Lang, University } from "@/lib/types";

export function ItemCard({
  item,
  uni,
  lang,
}: {
  item: Item;
  uni: University;
  lang: Lang;
}) {
  const cat = categoryMeta(item.category);
  return (
    <Link href={`/items/${item.id}`} className="card group block overflow-hidden transition hover:-translate-y-1">
      <ItemPoster item={item} />
      <div className="space-y-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className={item.kind === "lost" ? "chip chip-lost" : "chip chip-found"}>
            {item.kind === "lost" ? (lang === "uz" ? "Yo‘qolgan" : "Lost") : lang === "uz" ? "Topilgan" : "Found"}
          </span>
          <span className="chip bg-black/5">
            {cat.emoji} {lang === "uz" ? cat.uz : cat.en}
          </span>
          {item.status === "reunited" && (
            <span className="chip bg-saffron/30">{lang === "uz" ? "Qaytdi" : "Home"}</span>
          )}
        </div>
        <h3 className="serif text-xl leading-snug">{item.title}</h3>
        <p className="text-sm text-[var(--ink-soft)]">
          {uniName(uni, lang)} · {spotName(uni, item.spotId, lang)}
        </p>
        <p className="text-xs uppercase tracking-wide text-[var(--ink-soft)]">
          {formatWhen(item.occurredAt, lang)}
        </p>
      </div>
    </Link>
  );
}
