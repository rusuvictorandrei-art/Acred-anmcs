"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LEGAL_VERSION } from "@/lib/company";

export type AuthState = { error?: string; message?: string; email?: string };

export async function signIn(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: "E-mail sau parolă greșită, ori contul nu a fost încă confirmat.", email };
  redirect("/");
}

export async function signUp(_: AuthState, formData: FormData): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (password.length < 10) return { error: "Parola trebuie să aibă cel puțin 10 caractere.", email };
  if (formData.get("accept") !== "da") return { error: "Pentru a crea contul trebuie să accepți Termenii și Politica de confidențialitate.", email };
  const supabase = await createClient();
  const h = await headers();
  const origin = h.get("origin") ?? `https://${h.get("host")}`;
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback`,
      data: { terms_version: LEGAL_VERSION, terms_accepted_at: new Date().toISOString() },
    },
  });
  if (error) return { error: "Contul nu a putut fi creat: " + error.message, email };
  if (data.session) redirect("/");
  return { message: "Ți-am trimis un e-mail de confirmare. Deschide linkul din el, apoi autentifică-te." };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
