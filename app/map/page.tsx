import { CampusMap } from "@/components/campus-map";
import { getDb } from "@/lib/db";
import { getLang } from "@/lib/i18n";

export default async function MapPage() {
  const lang = await getLang();
  const db = getDb();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="serif text-5xl">{lang === "uz" ? "Kampus xaritasi" : "Campus maps"}</h1>
      <p className="mt-3 max-w-2xl text-[var(--ink-soft)]">
        {lang === "uz"
          ? "Nuqtani bosing — o‘sha joydagi e’lonlar ochiladi."
          : "Tap a pin to open listings from that spot."}
      </p>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {db.universities.map((uni) => (
          <CampusMap key={uni.id} uni={uni} items={db.items} lang={lang} />
        ))}
      </div>
    </div>
  );
}
