import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getLang } from "@/lib/i18n";
import { personalMatches, reasonLabel } from "@/lib/matching";
import { getUniversity } from "@/lib/queries";
import { formatWhen, spotName } from "@/lib/format";

export default async function MatchesPage() {
  const user = await getUser();
  if (!user) redirect("/login");
  const lang = await getLang();
  const rows = personalMatches(user.id);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="serif text-5xl">{lang === "uz" ? "Sizning mosliklaringiz" : "Your matches"}</h1>
      <p className="mt-3 text-[var(--ink-soft)]">
        {lang === "uz"
          ? "Sizning ochiq e’lonlaringizga qarama-qarshi turdagi juftliklar."
          : "Opposite-type pairs for your open listings."}
      </p>
      <div className="mt-8 space-y-4">
        {rows.length === 0 && (
          <p className="card p-8">{lang === "uz" ? "Hozircha juftlik yo‘q." : "No pairs yet."}</p>
        )}
        {rows.map((row) => {
          const uni = getUniversity(row.item.universityId);
          return (
            <div key={`${row.mine.id}-${row.item.id}`} className="card grid gap-4 p-5 md:grid-cols-[1fr_auto_1fr]">
              <Link href={`/items/${row.mine.id}`}>
                <p className="text-xs uppercase text-[var(--ink-soft)]">
                  {row.mine.kind === "lost" ? (lang === "uz" ? "Siz yo‘qotdingiz" : "You lost") : lang === "uz" ? "Siz topdingiz" : "You found"}
                </p>
                <p className="serif mt-1 text-2xl">{row.mine.title}</p>
              </Link>
              <div className="flex flex-col items-center justify-center">
                <span className="serif text-3xl">{row.score}</span>
                <span className="text-center text-xs text-[var(--ink-soft)]">
                  {row.reasons.map((r) => reasonLabel(r, lang)).join(" · ")}
                </span>
              </div>
              <Link href={`/items/${row.item.id}`}>
                <p className="text-xs uppercase text-[var(--ink-soft)]">
                  {row.item.kind === "found" ? (lang === "uz" ? "Kimdir topdi" : "Someone found") : lang === "uz" ? "Kimdir qidiryapti" : "Someone is looking"}
                </p>
                <p className="serif mt-1 text-2xl">{row.item.title}</p>
                <p className="text-sm text-[var(--ink-soft)]">
                  {uni ? spotName(uni, row.item.spotId, lang) : ""} · {formatWhen(row.item.occurredAt, lang)}
                </p>
              </Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
