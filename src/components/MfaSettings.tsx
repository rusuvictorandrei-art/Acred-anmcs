"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Enroll = { id: string; qr: string; secret: string };

export function MfaSettings() {
  const [loading, setLoading] = useState(true);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [enroll, setEnroll] = useState<Enroll | null>(null);
  const [code, setCode] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  async function load() {
    const { data } = await createClient().auth.mfa.listFactors();
    setFactorId(data?.totp.find((f) => f.status === "verified")?.id ?? null);
    setLoading(false);
  }
  useEffect(() => {
    load();
  }, []);

  async function start() {
    setBusy(true);
    setMsg(null);
    const supabase = createClient();
    // Curăță încercările neterminate.
    const { data: list } = await supabase.auth.mfa.listFactors();
    for (const f of list?.all ?? []) {
      if (f.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: f.id });
    }
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `Acredit ${Date.now()}` });
    setBusy(false);
    if (error || !data) {
      setMsg({ ok: false, text: "Nu am putut porni activarea: " + (error?.message ?? "eroare necunoscută") });
      return;
    }
    setEnroll({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  }

  async function confirm(e: React.FormEvent) {
    e.preventDefault();
    if (!enroll) return;
    setBusy(true);
    const { error } = await createClient().auth.mfa.challengeAndVerify({ factorId: enroll.id, code: code.replace(/\s/g, "") });
    setBusy(false);
    if (error) {
      setMsg({ ok: false, text: "Cod greșit. Introdu codul care apare acum în aplicație." });
      return;
    }
    setEnroll(null);
    setCode("");
    setMsg({ ok: true, text: "Autentificarea în doi pași este activă. De acum, la fiecare conectare îți cerem și codul din aplicație." });
    load();
  }

  async function disable() {
    if (!factorId) return;
    setBusy(true);
    const { error } = await createClient().auth.mfa.unenroll({ factorId });
    setBusy(false);
    if (error) {
      setMsg({ ok: false, text: "Nu am putut dezactiva: " + error.message });
      return;
    }
    setMsg({ ok: true, text: "Autentificarea în doi pași a fost dezactivată." });
    load();
  }

  if (loading) return <p className="text-sm text-slate-600">Se încarcă…</p>;

  return (
    <div className="flex flex-col gap-4">
      {factorId ? (
        <>
          <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
            <span className="rounded-full bg-emerald-50 px-2.5 py-1">Activă</span>
            La conectare îți cerem parola și codul din aplicația de autentificare.
          </p>
          <button type="button" onClick={disable} disabled={busy} className="btn-secondary self-start">
            Dezactivează
          </button>
        </>
      ) : enroll ? (
        <form onSubmit={confirm} className="flex flex-col gap-4">
          <ol className="list-decimal space-y-1 pl-5 text-sm text-slate-700">
            <li>Instalează pe telefon <strong>Google Authenticator</strong> sau <strong>Microsoft Authenticator</strong> (gratuite).</li>
            <li>În aplicație apasă <strong>+</strong> și scanează codul QR de mai jos.</li>
            <li>Scrie aici codul de 6 cifre pe care ți-l arată aplicația.</li>
          </ol>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={enroll.qr} alt="Cod QR pentru aplicația de autentificare" className="size-48 rounded-lg bg-white p-2 ring-1 ring-slate-200" />
          <p className="text-xs text-slate-600">
            Pe același telefon nu poți scana? În aplicație alege „Introdu o cheie” și scrie: <code className="break-all font-semibold">{enroll.secret}</code>
          </p>
          <label className="label max-w-xs">
            Codul de 6 cifre
            <input
              className="input text-center text-xl tracking-[0.3em]"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={7}
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
          </label>
          <div className="flex gap-2">
            <button className="btn-primary" disabled={busy}>Activează</button>
            <button type="button" className="btn-secondary" onClick={() => setEnroll(null)}>Renunță</button>
          </div>
        </form>
      ) : (
        <>
          <p className="text-sm text-slate-700">
            Pe lângă parolă, la conectare îți cerem un cod de 6 cifre generat de o aplicație de pe telefon. Chiar dacă cineva îți află parola, nu poate intra fără telefonul tău.
          </p>
          <button type="button" onClick={start} disabled={busy} className="btn-primary self-start">
            Activează autentificarea în doi pași
          </button>
        </>
      )}
      {msg && (
        <p role="status" className={`text-sm ${msg.ok ? "text-emerald-800" : "text-red-700"}`}>
          {msg.text}
        </p>
      )}
    </div>
  );
}
