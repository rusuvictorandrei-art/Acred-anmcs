import type { Metadata } from "next";
import "./globals.css";
import { SUPABASE_CONFIG_OK, SUPABASE_KEY, SUPABASE_URL } from "@/lib/supabase/env";

export const metadata: Metadata = {
  title: "Acredit – pregătire acreditare ANMCS",
  description: "Pregătirea documentației și a protocoalelor pentru evaluarea ANMCS",
};

function ConfigMissing() {
  const url = SUPABASE_URL;
  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold">Configurare incompletă</h1>
      <p className="text-sm text-slate-700">
        Aplicația nu găsește legătura cu Supabase. În Vercel, la Settings → Environment Variables, trebuie să existe:
      </p>
      <ul className="flex flex-col gap-1 rounded-lg bg-white p-4 text-sm ring-1 ring-slate-200">
        <li>
          <code>NEXT_PUBLIC_SUPABASE_URL</code>: {url ? (/^https?:\/\//.test(url) ? "setată ✓" : "setată greșit (trebuie să înceapă cu https://)") : "lipsește ✗"}
        </li>
        <li>
          <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>: {SUPABASE_KEY.length > 20 ? "setată ✓" : SUPABASE_KEY ? "pare incompletă" : "lipsește ✗"}
        </li>
      </ul>
      <p className="text-sm text-slate-700">După ce le corectezi, mergi în Vercel la Deployments → ⋯ → Redeploy.</p>
    </main>
  );
}

const configOk = SUPABASE_CONFIG_OK;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen font-sans antialiased">{configOk ? children : <ConfigMissing />}</body>
    </html>
  );
}
