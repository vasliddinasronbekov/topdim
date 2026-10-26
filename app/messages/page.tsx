import Link from "next/link";
import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getLang } from "@/lib/i18n";

export default async function MessagesPage() {
  const user = await getUser();
  if (!user) redirect("/login");
  const lang = await getLang();
  const db = getDb();
  const threads = db.threads.filter((t) => t.userA === user.id || t.userB === user.id);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="serif text-5xl">{lang === "uz" ? "Xabarlar" : "Messages"}</h1>
      <div className="mt-8 space-y-3">
        {threads.map((th) => {
          const otherId = th.userA === user.id ? th.userB : th.userA;
          const other = db.users.find((u) => u.id === otherId);
          const item = db.items.find((i) => i.id === th.itemId);
          const last = db.messages.filter((m) => m.threadId === th.id).at(-1);
          return (
            <Link key={th.id} href={`/messages/${th.id}`} className="card block p-5 hover:-translate-y-0.5">
              <p className="font-semibold">{other?.name}</p>
              <p className="text-sm text-[var(--ink-soft)]">{item?.title}</p>
              <p className="mt-2 text-sm">{last?.body}</p>
            </Link>
          );
        })}
        {threads.length === 0 && <p>{lang === "uz" ? "Hali suhbat yo‘q." : "No threads yet."}</p>}
      </div>
    </div>
  );
}
