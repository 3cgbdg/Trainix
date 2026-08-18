import Image from "next/image";
import Link from "next/link";

export default function LegalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-dvh bg-canvas">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-1.5">
            <Image className="h-auto w-8" width={32} height={31} src="/logo.png" alt="" />
            <span className="font-borel text-xl font-bold leading-none text-green">Trainix</span>
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14">{children}</main>
      <footer className="border-t border-border py-6">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center gap-x-6 gap-y-2 px-4 text-sm text-muted sm:px-6">
          <Link href="/terms" className="hover:text-strong">Terms of Service</Link>
          <Link href="/privacy" className="hover:text-strong">Privacy Policy</Link>
          <Link href="/auth/login" className="hover:text-strong">Login</Link>
        </div>
      </footer>
    </div>
  );
}
