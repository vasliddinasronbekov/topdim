"use client";

import { useActionState } from "react";
import { sendMessageAction } from "@/lib/actions";

export function MessageForm({ threadId, lang }: { threadId: string; lang: "uz" | "en" }) {
  const [state, action, pending] = useActionState(sendMessageAction, null);
  return (
    <form action={action} className="mt-4 flex gap-2">
      <input type="hidden" name="threadId" value={threadId} />
      <input
        className="input"
        name="body"
        placeholder={lang === "uz" ? "Xabar…" : "Message…"}
      />
      <button className="btn btn-primary" disabled={pending}>
        {lang === "uz" ? "Yubor" : "Send"}
      </button>
      {state && "error" in state && state.error ? (
        <p className="text-sm text-[var(--coral)]">{state.error}</p>
      ) : null}
    </form>
  );
}
