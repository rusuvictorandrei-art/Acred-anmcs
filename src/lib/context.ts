import { redirect } from "next/navigation";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

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

  const { data: membership } = await supabase
    .from("memberships")
    .select("hospital_id, role, full_name, hospitals(name, next_visit)")
    .eq("user_id", user.id)
    .order("created_at")
    .limit(1)
    .maybeSingle();

  if (!membership) redirect("/start");

  const { data: pa } = await supabase.from("platform_admins").select("user_id").eq("user_id", user.id).maybeSingle();

  const hospital = membership.hospitals as unknown as { name: string; next_visit: string | null } | null;
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
