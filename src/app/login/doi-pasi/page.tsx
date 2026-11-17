"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";

export default function SecondFactorPage() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [factorId, setFactorId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.mfa.listFactors().then(({ data, error: e }) => {
      if (e) {
        window.location.href = "/login";
        return;
      }
      const f = data?.totp.find((x) => x.status === "verified");
      if (!f) window.location.href = "/";
      else setFactorId(f.id);
    });
  }, []);

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (!factorId) return;
    setBusy(true);
    setError(null);
    const supabase = createClient();
    const { error: e2 } = await supabase.auth.mfa.challengeAndVerify({ factorId, code: code.replace(/\s/g, "") });
    if (e2) {
      setError("Cod greșit sau expirat. Introdu codul care apare acum în aplicația de autentificare.");
      setBusy(false);
      return;
    }
    window.location.href = "/";
  }

  async function signOut() {
    await createClient().auth.signOut();
    window.location.href = "/login";
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <form onSubmit={verify} className="card flex w-full max-w-md flex-col gap-5 p-8">
        <Logo dark />
        <div>
          <h1 className="text-2xl font-semibold">Verificare în doi pași</h1>
          <p className="mt-1 text-sm text-slate-600">
            Deschide aplicația de autentificare de pe telefon (Google Authenticator, Microsoft Authenticator etc.) și introdu codul de 6 cifre pentru Acredit.
          </p>
        </div>
        <label className="label">
          Cod
          <input
            className="input text-center text-2xl tracking-[0.4em]"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9 ]{6,7}"
            maxLength={7}
            required
            autoFocus
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button className="btn-primary" disabled={busy || !factorId}>{busy ? "Se verifică…" : "Continuă"}</button>
        <button type="button" onClick={signOut} className="min-h-11 self-start text-sm text-slate-600 underline">
          Ieșire din cont
        </button>
        <p className="text-xs text-slate-600">
          Ai pierdut telefonul? Cere administratorului platformei să-ți reseteze autentificarea în doi pași.
        </p>
      </form>
    </main>
  );
}
