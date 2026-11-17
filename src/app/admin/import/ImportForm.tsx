"use client";

import { useActionState } from "react";
import { importStandards, type ImportResult } from "../actions";

export function ImportForm({ kind }: { kind: "standarde" | "simulare" }) {
  const [state, action, pending] = useActionState<ImportResult, FormData>(importStandards, {});
  return (
    <form action={action} className="flex flex-col gap-3">
      <input type="hidden" name="kind" value={kind} />
      <label className="label">
        Fișier CSV
        <input type="file" name="file" accept=".csv,text/csv" required className="input" />
      </label>
      {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      {state.message && <p role="status" className="text-sm text-emerald-800">{state.message}</p>}
      <button className="btn-primary self-start" disabled={pending}>{pending ? "Se importă…" : "Importă"}</button>
    </form>
  );
}
