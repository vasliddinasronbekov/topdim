import { notFound, redirect } from "next/navigation";
import { MessageForm } from "@/components/message-form";
import { getUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getLang } from "@/lib/i18n";
import { formatWhen } from "@/lib/format";
import Link from "next/link";

export default async function ThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUser();
  if (!user) redirect("/login");
  const { id } = await params;
  const db = getDb();
  const thread = db.threads.find((t) => t.id === id);
  if (!thread || (thread.userA !== user.id && thread.userB !== user.id)) notFound();
  const lang = await getLang();
  const msgs = db.messages.filter((m) => m.threadId === id);
  const item = db.items.find((i) => i.id === thread.itemId);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/messages" className="text-sm underline">
        ← {lang === "uz" ? "Xabarlar" : "Messages"}
      </Link>
      <h1 className="serif mt-4 text-4xl">{item?.title}</h1>
      <div className="mt-8 space-y-3">
        {msgs.map((m) => (
          <div
            key={m.id}
            className={`max-w-[85%] rounded-2xl p-4 ${
              m.fromUserId === user.id ? "ml-auto bg-[var(--pine)] text-white" : "card"
            }`}
          >
            <p>{m.body}</p>
            <p className="mt-1 text-[10px] opacity-70">{formatWhen(m.createdAt, lang)}</p>
          </div>
        ))}
      </div>
      <MessageForm threadId={thread.id} lang={lang} />
    </div>
  );
}
