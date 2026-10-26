import { PartnerForm } from "@/components/partner-form";
import { getLang, t } from "@/lib/i18n";

export default async function PartnersPage() {
  const lang = await getLang();
  const tiers = [
    {
      name: "Campus",
      price: lang === "uz" ? "obuna / yil" : "/ year",
      points:
        lang === "uz"
          ? ["Brendlangan doska", "Moderatsiya", "Oylik hisobot"]
          : ["Branded board", "Moderation", "Monthly report"],
    },
    {
      name: "Kiosk",
      price: lang === "uz" ? "ekran + obuna" : "screen + sub",
      points:
        lang === "uz"
          ? ["Kutubxona / atrium ekrani", "QR orqali e’lon", "Jonli lenta"]
          : ["Library / atrium screen", "QR to post", "Live feed"],
    },
    {
      name: "Gold",
      price: lang === "uz" ? "homiylik" : "sponsor",
      points:
        lang === "uz"
          ? ["Saffron chiziq", "Tadbir hamkorligi", "Talaba ambassadorlar"]
          : ["Saffron stripe", "Event partnership", "Student ambassadors"],
    },
  ];
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="serif max-w-3xl text-5xl md:text-6xl">{t(lang, "partnersTitle")}</h1>
      <p className="mt-4 max-w-2xl text-lg text-[var(--ink-soft)]">{t(lang, "partnersLead")}</p>
      <div className="mt-10 grid gap-5 md:grid-cols-3">
        {tiers.map((tier) => (
          <article key={tier.name} className="card p-6">
            <p className="text-xs uppercase tracking-[0.2em]">{tier.name}</p>
            <p className="serif mt-2 text-3xl">{tier.price}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {tier.points.map((p) => (
                <li key={p}>· {p}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
      <div className="mt-12 grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="serif text-3xl">{lang === "uz" ? "Muloqot" : "Talk to us"}</h2>
          <p className="mt-2 text-[var(--ink-soft)]">
            {lang === "uz"
              ? "Talabalar bepul. Universitetlar — xizmat. Homiylar — ko‘rinish."
              : "Students free. Universities as a service. Sponsors for presence."}
          </p>
        </div>
        <PartnerForm lang={lang} />
      </div>
    </div>
  );
}
