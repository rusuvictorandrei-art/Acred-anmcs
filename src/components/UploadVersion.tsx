"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { recordVersion } from "@/app/(app)/actions";

const MAX_MB = 25;

export function UploadVersion({ hospitalId, documentId }: { hospitalId: string; documentId: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [, startTransition] = useTransition();
  const router = useRouter();

  async function upload() {
    if (!file) return;
    if (file.size > MAX_MB * 1024 * 1024) {
      setError(`Fișierul depășește ${MAX_MB} MB.`);
      return;
    }
    setBusy(true);
    setError(null);
    const safeName = file.name.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9._-]+/g, "_");
    const path = `${hospitalId}/${documentId}/${Date.now()}_${safeName}`;
    const supabase = createClient();
    const { error: upErr } = await supabase.storage.from("documents").upload(path, file, { upsert: false });
    if (upErr) {
      setError("Încărcarea a eșuat: " + upErr.message);
      setBusy(false);
      return;
    }
    try {
      await recordVersion({ documentId, path, fileName: file.name, notes });
      setFile(null);
      setNotes("");
      startTransition(() => router.refresh());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eroare la salvare.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg bg-slate-50 p-4">
      <p className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
        <strong>Fără date despre pacienți.</strong> Nu încărca foi de observație, rezultate sau alte documente cu date ale pacienților. Anonimizează dovezile înainte de încărcare.
      </p>
      <label className="label">
        Fișier (PDF, Word, Excel; maximum {MAX_MB} MB)
        <input
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx,.odt,.ods,.png,.jpg,.jpeg"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="input"
        />
      </label>
      <label className="label">
        Ce s-a modificat în această versiune
        <input value={notes} onChange={(e) => setNotes(e.target.value)} className="input" placeholder="ex. Actualizat conform noului ghid" />
      </label>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button type="button" onClick={upload} disabled={!file || busy} className="btn-primary self-start">
        {busy ? "Se încarcă…" : "Încarcă versiunea nouă"}
      </button>
      <p className="text-xs text-slate-600">O versiune nouă trece documentul înapoi în „Draft” până la reaprobare.</p>
    </div>
  );
}
