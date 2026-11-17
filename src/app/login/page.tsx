"use client";

import { useActionState, useState } from "react";
import { signIn, signUp, type AuthState } from "./actions";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const [mode, setMode] = useState<"in" | "up">("in");
  const [inState, inAction, inPending] = useActionState<AuthState, FormData>(signIn, {});
  const [upState, upAction, upPending] = useActionState<AuthState, FormData>(signUp, {});
  const state = mode === "in" ? inState : upState;
  const pending = mode === "in" ? inPending : upPending;

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="card w-full max-w-md p-8 flex flex-col gap-6">
        <Logo dark />
        <div>
          <h1 className="text-2xl font-semibold">{mode === "in" ? "Autentificare" : "Cont nou"}</h1>
          <p className="mt-1 text-sm text-slate-600">
            Pregătirea documentației pentru evaluarea ANMCS, într-un singur loc.
          </p>
        </div>
        <form action={mode === "in" ? inAction : upAction} className="flex flex-col gap-4">
          <label className="label">
            E-mail
            <input key={state.email ?? ""} className="input" type="email" name="email" required autoComplete="email" defaultValue={state.email} />
          </label>
          <label className="label">
            Parolă
            <input
              className="input"
              type="password"
              name="password"
              required
              minLength={mode === "up" ? 10 : undefined}
              autoComplete={mode === "in" ? "current-password" : "new-password"}
            />
          </label>
          {mode === "up" && (
            <label className="flex items-start gap-3 text-sm leading-snug">
              <input type="checkbox" name="accept" value="da" required className="mt-0.5 size-5 flex-none accent-brand-600" />
              <span>
                Am citit și accept{" "}
                <a href="/legal/termeni" target="_blank" className="text-brand-700 underline">Termenii și condițiile</a> și{" "}
                <a href="/legal/confidentialitate" target="_blank" className="text-brand-700 underline">Politica de confidențialitate</a>.
                Înțeleg că în aplicație nu se încarcă date despre pacienți.
              </span>
            </label>
          )}
          {state.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
          {state.message && <p role="status" className="text-sm text-emerald-800">{state.message}</p>}
          <button className="btn-primary" disabled={pending}>
            {pending ? "Se încarcă…" : mode === "in" ? "Intră în cont" : "Creează contul"}
          </button>
        </form>
        <button
          type="button"
          className="text-sm text-brand-700 underline underline-offset-2 self-start min-h-11"
          onClick={() => setMode(mode === "in" ? "up" : "in")}
        >
          {mode === "in" ? "Nu ai cont? Creează unul" : "Ai deja cont? Autentifică-te"}
        </button>
        <nav aria-label="Documente legale" className="flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-100 pt-4 text-xs text-slate-600">
          <a href="/legal/termeni" className="underline">Termeni</a>
          <a href="/legal/confidentialitate" className="underline">Confidențialitate</a>
          <a href="/legal/securitate" className="underline">Securitatea datelor</a>
        </nav>
      </div>
    </main>
  );
}
