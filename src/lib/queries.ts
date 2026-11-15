import type { AppContext } from "@/lib/context";

export type Section = { id: string; code: string; name: string; sort: number };
export type Requirement = {
  id: string;
  section_id: string;
  code: string;
  title: string;
  description: string | null;
  guidance: string | null;
  sort: number;
};
export type Assessment = { requirement_id: string; status: string; note: string | null; updated_at: string };
export type DocumentRow = {
  id: string;
  code: string;
  title: string;
  doc_type: string;
  department: string | null;
  owner_name: string | null;
  review_due: string | null;
  status: string;
  approved_at: string | null;
  created_at: string;
};
export type Task = {
  id: string;
  title: string;
  requirement_id: string | null;
  owner_name: string | null;
  due_date: string | null;
  done: boolean;
  source: string;
  created_at: string;
};

export async function loadCatalog(ctx: AppContext) {
  const [{ data: sections }, { data: requirements }] = await Promise.all([
    ctx.supabase.from("sections").select("*").order("sort"),
    ctx.supabase.from("requirements").select("*").order("sort").limit(5000),
  ]);
  const secs = (sections ?? []) as Section[];
  const secOrder = new Map(secs.map((s, i) => [s.id, i]));
  const reqs = ((requirements ?? []) as Requirement[]).sort(
    (a, b) => (secOrder.get(a.section_id) ?? 0) - (secOrder.get(b.section_id) ?? 0) || a.sort - b.sort,
  );
  return { sections: secs, requirements: reqs };
}

export async function loadAssessments(ctx: AppContext) {
  const { data } = await ctx.supabase
    .from("assessments")
    .select("requirement_id, status, note, updated_at")
    .eq("hospital_id", ctx.hospitalId)
    .limit(5000);
  return new Map(((data ?? []) as Assessment[]).map((a) => [a.requirement_id, a]));
}

export async function loadDocuments(ctx: AppContext) {
  const { data } = await ctx.supabase
    .from("documents")
    .select("id, code, title, doc_type, department, owner_name, review_due, status, approved_at, created_at")
    .eq("hospital_id", ctx.hospitalId)
    .order("code");
  return (data ?? []) as DocumentRow[];
}

export async function loadTasks(ctx: AppContext) {
  const { data } = await ctx.supabase
    .from("tasks")
    .select("id, title, requirement_id, owner_name, due_date, done, source, created_at")
    .eq("hospital_id", ctx.hospitalId)
    .order("done")
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at");
  return (data ?? []) as Task[];
}

export async function loadLinks(ctx: AppContext) {
  const { data } = await ctx.supabase
    .from("document_requirements")
    .select("document_id, requirement_id")
    .eq("hospital_id", ctx.hospitalId)
    .limit(10000);
  return (data ?? []) as { document_id: string; requirement_id: string }[];
}
