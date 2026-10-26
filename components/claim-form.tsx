"use client";

import { useActionState } from "react";
import { claimAction } from "@/lib/actions";
import type { Lang } from "@/lib/types";

export function ClaimForm({
  itemId,
  secretQuestion,
  lang,
}: {
  itemId: string;
  secretQuestion?: string;
  lang: Lang;
}) {
  const [state, action, pending] = useActionState(claimAction, null);
  return (
    <form action={action} className="card mt-6 space-y-3 p-5">
      <input type="hidden" name="itemId" value={itemId} />
      <h3 className="serif text-2xl">{lang === "uz" ? "Xavfsiz so‘rov" : "Safe claim"}</h3>
      {secretQuestion && (
        <label className="block text-sm">
          {secretQuestion}
          <input className="input mt-1" name="secretAttempt" />
        </label>
      )}
      <textarea
        className="textarea"
        name="message"
        placeholder={
          lang === "uz"
            ? "Qayerda yo‘qotganingiz, nima farqlashi — qisqa yozing."
            : "Where you lost it, what makes it yours."
        }
      />
      {state && "error" in state && state.error ? (
        <p className="text-sm text-[var(--coral)]">{state.error}</p>
      ) : null}
      <button className="btn btn-primary" disabled={pending}>
        {pending ? "…" : lang === "uz" ? "Xabar va so‘rov yuborish" : "Send claim & message"}
      </button>
    </form>
  );
}
