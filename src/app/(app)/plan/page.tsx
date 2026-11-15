import { getContext } from "@/lib/context";
import { loadCatalog, loadTasks } from "@/lib/queries";
import { fmtDate, todayISO } from "@/lib/format";
import { PageHeader, ReadOnlyNote } from "@/components/PageHeader";
import { createTask, deleteTask, toggleTask, updateTask } from "../actions";

const SOURCE: Record<string, string> = { manual: "Adăugată manual", simulare: "Din simulare", autoevaluare: "Din autoevaluare" };

export default async function PlanPage() {
  const ctx = await getContext();
  const [tasks, { requirements }] = await Promise.all([loadTasks(ctx), loadCatalog(ctx)]);
  const reqById = new Map(requirements.map((r) => [r.id, r]));
  const today = todayISO();
  const done = tasks.filter((t) => t.done).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  return (
    <>
      <PageHeader
        title="Plan de conformare"
        description="Fiecare neconformitate devine o acțiune cu responsabil și termen. Planul poate fi arătat comisiei de evaluare ca dovadă a îmbunătățirii continue."
      >
        <a href="/dosar?parte=plan" className="btn-secondary">Versiune de tipărit</a>
      </PageHeader>
      {!ctx.canEdit && <ReadOnlyNote />}

      <div className="flex max-w-3xl flex-col gap-2">
        <span className="text-sm text-slate-600">{done} din {tasks.length} acțiuni finalizate</span>
        <div className="h-2 overflow-hidden rounded-full bg-slate-200">
          <div className="h-2 rounded-full bg-brand-600" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {ctx.canEdit && (
        <form action={createTask} className="card flex flex-wrap items-end gap-3 p-5">
          <label className="label min-w-0 flex-[1_1_280px]">
            Acțiune nouă
            <input name="title" className="input" required placeholder="ex. Instruirea personalului privind identificarea pacientului" />
          </label>
          <label className="label min-w-0 flex-[1_1_220px]">
            Cerința
            <select name="requirement_id" className="input" defaultValue="">
              <option value="">— fără —</option>
              {requirements.map((r) => (
                <option key={r.id} value={r.id}>{r.code} · {r.title.slice(0, 70)}</option>
              ))}
            </select>
          </label>
          <label className="label flex-[0_1_180px]">
            Responsabil
            <input name="owner_name" className="input" />
          </label>
          <label className="label flex-[0_1_170px]">
            Termen
            <input type="date" name="due_date" className="input" />
          </label>
          <button className="btn-primary">Adaugă</button>
        </form>
      )}

      <ul className="flex flex-col gap-2.5">
        {tasks.length === 0 && <li className="card p-5 text-sm text-slate-600">Nicio acțiune în plan.</li>}
        {tasks.map((t) => {
          const late = !t.done && t.due_date && t.due_date < today;
          const req = t.requirement_id ? reqById.get(t.requirement_id) : null;
          return (
            <li key={t.id} className="card flex flex-wrap items-center gap-4 p-4">
              <div className="flex min-w-0 flex-[1_1_360px] items-center gap-3">
                {ctx.canEdit ? (
                  <form action={toggleTask}>
                    <input type="hidden" name="id" value={t.id} />
                    <input type="hidden" name="done" value={String(t.done)} />
                    <input type="hidden" name="title" value={t.title} />
                    <button
                      aria-label={t.done ? `Redeschide: ${t.title}` : `Marchează finalizat: ${t.title}`}
                      aria-pressed={t.done}
                      className={`flex size-11 flex-none cursor-pointer items-center justify-center rounded-lg border-2 ${
                        t.done ? "border-brand-600 bg-brand-600 text-white" : "border-slate-400 bg-white"
                      }`}
                    >
                      {t.done && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                          <path d="M5 12l5 5L20 7" />
                        </svg>
                      )}
                    </button>
                  </form>
                ) : (
                  <span className="text-sm font-semibold">{t.done ? "✓" : "○"}</span>
                )}
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className={`font-medium ${t.done ? "text-slate-500 line-through" : ""}`}>{t.title}</span>
                  <span className="text-xs text-slate-600">
                    {req ? `Cerința ${req.code} · ` : ""}{SOURCE[t.source]}
                  </span>
                </div>
              </div>
              {ctx.canEdit && !t.done ? (
                <form action={updateTask} className="flex flex-wrap items-end gap-2">
                  <input type="hidden" name="id" value={t.id} />
                  <label className="label">
                    <span className="sr-only">Responsabil</span>
                    <input name="owner_name" defaultValue={t.owner_name ?? ""} placeholder="Responsabil" className="input w-44" />
                  </label>
                  <label className="label">
                    <span className="sr-only">Termen</span>
                    <input type="date" name="due_date" defaultValue={t.due_date ?? ""} className={`input w-40 ${late ? "border-red-700" : ""}`} />
                  </label>
                  <button className="btn-secondary">Salvează</button>
                </form>
              ) : (
                <span className="text-sm text-slate-600">{t.owner_name ?? "—"} · {fmtDate(t.due_date)}</span>
              )}
              {late && <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-800">Termen depășit</span>}
              {ctx.canEdit && (
                <form action={deleteTask}>
                  <input type="hidden" name="id" value={t.id} />
                  <button className="min-h-11 px-2 text-sm text-red-700 underline" aria-label={`Șterge: ${t.title}`}>Șterge</button>
                </form>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
