"use server";

import { revalidatePath } from "next/cache";
import { getAdminContext } from "@/lib/admin";
import { parseCsv } from "@/lib/csv";

function str(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}

// ---------------------------------------------------------------- Import standarde (administrator platformă)
export type ImportResult = { error?: string; message?: string };

export async function importStandards(_: ImportResult, fd: FormData): Promise<ImportResult> {
  const ctx = await getAdminContext();
  const file = fd.get("file");
  const kind = str(fd, "kind");
  if (!(file instanceof File) || file.size === 0) return { error: "Alege un fișier CSV." };
  const rows = parseCsv(await file.text());
  if (rows.length < 2) return { error: "Fișierul nu conține date." };
  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idx = (name: string) => header.indexOf(name);
  const get = (r: string[], name: string) => (idx(name) >= 0 ? (r[idx(name)] ?? "").trim() : "");
  const data = rows.slice(1).filter((r) => r.some((c) => c.trim()));

  if (kind === "simulare") {
    for (const col of ["cod", "domeniu", "intrebare"]) {
      if (idx(col) < 0) return { error: `Lipsește coloana „${col}”.` };
    }
    const items = data.map((r, i) => ({
      code: get(r, "cod"),
      area: get(r, "domeniu"),
      question: get(r, "intrebare"),
      hint: get(r, "indiciu") || null,
      sort: i + 1,
    }));
    const { error } = await ctx.supabase.from("sim_questions").upsert(items, { onConflict: "code" });
    if (error) return { error: error.message };
    revalidatePath("/", "layout");
    return { message: `Am importat ${items.length} întrebări de simulare.` };
  }

  for (const col of ["sectiune_cod", "sectiune_nume", "cod", "titlu"]) {
    if (idx(col) < 0) return { error: `Lipsește coloana „${col}”.` };
  }
  const sectionMap = new Map<string, { code: string; name: string; sort: number }>();
  data.forEach((r) => {
    const code = get(r, "sectiune_cod");
    if (code && !sectionMap.has(code)) sectionMap.set(code, { code, name: get(r, "sectiune_nume"), sort: sectionMap.size + 1 });
  });
  const { data: sections, error: sErr } = await ctx.supabase
    .from("sections")
    .upsert([...sectionMap.values()], { onConflict: "code" })
    .select("id, code");
  if (sErr) return { error: sErr.message };
  const sectionId = new Map(sections!.map((s) => [s.code, s.id]));

  const reqs = data
    .filter((r) => get(r, "cod") && get(r, "titlu") && sectionId.has(get(r, "sectiune_cod")))
    .map((r, i) => ({
      section_id: sectionId.get(get(r, "sectiune_cod"))!,
      code: get(r, "cod"),
      title: get(r, "titlu"),
      description: get(r, "descriere") || null,
      guidance: get(r, "ce_verifica_evaluatorul") || null,
      standard_code: get(r, "standard_cod") || null,
      standard_name: get(r, "standard") || null,
      criterion: get(r, "criteriu") || null,
      cerinta: get(r, "cerinta") || null,
      sort: i + 1,
    }));
  for (let i = 0; i < reqs.length; i += 500) {
    const { error } = await ctx.supabase.from("requirements").upsert(reqs.slice(i, i + 500), { onConflict: "code" });
    if (error) return { error: error.message };
  }
  revalidatePath("/", "layout");
  return { message: `Am importat ${sectionMap.size} secțiuni și ${reqs.length} cerințe.` };
}

export async function deleteDemoData() {
  const ctx = await getAdminContext();
  await ctx.supabase.from("requirements").delete().like("code", "DEMO-%");
  await ctx.supabase.from("sim_questions").delete().like("code", "SIM-%");
  revalidatePath("/", "layout");
}

export async function setHospitalStatus(fd: FormData) {
  const ctx = await getAdminContext();
  const { error } = await ctx.supabase.rpc("admin_set_hospital_status", {
    p_hospital: str(fd, "hospital_id"),
    p_status: str(fd, "status"),
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin", "layout");
}

export async function resetUserMfa(fd: FormData) {
  const ctx = await getAdminContext();
  const { error } = await ctx.supabase.rpc("admin_reset_mfa", { p_user: str(fd, "user_id") });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/utilizatori");
}
