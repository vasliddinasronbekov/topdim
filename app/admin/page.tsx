import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { getLang } from "@/lib/i18n";
import { addUniversityAction } from "@/lib/actions";

export default async function AdminPage() {
  const user = await getUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");
  const lang = await getLang();
  const db = getDb();

  async function handleAdd(formData: FormData) {
    "use server";
    await addUniversityAction(undefined, formData);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="text-xs uppercase tracking-[0.25em] text-[var(--ink-soft)]">Admin</p>
      <h1 className="serif mt-2 text-5xl">{lang === "uz" ? "Boshqaruv paneli" : "Admin panel"}</h1>
      <p className="mt-2 text-[var(--ink-soft)]">{lang === "uz" ? "Universitetlar va tizim sozlamalari" : "Universities and system settings"}</p>

      <section className="mt-10">
        <h2 className="serif text-3xl">{lang === "uz" ? "Universitet qo‘shish" : "Add university"}</h2>
        <form action={handleAdd} className="card mt-4 grid gap-3 p-6 md:grid-cols-2">
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--ink-soft)]">ID (slug)</span>
            <input name="id" required className="input" placeholder="adu" />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--ink-soft)]">{lang === "uz" ? "Qisqartma" : "Short name"}</span>
            <input name="short" required className="input" placeholder="ADU" />
          </label>
          <label className="grid gap-1 text-sm md:col-span-2">
            <span className="text-[var(--ink-soft)]">{lang === "uz" ? "Nomi (o‘zbek)" : "Name (Uzbek)"}</span>
            <input name="nameUz" required className="input" placeholder="Andijon Davlat Universiteti" />
          </label>
          <label className="grid gap-1 text-sm md:col-span-2">
            <span className="text-[var(--ink-soft)]">{lang === "uz" ? "Nomi (ingliz)" : "Name (English)"}</span>
            <input name="nameEn" className="input" placeholder="Andijan State University" />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--ink-soft)]">{lang === "uz" ? "Shahar" : "City"}</span>
            <input name="city" className="input" placeholder="Andijon" />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--ink-soft)]">{lang === "uz" ? "Talabalar soni" : "Students"}</span>
            <input name="students" type="number" className="input" placeholder="15000" />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-[var(--ink-soft)]">Accent</span>
            <input name="accent" className="input" placeholder="#2D6A4F" />
          </label>
          <label className="grid gap-1 text-sm md:col-span-2">
            <span className="text-[var(--ink-soft)]">{lang === "uz" ? "Tavsif (uz)" : "Blurb (uz)"}</span>
            <input name="blurbUz" className="input" />
          </label>
          <div className="md:col-span-2">
            <button className="btn btn-primary">{lang === "uz" ? "Qo‘shish" : "Add"}</button>
          </div>
        </form>
      </section>

      <section className="mt-12">
        <h2 className="serif text-3xl">{lang === "uz" ? "Mavjud universitetlar" : "Existing universities"}</h2>
        <div className="mt-4 overflow-x-auto card">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--line)] text-left">
                <th className="p-3">ID</th>
                <th className="p-3">{lang === "uz" ? "Nomi" : "Name"}</th>
                <th className="p-3">{lang === "uz" ? "Qisqartma" : "Short"}</th>
                <th className="p-3">{lang === "uz" ? "Shahar" : "City"}</th>
                <th className="p-3">{lang === "uz" ? "Talabalar" : "Students"}</th>
              </tr>
            </thead>
            <tbody>
              {db.universities.map((u) => (
                <tr key={u.id} className="border-b border-[var(--line)] last:border-0">
                  <td className="p-3 font-mono text-xs">{u.id}</td>
                  <td className="p-3">{lang === "uz" ? u.nameUz : u.nameEn}</td>
                  <td className="p-3">{u.short}</td>
                  <td className="p-3">{u.city}</td>
                  <td className="p-3">{u.students}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
