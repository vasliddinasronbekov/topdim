import { CATEGORIES, KINDS } from "@/lib/constants";
import { uniName } from "@/lib/format";
import type { Lang, University } from "@/lib/types";

export function FilterBar({
  lang,
  universities,
  spots,
  values,
}: {
  lang: Lang;
  universities: University[];
  spots: { id: string; name: string }[];
  values: Record<string, string | undefined>;
}) {
  return (
    <form className="card grid gap-3 p-4 md:grid-cols-7" action="/browse">
      <input
        className="input md:col-span-2"
        name="q"
        defaultValue={values.q ?? ""}
        placeholder={lang === "uz" ? "Qidiruv…" : "Search…"}
      />
      <select className="select" name="kind" defaultValue={values.kind ?? "all"}>
        <option value="all">{lang === "uz" ? "Turi" : "Type"}</option>
        {KINDS.map((k) => (
          <option key={k.id} value={k.id}>
            {lang === "uz" ? k.uz : k.en}
          </option>
        ))}
      </select>
      <select className="select" name="category" defaultValue={values.category ?? "all"}>
        <option value="all">{lang === "uz" ? "Kategoriya" : "Category"}</option>
        {CATEGORIES.map((c) => (
          <option key={c.id} value={c.id}>
            {c.emoji} {lang === "uz" ? c.uz : c.en}
          </option>
        ))}
      </select>
      <select className="select" name="universityId" defaultValue={values.universityId ?? "all"}>
        <option value="all">{lang === "uz" ? "Universitet" : "University"}</option>
        {universities.map((u) => (
          <option key={u.id} value={u.id}>
            {u.short} · {uniName(u, lang)}
          </option>
        ))}
      </select>
      <select className="select" name="spotId" defaultValue={values.spotId ?? "all"}>
        <option value="all">{lang === "uz" ? "Joy" : "Place"}</option>
        {spots.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>
      <button className="btn btn-primary" type="submit">
        {lang === "uz" ? "Mosla" : "Match"}
      </button>
      <div className="grid grid-cols-2 gap-3 md:col-span-7">
        <label className="text-xs text-[var(--ink-soft)]">
          {lang === "uz" ? "Dan" : "From"}
          <input className="input mt-1" type="date" name="from" defaultValue={values.from ?? ""} />
        </label>
        <label className="text-xs text-[var(--ink-soft)]">
          {lang === "uz" ? "Gacha" : "To"}
          <input className="input mt-1" type="date" name="to" defaultValue={values.to ?? ""} />
        </label>
      </div>
    </form>
  );
}
