import Link from "next/link";
import type { Item, Lang, University } from "@/lib/types";
import { spotName, uniName } from "@/lib/format";

export function CampusMap({
  uni,
  items,
  lang,
}: {
  uni: University;
  items: Item[];
  lang: Lang;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between px-5 pt-5">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--ink-soft)]">{uni.short}</p>
          <h3 className="serif text-2xl">{uniName(uni, lang)}</h3>
        </div>
        <Link className="text-sm underline" href={`/universities/${uni.slug}`}>
          {lang === "uz" ? "Kampus" : "Campus"}
        </Link>
      </div>
      <div className="relative mx-5 my-5 h-72 overflow-hidden rounded-[1.4rem] bg-[var(--pine)]">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(#ffffff22 1px, transparent 1px), linear-gradient(90deg, #ffffff22 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="absolute left-[12%] top-[18%] h-24 w-32 rounded-lg bg-white/10" />
        <div className="absolute right-[18%] top-[28%] h-20 w-20 rounded-full bg-[var(--saffron)]/30" />
        <div className="absolute bottom-[16%] left-[30%] h-16 w-40 rounded-lg bg-white/10" />
        {uni.spots.map((spot) => {
          const count = items.filter((i) => i.spotId === spot.id && i.universityId === uni.id).length;
          return (
            <Link
              key={spot.id}
              href={`/browse?universityId=${uni.id}&spotId=${spot.id}`}
              className="map-dot"
              style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
              title={`${spotName(uni, spot.id, lang)} (${count})`}
            >
              <span className="absolute left-4 top-[-2px] whitespace-nowrap text-[11px] font-semibold text-white">
                {spotName(uni, spot.id, lang)}
                {count ? ` · ${count}` : ""}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
