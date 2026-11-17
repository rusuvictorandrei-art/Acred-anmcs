import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <header className="no-print border-b border-slate-200">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-3 px-6 py-4">
          <Link href="/" aria-label="Acredit – pagina principală"><Logo dark /></Link>
          <Link href="/legal" className="text-sm text-brand-700 underline underline-offset-2">Toate documentele</Link>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-8">{children}</main>
    </div>
  );
}
