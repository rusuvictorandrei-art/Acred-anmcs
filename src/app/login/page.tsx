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
            <input className="input" type="email" name="email" required autoComplete="email" />
          </label>
          <label className="label">
            Parolă
            <input
              className="input"
              type="password"
              name="password"
              required
              minLength={mode === "up" ? 8 : undefined}
              autoComplete={mode === "in" ? "current-password" : "new-password"}
            />
          </label>
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
      </div>
    </main>
  );
}
