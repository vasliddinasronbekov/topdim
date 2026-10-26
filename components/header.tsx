import Link from "next/link";
import { getLang, t } from "@/lib/i18n";
import { getUser } from "@/lib/auth";
import { logoutAction, setLangAction } from "@/lib/actions";

export async function Header() {
  const lang = await getLang();
  const user = await getUser();

  return (
    <header className="nav-blur sticky top-0 z-40">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="serif text-2xl tracking-tight">
          Topdim<span className="text-[var(--coral)]">!</span>
        </Link>
        <nav className="hidden items-center gap-5 text-sm font-medium md:flex">
          <Link href="/browse">{t(lang, "navBrowse")}</Link>
          <Link href="/matches">{t(lang, "navMatches")}</Link>
          <Link href="/map">{t(lang, "navMap")}</Link>
          <Link href="/universities">{t(lang, "navUnis")}</Link>
          <Link href="/partners">{t(lang, "navPartners")}</Link>
        </nav>
        <div className="flex items-center gap-2">
          <form action={setLangAction.bind(null, lang === "uz" ? "en" : "uz")}>
            <button className="chip bg-black/5" type="submit">
              {lang === "uz" ? "EN" : "UZ"}
            </button>
          </form>
          {user ? (
            <>
              <Link href="/dashboard" className="hidden text-sm font-semibold sm:inline">
                {user.name.split(" ")[0]}
              </Link>
              <Link href="/post" className="btn btn-primary !px-3 !py-2 text-sm">
                {t(lang, "navPost")}
              </Link>
              <form action={logoutAction}>
                <button className="btn btn-ghost !px-3 !py-2 text-sm" type="submit">
                  {t(lang, "logout")}
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-ghost !px-3 !py-2 text-sm">
                {t(lang, "login")}
              </Link>
              <Link href="/post" className="btn btn-primary !px-3 !py-2 text-sm">
                {t(lang, "navPost")}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
