"use client";

import { useActionState } from "react";
import { partnerLeadAction } from "@/lib/actions";
import type { Lang } from "@/lib/types";

export function PartnerForm({ lang }: { lang: Lang }) {
  const [state, action, pending] = useActionState(partnerLeadAction, null);
  if (state && "ok" in state) {
    return (
      <div className="card p-8">
        <p className="serif text-3xl">{lang === "uz" ? "Qabul qilindi." : "We got it."}</p>
        <p className="mt-2 text-[var(--ink-soft)]">
          {lang === "uz"
            ? "Kampus jamoasi 48 soat ichida yozadi."
            : "Campus team writes back within 48 hours."}
        </p>
      </div>
    );
  }
  return (
    <form action={action} className="card space-y-3 p-6">
      <input className="input" name="org" required placeholder={lang === "uz" ? "Universitet / tashkilot" : "University / org"} />
      <input className="input" name="email" type="email" required placeholder="email" />
      <select className="select" name="kind">
        <option value="campus">{lang === "uz" ? "Kampus obunasi" : "Campus subscription"}</option>
        <option value="kiosk">Kiosk</option>
        <option value="gold">{lang === "uz" ? "Homiylik / gold" : "Sponsorship / gold"}</option>
      </select>
      <textarea className="textarea" name="note" placeholder={lang === "uz" ? "Qisqa maqsad" : "What you need"} />
      {state && "error" in state && state.error ? (
        <p className="text-sm text-[var(--coral)]">{state.error}</p>
      ) : null}
      <button className="btn btn-saffron w-full" disabled={pending}>
        {lang === "uz" ? "Murojaat yuborish" : "Send inquiry"}
      </button>
    </form>
  );
}
