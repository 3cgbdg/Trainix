import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-6 text-center">
      <p className="text-sm font-semibold text-brand">404</p>
      <h1 className="mt-2 text-3xl font-bold text-strong">This page is not in your plan</h1>
      <p className="mt-3 text-muted">The link may be outdated, or the page may have moved during the Trainix redesign.</p>
      <Link href="/today" className="mt-6 inline-flex min-h-11 items-center rounded-control bg-brand px-4 text-sm font-semibold text-on-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus">
        Return to Today
      </Link>
    </main>
  );
}
