"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getContext, type AppContext } from "@/lib/context";
import { STATUS } from "@/lib/format";
import { parseCsv } from "@/lib/csv";

function str(fd: FormData, key: string): string {
  return String(fd.get(key) ?? "").trim();
}
function optDate(fd: FormData, key: string): string | null {
  const v = str(fd, key);
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
}

async function editor(): Promise<AppContext> {
  const ctx = await getContext();
  if (!ctx.canEdit) throw new Error("Nu ai drepturi de editare.");
  return ctx;
}
async function admin(): Promise<AppContext> {
  const ctx = await getContext();
  if (!ctx.isAdmin) throw new Error("Doar administratorii pot face această acțiune.");
  return ctx;
}

async function log(ctx: AppContext, action: string, details: string) {
  await ctx.supabase.from("activity_log").insert({ hospital_id: ctx.hospitalId, user_id: ctx.userId, action, details });
}

function check(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

// ---------------------------------------------------------------- Autoevaluare
export async function setAssessment(fd: FormData) {
  const ctx = await editor();
  const requirementId = str(fd, "requirement_id");
  const status = str(fd, "status");
  if (!(status in STATUS)) throw new Error("Status invalid");
  const { error } = await ctx.supabase.from("assessments").upsert({
    hospital_id: ctx.hospitalId,
    requirement_id: requirementId,
    status,
    updated_by: ctx.userId,
    updated_at: new Date().toISOString(),
  });
  check(error);
  await log(ctx, "autoevaluare", `${str(fd, "code")}: ${STATUS[status as keyof typeof STATUS].label}`);
  revalidatePath("/", "layout");
}

export async function saveAssessmentNote(fd: FormData) {
  const ctx = await editor();
  const requirementId = str(fd, "requirement_id");
  const { data: existing } = await ctx.supabase
    .from("assessments")
    .select("status")
    .eq("hospital_id", ctx.hospitalId)
    .eq("requirement_id", requirementId)
    .maybeSingle();
  const { error } = await ctx.supabase.from("assessments").upsert({
    hospital_id: ctx.hospitalId,
    requirement_id: requirementId,
    status: existing?.status ?? "neevaluat",
    note: str(fd, "note") || null,
    updated_by: ctx.userId,
    updated_at: new Date().toISOString(),
  });
  check(error);
  revalidatePath("/standarde");
  revalidatePath("/dosar");
}

// ---------------------------------------------------------------- Plan de conformare
export async function createTask(fd: FormData) {
  const ctx = await editor();
  const title = str(fd, "title");
  if (!title) return;
  const { error } = await ctx.supabase.from("tasks").insert({
    hospital_id: ctx.hospitalId,
    title,
    requirement_id: str(fd, "requirement_id") || null,
    owner_name: str(fd, "owner_name") || null,
    due_date: optDate(fd, "due_date"),
    source: str(fd, "source") === "autoevaluare" ? "autoevaluare" : "manual",
    created_by: ctx.userId,
  });
  check(error);
  await log(ctx, "sarcina_noua", title);
  revalidatePath("/", "layout");
}

export async function updateTask(fd: FormData) {
  const ctx = await editor();
  const { error } = await ctx.supabase
    .from("tasks")
    .update({
      owner_name: str(fd, "owner_name") || null,
      due_date: optDate(fd, "due_date"),
    })
    .eq("id", str(fd, "id"))
    .eq("hospital_id", ctx.hospitalId);
  check(error);
  revalidatePath("/", "layout");
}

export async function toggleTask(fd: FormData) {
  const ctx = await editor();
  const done = str(fd, "done") === "true";
  const { error } = await ctx.supabase
    .from("tasks")
    .update({ done: !done })
    .eq("id", str(fd, "id"))
    .eq("hospital_id", ctx.hospitalId);
  check(error);
  await log(ctx, done ? "sarcina_redeschisa" : "sarcina_finalizata", str(fd, "title"));
  revalidatePath("/", "layout");
}

export async function deleteTask(fd: FormData) {
  const ctx = await editor();
  const { error } = await ctx.supabase.from("tasks").delete().eq("id", str(fd, "id")).eq("hospital_id", ctx.hospitalId);
  check(error);
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------- Simulare
export async function answerSim(fd: FormData) {
  const ctx = await editor();
  const questionId = str(fd, "question_id");
  const answer = str(fd, "answer");
  const question = str(fd, "question");
  if (answer !== "pregatit" && answer !== "de_lucrat") throw new Error("Răspuns invalid");

  const { error } = await ctx.supabase.from("sim_answers").upsert({
    hospital_id: ctx.hospitalId,
    question_id: questionId,
    answer,
    updated_at: new Date().toISOString(),
  });
  check(error);

  const taskTitle = `Din simulare: ${question}`;
  const { data: existing } = await ctx.supabase
    .from("tasks")
    .select("id")
    .eq("hospital_id", ctx.hospitalId)
    .eq("source", "simulare")
    .eq("title", taskTitle)
    .limit(1);
  if (answer === "de_lucrat" && !existing?.length) {
    await ctx.supabase.from("tasks").insert({
      hospital_id: ctx.hospitalId,
      title: taskTitle,
      source: "simulare",
      created_by: ctx.userId,
    });
  }
  if (answer === "pregatit" && existing?.length) {
    await ctx.supabase.from("tasks").update({ done: true }).eq("id", existing[0].id);
  }
  revalidatePath("/", "layout");
}

export async function resetSim() {
  const ctx = await editor();
  const { error } = await ctx.supabase.from("sim_answers").delete().eq("hospital_id", ctx.hospitalId);
  check(error);
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------- Documente
export async function createDocument(fd: FormData) {
  const ctx = await editor();
  const code = str(fd, "code");
  const title = str(fd, "title");
  if (!code || !title) throw new Error("Codul și titlul sunt obligatorii.");
  const { data, error } = await ctx.supabase
    .from("documents")
    .insert({
      hospital_id: ctx.hospitalId,
      code,
      title,
      doc_type: str(fd, "doc_type") || "procedura",
      department: str(fd, "department") || null,
      owner_name: str(fd, "owner_name") || null,
      review_due: optDate(fd, "review_due"),
      created_by: ctx.userId,
    })
    .select("id")
    .single();
  if (error?.code === "23505") redirect("/documente?eroare=" + encodeURIComponent(`Există deja un document cu codul ${code}.`));
  check(error);
  await log(ctx, "document_nou", `${code} ${title}`);
  revalidatePath("/", "layout");
  redirect(`/documente/${data!.id}`);
}

export async function updateDocument(fd: FormData) {
  const ctx = await editor();
  const id = str(fd, "id");
  const { error } = await ctx.supabase
    .from("documents")
    .update({
      code: str(fd, "code"),
      title: str(fd, "title"),
      doc_type: str(fd, "doc_type") || "procedura",
      department: str(fd, "department") || null,
      owner_name: str(fd, "owner_name") || null,
      review_due: optDate(fd, "review_due"),
    })
    .eq("id", id)
    .eq("hospital_id", ctx.hospitalId);
  check(error);
  revalidatePath("/", "layout");
}

export async function setDocumentStatus(fd: FormData) {
  const ctx = await editor();
  const id = str(fd, "id");
  const status = str(fd, "status");
  if (!["draft", "aprobat", "retras"].includes(status)) throw new Error("Status invalid");
  if (status === "aprobat" && !ctx.isAdmin) throw new Error("Doar administratorii pot aproba documente.");
  const { error } = await ctx.supabase
    .from("documents")
    .update({
      status,
      approved_by: status === "aprobat" ? ctx.userId : null,
      approved_at: status === "aprobat" ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .eq("hospital_id", ctx.hospitalId);
  check(error);
  await log(ctx, "document_" + status, str(fd, "code"));
  revalidatePath("/", "layout");
}

/** Apelată după ce fișierul a fost încărcat direct din browser în Supabase Storage. */
export async function recordVersion(input: { documentId: string; path: string; fileName: string; notes: string }) {
  const ctx = await editor();
  if (!input.path.startsWith(ctx.hospitalId + "/")) throw new Error("Cale invalidă");
  const { data: last } = await ctx.supabase
    .from("document_versions")
    .select("version")
    .eq("document_id", input.documentId)
    .order("version", { ascending: false })
    .limit(1);
  const version = (last?.[0]?.version ?? 0) + 1;
  const { error } = await ctx.supabase.from("document_versions").insert({
    document_id: input.documentId,
    hospital_id: ctx.hospitalId,
    version,
    file_path: input.path,
    file_name: input.fileName,
    notes: input.notes || null,
    uploaded_by: ctx.userId,
  });
  check(error);
  // O versiune nouă trebuie reaprobată.
  await ctx.supabase
    .from("documents")
    .update({ status: "draft", approved_by: null, approved_at: null })
    .eq("id", input.documentId)
    .eq("hospital_id", ctx.hospitalId);
  await log(ctx, "versiune_noua", `${input.fileName} (v${version})`);
  revalidatePath("/", "layout");
}

export async function linkRequirement(fd: FormData) {
  const ctx = await editor();
  const requirementId = str(fd, "requirement_id");
  if (!requirementId) return;
  const { error } = await ctx.supabase.from("document_requirements").upsert({
    document_id: str(fd, "document_id"),
    requirement_id: requirementId,
    hospital_id: ctx.hospitalId,
  });
  check(error);
  revalidatePath("/", "layout");
}

export async function unlinkRequirement(fd: FormData) {
  const ctx = await editor();
  const { error } = await ctx.supabase
    .from("document_requirements")
    .delete()
    .eq("document_id", str(fd, "document_id"))
    .eq("requirement_id", str(fd, "requirement_id"))
    .eq("hospital_id", ctx.hospitalId);
  check(error);
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------- Echipă și setări
export async function updateHospital(fd: FormData) {
  const ctx = await admin();
  const { error } = await ctx.supabase
    .from("hospitals")
    .update({ name: str(fd, "name"), next_visit: optDate(fd, "next_visit") })
    .eq("id", ctx.hospitalId);
  check(error);
  revalidatePath("/", "layout");
}

export async function inviteMember(fd: FormData) {
  const ctx = await admin();
  const email = str(fd, "email").toLowerCase();
  const role = str(fd, "role");
  if (!email.includes("@")) throw new Error("Adresă de e-mail invalidă");
  const { error } = await ctx.supabase
    .from("invitations")
    .upsert({ hospital_id: ctx.hospitalId, email, role, accepted_at: null }, { onConflict: "hospital_id,email" });
  check(error);
  await log(ctx, "invitatie", `${email} (${role})`);
  revalidatePath("/echipa");
}

export async function cancelInvite(fd: FormData) {
  const ctx = await admin();
  const { error } = await ctx.supabase.from("invitations").delete().eq("id", str(fd, "id")).eq("hospital_id", ctx.hospitalId);
  check(error);
  revalidatePath("/echipa");
}

export async function changeRole(fd: FormData) {
  const ctx = await admin();
  const { error } = await ctx.supabase
    .from("memberships")
    .update({ role: str(fd, "role") })
    .eq("hospital_id", ctx.hospitalId)
    .eq("user_id", str(fd, "user_id"));
  check(error);
  revalidatePath("/echipa");
}

export async function removeMember(fd: FormData) {
  const ctx = await admin();
  const { error } = await ctx.supabase
    .from("memberships")
    .delete()
    .eq("hospital_id", ctx.hospitalId)
    .eq("user_id", str(fd, "user_id"));
  check(error);
  revalidatePath("/echipa");
}

// ---------------------------------------------------------------- Import standarde (administrator platformă)
export type ImportResult = { error?: string; message?: string };

export async function importStandards(_: ImportResult, fd: FormData): Promise<ImportResult> {
  const ctx = await getContext();
  if (!ctx.isPlatformAdmin) return { error: "Doar administratorii platformei pot importa standarde." };
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
  const ctx = await getContext();
  if (!ctx.isPlatformAdmin) throw new Error("Doar administratorii platformei.");
  await ctx.supabase.from("requirements").delete().like("code", "DEMO-%");
  revalidatePath("/", "layout");
}
