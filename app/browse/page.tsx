"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { FilterBar } from "@/components/filter-bar";
import { ItemCard } from "@/components/item-card";
import { items, universities } from "@/lib/api";
import type { Item, University } from "@/lib/types";

export default function BrowsePage() {
  const search = useSearchParams(); const [list, setList] = useState<Item[]>([]); const [campuses, setCampuses] = useState<University[]>([]); const [error, setError] = useState("");
  const query = search.toString();
  useEffect(() => { Promise.all([items(query), universities()]).then(([nextItems, nextUniversities]) => { setList(nextItems); setCampuses(nextUniversities); }).catch((reason) => setError(reason instanceof Error ? reason.message : "E’lonlar yuklanmadi.")); }, [query]);
  const values = useMemo(() => Object.fromEntries(search.entries()), [search]);
  const selected = campuses.find((campus) => campus.id === values.universityId);
  const spots = (selected?.spots || campuses.flatMap((campus) => campus.spots)).map((spot) => ({ id: spot.id, name: spot.nameUz }));
  const uniById = Object.fromEntries(campuses.map((campus) => [campus.id, campus]));
  return <div className="mx-auto max-w-6xl px-4 py-10"><p className="text-xs uppercase tracking-[0.25em] text-[var(--ink-soft)]">Doska</p><h1 className="serif mt-2 text-5xl">E’lonlar</h1><p className="mt-3 max-w-2xl text-[var(--ink-soft)]">Tur, kategoriya, universitet, bino va sana - hammasi bir joyda.</p><div className="mt-8"><FilterBar lang="uz" universities={campuses} spots={spots} values={values} /></div>{error ? <p className="card mt-6 p-6 text-[var(--coral)]">{error}</p> : <><p className="mt-6 text-sm text-[var(--ink-soft)]">{list.length} ta e’lon</p>{list.length === 0 ? <p className="card mt-6 p-10 text-center text-[var(--ink-soft)]">Bu filtrlar bo‘yicha hozircha e’lon yo‘q.</p> : <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{list.map((item) => <ItemCard key={item.id} item={item} uni={uniById[item.universityId]} lang="uz" />)}</div>}</>}</div>;
}
