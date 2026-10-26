import Link from "next/link";
import { getLang, t } from "@/lib/i18n";

export async function Footer() {
  const lang = await getLang();
  return (
    <footer className="mt-20 border-t border-[var(--line)]">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 md:flex-row md:justify-between">
        <div>
          <p className="serif text-3xl">
            Topdim<span className="text-[var(--coral)]">!</span>
          </p>
          <p className="mt-3 max-w-sm text-sm text-[var(--ink-soft)]">{t(lang, "footer")}</p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm">
          <div className="space-y-2">
            <Link className="block" href="/browse">
              {t(lang, "navBrowse")}
            </Link>
            <Link className="block" href="/how-it-works">
              {t(lang, "navHow")}
            </Link>
            <Link className="block" href="/matches">
              {t(lang, "navMatches")}
            </Link>
          </div>
          <div className="space-y-2">
            <Link className="block" href="/universities">
              {t(lang, "navUnis")}
            </Link>
            <Link className="block" href="/partners">
              {t(lang, "navPartners")}
            </Link>
            <Link className="block" href="/login">
              {t(lang, "login")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
