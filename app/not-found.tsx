import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="serif text-6xl">
        Topdim<span className="text-[var(--coral)]">?</span>
      </p>
      <p className="mt-4 text-[var(--ink-soft)]">Bu sahifa yo‘qolgan. Doskaga qaytamiz.</p>
      <Link href="/browse" className="btn btn-primary mt-8">
        E’lonlar
      </Link>
    </div>
  );
}
