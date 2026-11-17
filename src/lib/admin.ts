import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { requireSecondFactor } from "@/lib/mfa";

/** Administratorul platformei (proprietarul aplicației). Nu are nevoie de un spital. */
export const getAdminContext = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await requireSecondFactor(supabase);
  const { data: pa } = await supabase.from("platform_admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!pa) redirect("/");
  const { data: m } = await supabase.from("memberships").select("hospital_id").eq("user_id", user.id).limit(1);
  const { data: factors } = await supabase.auth.mfa.listFactors();
  const hasMfa = !!factors?.totp?.some((f) => f.status === "verified");
  return { supabase, userId: user.id, email: user.email ?? "", hasHospital: !!m?.length, hasMfa };
});
