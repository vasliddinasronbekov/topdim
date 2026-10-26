import { RegisterForm } from "@/components/auth-forms";
import { getDb } from "@/lib/db";
import { getLang, t } from "@/lib/i18n";

export default async function RegisterPage() {
  const lang = await getLang();
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="serif text-5xl">{t(lang, "register")}</h1>
      <p className="mt-3 text-[var(--ink-soft)]">
        {lang === "uz" ? "Talabalar uchun bepul." : "Free for students."}
      </p>
      <div className="mt-8">
        <RegisterForm lang={lang} universities={getDb().universities} />
      </div>
    </div>
  );
}
