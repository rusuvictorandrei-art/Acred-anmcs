import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { requireSecondFactor } from "@/lib/mfa";

export type Role = "admin" | "editor" | "viewer";

export type AppContext = {
  supabase: Awaited<ReturnType<typeof createClient>>;
  userId: string;
  email: string;
  hospitalId: string;
  hospitalName: string;
  nextVisit: string | null;
  role: Role;
  fullName: string | null;
  canEdit: boolean;
  isAdmin: boolean;
  isPlatformAdmin: boolean;
};

/** Utilizatorul autentificat, spitalul lui și rolul. Redirecționează dacă lipsesc. */
export const getContext = cache(async (): Promise<AppContext> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await requireSecondFactor(supabase);

  const { data: membership } = await supabase
    .from("memberships")
    .select("hospital_id, role, full_name, hospitals(name, next_visit)")
    .eq("user_id", user.id)
    .order("created_at")
    .limit(1)
    .maybeSingle();

  const { data: pa } = await supabase.from("platform_admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!membership) redirect(pa ? "/admin" : "/start");

  const hospital = membership.hospitals as unknown as { name: string; next_visit: string | null } | null;
  // Spitalele noi așteaptă aprobarea administratorului platformei.
  // Citit separat: dacă baza de date încă nu are coloana „status”, spitalul e considerat aprobat.
  const { data: st, error: stErr } = await supabase.from("hospitals").select("status").eq("id", membership.hospital_id).maybeSingle();
  if (!stErr && st && (st as { status?: string }).status && (st as { status: string }).status !== "aprobat") redirect("/asteptare");
  const role = membership.role as Role;
  return {
    supabase,
    userId: user.id,
    email: user.email ?? "",
    hospitalId: membership.hospital_id,
    hospitalName: hospital?.name ?? "",
    nextVisit: hospital?.next_visit ?? null,
    role,
    fullName: membership.full_name,
    canEdit: role === "admin" || role === "editor",
    isAdmin: role === "admin",
    isPlatformAdmin: !!pa,
  };
});
