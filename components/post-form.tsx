"use client";

import { useActionState, useMemo, useState } from "react";
import { createItemAction } from "@/lib/actions";
import { CATEGORIES, KINDS } from "@/lib/constants";
import type { Lang, University } from "@/lib/types";

export function PostForm({
  lang,
  universities,
  defaultKind,
  defaultUniversityId,
}: {
  lang: Lang;
  universities: University[];
  defaultKind?: string;
  defaultUniversityId?: string;
}) {
  const [state, action, pending] = useActionState(createItemAction, null);
  const [uniId, setUniId] = useState(defaultUniversityId || universities[0]?.id);
  const uni = useMemo(() => universities.find((u) => u.id === uniId), [universities, uniId]);

  return (
    <form action={action} className="card space-y-4 p-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <select className="select" name="kind" defaultValue={defaultKind === "found" ? "found" : "lost"}>
          {KINDS.map((k) => (
            <option key={k.id} value={k.id}>
              {lang === "uz" ? k.uz : k.en}
            </option>
          ))}
        </select>
        <select className="select" name="category" defaultValue="electronics">
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji} {lang === "uz" ? c.uz : c.en}
            </option>
          ))}
        </select>
      </div>
      <input
        className="input"
        name="title"
        required
        placeholder={lang === "uz" ? "Masalan: Oq AirPods, yashil stiker" : "e.g. White AirPods, green sticker"}
      />
      <textarea
        className="textarea"
        name="description"
        required
        placeholder={lang === "uz" ? "Joy, belgi, nima ichida edi…" : "Place, marks, what was inside…"}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <select className="select" name="universityId" value={uniId} onChange={(e) => setUniId(e.target.value)}>
          {universities.map((u) => (
            <option key={u.id} value={u.id}>
              {u.short}
            </option>
          ))}
        </select>
        <select className="select" name="spotId" required>
          {(uni?.spots ?? []).map((s) => (
            <option key={s.id} value={s.id}>
              {lang === "uz" ? s.nameUz : s.nameEn}
            </option>
          ))}
        </select>
      </div>
      <input className="input" type="datetime-local" name="occurredAt" required />
      <div className="grid gap-3 sm:grid-cols-2">
        <input className="input" name="color" placeholder={lang === "uz" ? "Rang" : "Color"} />
        <input className="input" name="brand" placeholder={lang === "uz" ? "Brend / belgi" : "Brand / mark"} />
      </div>
      <input
        className="input"
        name="secretQuestion"
        placeholder={lang === "uz" ? "Maxfiy savol (ixtiyoriy)" : "Secret question (optional)"}
      />
      <input className="input" name="secretAnswer" placeholder={lang === "uz" ? "Javob" : "Answer"} />
      {state && "error" in state && state.error ? (
        <p className="text-sm text-[var(--coral)]">{state.error}</p>
      ) : null}
      <button className="btn btn-primary w-full" disabled={pending}>
        {pending ? "…" : lang === "uz" ? "E’lonni chiqarish" : "Publish"}
      </button>
    </form>
  );
}
