import { redirect } from "next/navigation";
import { PostForm } from "@/components/post-form";
import { getUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getLang, t } from "@/lib/i18n";

export default async function PostPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const user = await getUser();
  if (!user) redirect("/login");
  const { kind } = await searchParams;
  const lang = await getLang();
  const unis = getDb().universities;

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="serif text-5xl">{t(lang, "postTitle")}</h1>
      <p className="mt-3 text-[var(--ink-soft)]">{t(lang, "postLead")}</p>
      <div className="mt-8">
        <PostForm
          lang={lang}
          universities={unis}
          defaultKind={kind}
          defaultUniversityId={user.universityId}
        />
      </div>
    </div>
  );
}
