import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getLang } from "@/lib/i18n";
import { resolveClaimAction } from "@/lib/actions";
import { ItemCard } from "@/components/item-card";

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) redirect("/login");
  const lang = await getLang();
  const db = getDb();
  const mine = db.items.filter((i) => i.userId === user.id);
  const claimsIn = db.claims.filter((c) => mine.some((i) => i.id === c.itemId));
  const claimsOut = db.claims.filter((c) => c.fromUserId === user.id);
  const uniById = Object.fromEntries(db.universities.map((u) => [u.id, u]));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs uppercase tracking-[0.25em] text-[var(--ink-soft)]">{user.email}</p>
      <h1 className="serif mt-2 text-5xl">{user.name}</h1>
      <div className="mt-6 flex flex-wrap gap-3">
        <Link href="/post" className="btn btn-primary">
          {lang === "uz" ? "Yangi e’lon" : "New listing"}
        </Link>
        <Link href="/messages" className="btn btn-ghost">
          {lang === "uz" ? "Xabarlar" : "Messages"}
        </Link>
        <Link href="/matches" className="btn btn-ghost">
          {lang === "uz" ? "Mosliklar" : "Matches"}
        </Link>
      </div>

      <h2 className="serif mt-12 text-3xl">{lang === "uz" ? "Mening e’lonlarim" : "My listings"}</h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {mine.map((item) => (
          <ItemCard key={item.id} item={item} uni={uniById[item.universityId]} lang={lang} />
        ))}
        {mine.length === 0 && <p className="text-[var(--ink-soft)]">{lang === "uz" ? "Hali e’lon yo‘q." : "No listings yet."}</p>}
      </div>

      <h2 className="serif mt-12 text-3xl">{lang === "uz" ? "Kiruvchi so‘rovlar" : "Incoming claims"}</h2>
      <div className="mt-4 space-y-3">
        {claimsIn.map((c) => {
          const from = db.users.find((u) => u.id === c.fromUserId);
          const item = db.items.find((i) => i.id === c.itemId);
          return (
            <div key={c.id} className="card p-5">
              <p className="font-semibold">
                {from?.name} → {item?.title}
              </p>
              <p className="mt-1 text-sm text-[var(--ink-soft)]">{c.message}</p>
              {c.secretAttempt && (
                <p className="mt-1 text-xs">
                  {lang === "uz" ? "Javob" : "Answer"}: {c.secretAttempt}
                </p>
              )}
              {c.status === "pending" && (
                <div className="mt-3 flex gap-2">
                  <form action={resolveClaimAction}>
                    <input type="hidden" name="claimId" value={c.id} />
                    <input type="hidden" name="decision" value="accepted" />
                    <button className="btn btn-primary !py-2 text-sm">
                      {lang === "uz" ? "Tasdiqlash" : "Accept"}
                    </button>
                  </form>
                  <form action={resolveClaimAction}>
                    <input type="hidden" name="claimId" value={c.id} />
                    <input type="hidden" name="decision" value="declined" />
                    <button className="btn btn-ghost !py-2 text-sm">
                      {lang === "uz" ? "Rad etish" : "Decline"}
                    </button>
                  </form>
                </div>
              )}
              {c.status !== "pending" && <p className="mt-2 text-sm capitalize">{c.status}</p>}
            </div>
          );
        })}
        {claimsIn.length === 0 && <p className="text-sm text-[var(--ink-soft)]">—</p>}
      </div>

      <h2 className="serif mt-12 text-3xl">{lang === "uz" ? "Mening so‘rovlarim" : "My claims"}</h2>
      <ul className="mt-4 space-y-2">
        {claimsOut.map((c) => {
          const item = db.items.find((i) => i.id === c.itemId);
          return (
            <li key={c.id} className="card p-4">
              <Link href={`/items/${c.itemId}`} className="font-semibold">
                {item?.title}
              </Link>
              <span className="ml-2 text-sm text-[var(--ink-soft)]">{c.status}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
