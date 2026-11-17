import { redirect } from "next/navigation";
import type { createClient } from "@/lib/supabase/server";

type Client = Awaited<ReturnType<typeof createClient>>;

/** Dacă utilizatorul are autentificare în doi pași activă, dar n-a introdus codul în sesiunea asta, îl trimite să-l introducă. */
export async function requireSecondFactor(supabase: Client) {
  const { data } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (data && data.nextLevel === "aal2" && data.currentLevel !== "aal2") redirect("/login/doi-pasi");
}
