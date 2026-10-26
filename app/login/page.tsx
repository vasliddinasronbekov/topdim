import { LoginForm } from "@/components/auth-forms";
import { getLang, t } from "@/lib/i18n";

export default async function LoginPage() {
  const lang = await getLang();
  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="serif text-5xl">{t(lang, "login")}</h1>
      <p className="mt-3 text-[var(--ink-soft)]">
        {lang === "uz" ? "Kampus emailingiz bilan kiring." : "Use your campus email."}
      </p>
      <div className="mt-8">
        <LoginForm lang={lang} />
      </div>
    </div>
  );
}
