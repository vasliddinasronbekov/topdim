"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, KINDS } from "@/lib/constants";
import { currentUser, postItem, universities } from "@/lib/api";
import type { Lang, University } from "@/lib/types";

export function PostForm({ lang, defaultKind }: { lang: Lang; defaultKind?: string }) {
  const router = useRouter(); const [list, setList] = useState<University[]>([]); const [uniId, setUniId] = useState(""); const [error, setError] = useState(""); const [pending, setPending] = useState(false);
  const [image, setImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const uni = useMemo(() => list.find((entry) => entry.id === uniId), [list, uniId]);
  useEffect(() => { const user = currentUser(); if (!user) { router.replace("/login"); return; } universities().then((data) => { setList(data); setUniId(user.universityId || data[0]?.id || ""); }).catch(() => setError("Universitetlar yuklanmadi.")); }, [router]);
  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  }
  async function submit(form: FormData) { setError(""); setPending(true); try {
    let description = String(form.get("description") || "");
    if (image) {
      description = description + "\n\n[IMAGE:" + image + "]";
    }
    const item = await postItem({ kind: String(form.get("kind")) as "lost" | "found", category: String(form.get("category")) as never, title: String(form.get("title")), description, universityId: uniId, spotId: String(form.get("spotId")), occurredAt: new Date(String(form.get("occurredAt"))).toISOString(), color: String(form.get("color")) || undefined, brand: String(form.get("brand")) || undefined, secretQuestion: String(form.get("secretQuestion")) || undefined, secretAnswer: String(form.get("secretAnswer")) || undefined }); router.push(`/items/${item.id}`); } catch (reason) { setError(reason instanceof Error ? reason.message : "E’lon joylanmadi."); setPending(false); } }
  return <form action={submit} className="card space-y-4 p-6"><div className="grid gap-3 sm:grid-cols-2"><select className="select" name="kind" defaultValue={defaultKind === "found" ? "found" : "lost"}>{KINDS.map((kind) => <option key={kind.id} value={kind.id}>{lang === "uz" ? kind.uz : kind.en}</option>)}</select><select className="select" name="category" defaultValue="electronics">{CATEGORIES.map((category) => <option key={category.id} value={category.id}>{category.emoji} {lang === "uz" ? category.uz : category.en}</option>)}</select></div><input className="input" name="title" required placeholder="Masalan: Oq AirPods" /><textarea className="textarea" name="description" required placeholder="Joy va belgi..." />
    <div className="space-y-2">
      <p className="text-sm font-medium">{lang === "uz" ? "Rasm qo‘shish" : "Add photo"}</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="btn btn-ghost !py-2 text-sm" onClick={() => fileInputRef.current?.click()}>{lang === "uz" ? "Galereyadan tanlash" : "From gallery"}</button>
        <button type="button" className="btn btn-ghost !py-2 text-sm" onClick={() => cameraInputRef.current?.click()}>{lang === "uz" ? "Kamera bilan suratga olish" : "Take photo"}</button>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageChange} />
      {image && <div className="relative w-full max-w-xs overflow-hidden rounded-xl"><img src={image} alt="preview" className="h-48 w-full object-cover" /><button type="button" className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-1 text-xs text-white" onClick={() => { setImage(null); if (fileInputRef.current) fileInputRef.current.value=""; if (cameraInputRef.current) cameraInputRef.current.value=""; }}>{lang === "uz" ? "O‘chirish" : "Remove"}</button></div>}
    </div>
    <div className="grid gap-3 sm:grid-cols-2"><select className="select" value={uniId} onChange={(event) => setUniId(event.target.value)} disabled={!list.length}>{list.map((entry) => <option key={entry.id} value={entry.id}>{entry.short}</option>)}</select><select className="select" name="spotId" required disabled={!uni}>{(uni?.spots || []).map((spot) => <option key={spot.id} value={spot.id}>{lang === "uz" ? spot.nameUz : spot.nameEn}</option>)}</select></div><input className="input" type="datetime-local" name="occurredAt" required /><div className="grid gap-3 sm:grid-cols-2"><input className="input" name="color" placeholder="Rang" /><input className="input" name="brand" placeholder="Brend / belgi" /></div><input className="input" name="secretQuestion" placeholder="Maxfiy savol (ixtiyoriy)" /><input className="input" name="secretAnswer" placeholder="Javob" />{error && <p className="text-sm text-[var(--coral)]">{error}</p>}<button className="btn btn-primary w-full" disabled={pending || !uni}>{pending ? "..." : lang === "uz" ? "E’lonni chiqarish" : "Publish"}</button></form>;
}
