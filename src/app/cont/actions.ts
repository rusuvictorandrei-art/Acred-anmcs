"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function changePassword(fd: FormData) {
  const password = String(fd.get("password") ?? "");
  if (password.length < 10) redirect("/cont?parola=" + encodeURIComponent("Parola trebuie să aibă cel puțin 10 caractere."));
  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) redirect("/cont?parola=" + encodeURIComponent("Parola nu a putut fi schimbată: " + error.message));
  redirect("/cont?parola=ok");
}
