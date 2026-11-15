import Link from "next/link";
import { getContext } from "@/lib/context";
import { loadAssessments, loadCatalog, loadDocuments, loadTasks } from "@/lib/queries";
import { daysUntil, fmtDate, reviewState, score, todayISO } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";

export default async function Dashboard() {
  const ctx = await getContext();
  const [{ sections, requirements }, assessments, documents, tasks, simQ, simA] = await Promise.all([
    loadCatalog(ctx),
    loadAssessments(ctx),
    loadDocuments(ctx),
    loadTasks(ctx),
    ctx.supabase.from("sim_questions").select("id", { count: "exact", head: true }),
    ctx.supabase.from("sim_answers").select("answer").eq("hospital_id", ctx.hospitalId),
  ]);

  const statusOf = (id: string) => assessments.get(id)?.status ?? "neevaluat";
  const overall = score(requirements.map((r) => statusOf(r.id)));
  const evaluated = requirements.filter((r) => statusOf(r.id) !== "neevaluat").length;
  const bySection = sections.map((s) => {
    const reqs = requirements.filter((r) => r.section_id === s.id);
    return { ...s, total: reqs.length, pct: score(reqs.map((r) => statusOf(r.id))) };
  });

  const today = todayISO();
  const activeDocs = documents.filter((d) => d.status !== "retras");
  const docsDue = activeDocs.filter((d) => ["soon", "overdue"].includes(reviewState(d.review_due).key));
  const drafts = activeDocs.filter((d) => d.status === "draft");
  const openTasks = tasks.filter((t) => !t.done);
  const lateTasks = openTasks.filter((t) => t.due_date && t.due_date < today);
  const simTotal = simQ.count ?? 0;
  const simReady = (simA.data ?? []).filter((a) => a.answer === "pregatit").length;
  const simPct = simTotal ? Math.round((simReady / simTotal) * 100) : 0;

  const neconform = requirements.filter((r) => statusOf(r.id) === "neconform");
  const attention = [
    ...neconform.slice(0, 5).map((r) => ({ tag: "Neconform", cls: "bg-red-50 text-red-800", text: `${r.code} · ${r.title}`, href: `/standarde?cauta=${encodeURIComponent(r.code)}` })),
    ...docsDue.slice(0, 5).map((d) => {
      const rs = reviewState(d.review_due);
      return { tag: rs.label, cls: rs.cls, text: `${d.code} · ${d.title}`, href: `/documente/${d.id}` };
    }),
    ...lateTasks.slice(0, 5).map((t) => ({ tag: `Termen depășit · ${fmtDate(t.due_date)}`, cls: "bg-red-50 text-red-800", text: t.title, href: "/plan" })),
  ];

  const kpis = [
    { label: "Cerințe evaluate", value: `${evaluated} / ${requirements.length}`, sub: "autoevaluare", href: "/standarde", warn: false },
    { label: "Documente de revizuit", value: String(docsDue.length), sub: `${drafts.length} în draft, neaprobate`, href: "/documente", warn: docsDue.length > 0 },
    { label: "Sarcini deschise", value: String(openTasks.length), sub: `${lateTasks.length} cu termen depășit`, href: "/plan", warn: lateTasks.length > 0 },
    { label: "Pregătire simulare", value: `${simPct}%`, sub: `${simReady} din ${simTotal} întrebări pregătite`, href: "/simulare", warn: false },
  ];

  const visitDays = ctx.nextVisit ? daysUntil(ctx.nextVisit) : null;

  return (
    <>
      <PageHeader title="Tablou de bord" description={ctx.hospitalName} />

      <section aria-label="Vizita de evaluare" className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-brand-600 px-6 py-5 text-white">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-brand-100">Următoarea vizită de evaluare ANMCS</span>
          <span className="text-2xl font-semibold">
            {ctx.nextVisit
              ? `${fmtDate(ctx.nextVisit)}${visitDays !== null && visitDays >= 0 ? ` · peste ${visitDays} ${visitDays === 1 ? "zi" : "zile"}` : ""}`
              : "Data nu a fost setată"}
          </span>
        </div>
        {ctx.nextVisit ? (
          <Link href="/simulare" className="btn bg-white text-brand-700 hover:bg-brand-50">Începe simularea vizitei</Link>
        ) : ctx.isAdmin ? (
          <Link href="/echipa" className="btn bg-white text-brand-700 hover:bg-brand-50">Setează data vizitei</Link>
        ) : null}
      </section>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
        {kpis.map((k) => (
          <Link key={k.label} href={k.href} className="card flex flex-col gap-1.5 p-5 hover:border-brand-600">
            <span className="text-sm font-medium text-slate-600">{k.label}</span>
            <span className={`text-3xl font-semibold ${k.warn ? "text-red-800" : "text-ink"}`}>{k.value}</span>
            <span className="text-xs text-slate-600">{k.sub}</span>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-4">
        <section aria-label="Conformitate" className="card flex flex-[1_1_420px] flex-wrap items-center gap-7 p-6">
          <div
            role="img"
            aria-label={`Conformitate estimată ${overall} la sută`}
            className="flex size-38 flex-none items-center justify-center rounded-full"
            style={{ background: `conic-gradient(#0f6e6e 0 ${overall}%, #e3e7ec ${overall}% 100%)` }}
          >
            <div className="flex size-29 flex-col items-center justify-center rounded-full bg-white">
              <span className="text-3xl font-bold">{overall}%</span>
              <span className="text-xs text-slate-600">conformitate</span>
            </div>
          </div>
          <div className="flex min-w-60 flex-1 flex-col gap-4">
            <h2 className="font-semibold">Conformitate estimată pe secțiuni</h2>
            {bySection.length === 0 && (
              <p className="text-sm text-slate-600">Nu există încă standarde importate.</p>
            )}
            {bySection.map((s) => (
              <div key={s.id} className="flex flex-col gap-1.5">
                <div className="flex justify-between gap-2 text-sm">
                  <span>
                    <strong>{s.code}</strong> · {s.name}
                  </span>
                  <span className="font-semibold">{s.pct}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                  <div className="h-2 rounded-full bg-brand-600" style={{ width: `${s.pct}%` }} />
                </div>
              </div>
            ))}
            <span className="text-xs text-slate-600">
              Estimare internă: Conform = 1, Parțial = 0,5, restul = 0. Nu reprezintă scorul oficial ANMCS.
            </span>
          </div>
        </section>

        <section aria-label="Necesită atenție" className="card flex flex-[1_1_320px] flex-col gap-3 p-6">
          <h2 className="font-semibold">Necesită atenție</h2>
          {attention.length === 0 && <p className="text-sm text-emerald-800">Nimic urgent în acest moment.</p>}
          {attention.map((a, i) => (
            <Link key={i} href={a.href} className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-slate-50 p-3 hover:border-brand-600">
              <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-bold ${a.cls}`}>{a.tag}</span>
              <span className="text-sm leading-snug">{a.text}</span>
            </Link>
          ))}
        </section>
      </div>
    </>
  );
}
