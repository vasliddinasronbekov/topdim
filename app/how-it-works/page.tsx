import Link from "next/link";
import { getLang, t } from "@/lib/i18n";

export default async function HowPage() {
  const lang = await getLang();
  const steps = [
    {
      t: lang === "uz" ? "E’lon — faktlar bilan" : "A listing with facts",
      d:
        lang === "uz"
          ? "Tur (yo‘qolgan/topilgan), kategoriya, kampus, bino, sana-soat, rang va maxfiy savol."
          : "Type, category, campus, building, timestamp, color and an optional secret question.",
    },
    {
      t: lang === "uz" ? "Moslashtirish" : "Matching",
      d:
        lang === "uz"
          ? "Qarama-qarshi turdagi e’lonlar solishtiriladi. Bir kampus + bir kategoriya asosiy ball. 6 soat ichida bo‘lsa — yuqori, 14 kundan so‘ng — past."
          : "Opposite types are compared. Same campus and category carry the base score. Within 6 hours ranks high; after 14 days it fades.",
    },
    {
      t: lang === "uz" ? "Ishonch" : "Trust",
      d:
        lang === "uz"
          ? "Telefon ochiq e’londa yo‘q. Avval maxfiy savol va ichki chat. Tasdiqlangach status «qaytdi» bo‘ladi."
          : "No public phone numbers. Secret question and in-app chat first. Once accepted, status becomes reunited.",
    },
    {
      t: lang === "uz" ? "Universitetlar" : "Universities",
      d:
        lang === "uz"
          ? "Obuna: kampus doskasi, analitika, kutubxona kioski. Homiylar — saffron chiziq va tadbirlar."
          : "Subscription: campus board, analytics, library kiosk. Sponsors get the saffron stripe and events.",
    },
  ];
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="serif text-5xl">{t(lang, "navHow")}</h1>
      <div className="mt-10 space-y-5">
        {steps.map((s, i) => (
          <article key={s.t} className="card p-6">
            <p className="serif text-2xl text-[var(--leaf)]">0{i + 1}</p>
            <h2 className="serif mt-2 text-3xl">{s.t}</h2>
            <p className="mt-3 text-[var(--ink-soft)]">{s.d}</p>
          </article>
        ))}
      </div>
      <Link href="/post" className="btn btn-primary mt-10">
        {t(lang, "navPost")}
      </Link>
    </div>
  );
}
