import Link from "next/link";
import { getContext } from "@/lib/context";
import { loadAssessments, loadCatalog, loadDocuments, loadLinks } from "@/lib/queries";
import { STATUS, fmtDateTime } from "@/lib/format";
import { PageHeader, ReadOnlyNote } from "@/components/PageHeader";
import { createTask, saveAssessmentNote, setAssessment } from "../actions";

type SP = Promise<{ sectiune?: string; standard?: string; status?: string; cauta?: string }>;

export default async function StandardsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const ctx = await getContext();
  const [{ sections, requirements }, assessments, documents, links] = await Promise.all([
    loadCatalog(ctx),
    loadAssessments(ctx),
    loadDocuments(ctx),
    loadLinks(ctx),
  ]);
  const docById = new Map(documents.map((d) => [d.id, d]));
  const sectionById = new Map(sections.map((s) => [s.id, s]));
  const statusOf = (id: string) => assessments.get(id)?.status ?? "neevaluat";

  const q = (sp.cauta ?? "").trim().toLowerCase();
  const inSection = requirements.filter((r) => !sp.sectiune || sectionById.get(r.section_id)?.code === sp.sectiune);

  // Standardele din secțiunea aleasă, în ordine.
  const standards: { code: string; name: string; total: number }[] = [];
  for (const r of inSection) {
    if (!r.standard_code) continue;
    const last = standards.find((x) => x.code === r.standard_code);
    if (last) last.total++;
    else standards.push({ code: r.standard_code, name: r.standard_name ?? "", total: 1 });
  }
  // Catalogul mare se afișează pe câte un standard; căutarea și filtrul de status lucrează pe toate.
  const activeStandard =
    sp.standard === "toate"
      ? undefined
      : sp.standard && standards.some((x) => x.code === sp.standard)
        ? sp.standard
        : !q && !sp.status && standards.length > 1
          ? standards[0].code
          : undefined;

  const filtered = inSection.filter((r) => {
    if (activeStandard && r.standard_code !== activeStandard) return false;
    if (sp.status && statusOf(r.id) !== sp.status) return false;
    if (q && !`${r.code} ${r.title} ${r.description ?? ""} ${r.cerinta ?? ""} ${r.criterion ?? ""}`.toLowerCase().includes(q)) return false;
    return true;
  });
  const done = filtered.filter((r) => statusOf(r.id) !== "neevaluat").length;

  const href = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { sectiune: sp.sectiune, standard: sp.standard, status: sp.status, cauta: sp.cauta, ...patch };
    Object.entries(merged).forEach(([k, v]) => v && p.set(k, v));
    const s = p.toString();
    return "/standarde" + (s ? "?" + s : "");
  };

  const pill = (active: boolean) =>
    `inline-flex items-center min-h-11 rounded-full border px-4 text-sm font-semibold ${
      active ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white text-ink hover:border-brand-600"
    }`;

  return (
    <>
      <PageHeader
        title="Standarde și cerințe"
        description="Autoevaluare pe cerințele standardelor de acreditare. Marchează fiecare cerință, atașează dovezile din „Proceduri și protocoale” și trimite neconformitățile în planul de conformare."
      />
      {!ctx.canEdit && <ReadOnlyNote />}

      <div className="flex flex-col gap-3">
        <div role="group" aria-label="Secțiune" className="flex flex-wrap gap-2">
          <Link href={href({ sectiune: undefined, standard: undefined })} className={pill(!sp.sectiune)}>Toate secțiunile</Link>
          {sections.map((s) => (
            <Link key={s.id} href={href({ sectiune: s.code, standard: undefined })} className={pill(sp.sectiune === s.code)} title={s.name}>
              {s.code} · {s.name}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div role="group" aria-label="Status" className="flex flex-wrap gap-2">
            <Link href={href({ status: undefined })} className={pill(!sp.status)}>Orice status</Link>
            {Object.entries(STATUS).map(([k, v]) => (
              <Link key={k} href={href({ status: k })} className={pill(sp.status === k)}>{v.label}</Link>
            ))}
          </div>
          <form action="/standarde" className="flex gap-2">
            {sp.sectiune && <input type="hidden" name="sectiune" value={sp.sectiune} />}
            {sp.standard && <input type="hidden" name="standard" value={sp.standard} />}
            {sp.status && <input type="hidden" name="status" value={sp.status} />}
            <label className="sr-only" htmlFor="cauta">Caută</label>
            <input id="cauta" name="cauta" defaultValue={sp.cauta} placeholder="Caută cod sau text" className="input w-56" />
            <button className="btn-secondary">Caută</button>
          </form>
        </div>
        {standards.length > 1 && (
          <form action="/standarde" className="flex flex-wrap items-end gap-2">
            {sp.sectiune && <input type="hidden" name="sectiune" value={sp.sectiune} />}
            {sp.status && <input type="hidden" name="status" value={sp.status} />}
            {sp.cauta && <input type="hidden" name="cauta" value={sp.cauta} />}
            <label className="label min-w-0 flex-[1_1_320px]">
              Standard
              <select name="standard" defaultValue={activeStandard ?? "toate"} className="input">
                <option value="toate">Toate standardele ({inSection.length} indicatori)</option>
                {standards.map((x) => (
                  <option key={x.code} value={x.code}>
                    {x.code} · {x.name.slice(0, 80)}{x.name.length > 80 ? "…" : ""} ({x.total})
                  </option>
                ))}
              </select>
            </label>
            <button className="btn-secondary">Arată</button>
          </form>
        )}
        <p className="text-sm text-slate-600">
          {filtered.length} indicatori afișați din {requirements.length} · {done} evaluați
        </p>
      </div>

      {requirements.length === 0 && (
        <div className="card p-6 text-sm text-slate-600">
          Catalogul de standarde este gol. Administratorul platformei trebuie să importe standardele (pagina „Import standarde”).
        </div>
      )}

      <div className="flex flex-col gap-3">
        {filtered.map((r, i) => {
          const prev = filtered[i - 1];
          const newStd = r.standard_code && r.standard_code !== prev?.standard_code;
          const newCr = r.criterion && (newStd || r.criterion !== prev?.criterion);
          const newCer = r.cerinta && r.cerinta !== r.criterion && (newCr || r.cerinta !== prev?.cerinta);
          const a = assessments.get(r.id);
          const status = statusOf(r.id);
          const section = sectionById.get(r.section_id);
          const docs = links.filter((l) => l.requirement_id === r.id).map((l) => docById.get(l.document_id)).filter(Boolean);
          return (
            <div key={r.id} className="flex flex-col gap-3">
            {newStd && (
              <h2 className="mt-4 rounded-xl bg-navy px-5 py-4 text-base font-semibold leading-snug text-white">
                Standardul {r.standard_code} · {r.standard_name}
              </h2>
            )}
            {newCr && (
              <div className="rounded-lg border-l-4 border-brand-600 bg-brand-50 px-4 py-3 text-sm">
                <span className="font-semibold text-brand-700">Criteriu: </span>
                {r.criterion}
              </div>
            )}
            {newCer && (
              <div className="px-1 text-sm text-slate-700">
                <span className="font-semibold">Cerința: </span>
                {r.cerinta}
              </div>
            )}
            <article className="card flex flex-col gap-4 p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex min-w-0 flex-[1_1_380px] flex-col gap-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">{r.code}</span>
                    <span className="text-xs text-slate-600">
                      {r.standard_code ? `Standardul ${r.standard_code}` : `${section?.code} · ${section?.name}`}
                    </span>
                  </div>
                  <h2 className="text-base font-medium leading-snug">{r.title}</h2>
                  {r.description && <p className="text-sm text-slate-600">{r.description}</p>}
                  {r.guidance && (
                    <details className="text-sm" open={r.guidance.startsWith("⚠")}>
                      <summary className="cursor-pointer py-1 font-medium text-brand-700">Ce verifică evaluatorul</summary>
                      <p className="mt-1 whitespace-pre-line text-slate-700">{r.guidance}</p>
                    </details>
                  )}
                </div>
                {ctx.canEdit ? (
                  <div role="group" aria-label={`Status ${r.code}`} className="flex flex-wrap gap-1.5">
                    {Object.entries(STATUS)
                      .filter(([k]) => k !== "neevaluat")
                      .map(([k, v]) => (
                        <form key={k} action={setAssessment}>
                          <input type="hidden" name="requirement_id" value={r.id} />
                          <input type="hidden" name="code" value={r.code} />
                          <input type="hidden" name="status" value={status === k ? "neevaluat" : k} />
                          <button
                            aria-pressed={status === k}
                            className={`min-h-11 cursor-pointer rounded-lg border px-3 text-sm font-semibold ${
                              status === k ? v.cls : "border-slate-300 bg-white text-slate-600 hover:border-slate-500"
                            }`}
                          >
                            {v.label}
                          </button>
                        </form>
                      ))}
                  </div>
                ) : (
                  <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${STATUS[status as keyof typeof STATUS].cls}`}>
                    {STATUS[status as keyof typeof STATUS].label}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-4 border-t border-slate-100 pt-4">
                <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-600">Dovezi atașate</span>
                  {docs.length === 0 ? (
                    <span className="text-sm text-slate-600">Niciun document legat. Leagă documente din pagina fiecărui document.</span>
                  ) : (
                    <ul className="flex flex-col gap-1">
                      {docs.map((d) => (
                        <li key={d!.id}>
                          <Link href={`/documente/${d!.id}`} className="text-sm text-brand-700 underline underline-offset-2">
                            {d!.code} · {d!.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex min-w-0 flex-[1_1_300px] flex-col gap-2">
                  {ctx.canEdit ? (
                    <form action={saveAssessmentNote} className="flex flex-col gap-2">
                      <input type="hidden" name="requirement_id" value={r.id} />
                      <label className="label">
                        Observații
                        <textarea name="note" defaultValue={a?.note ?? ""} rows={2} className="input" />
                      </label>
                      <button className="btn-secondary self-start">Salvează observația</button>
                    </form>
                  ) : (
                    a?.note && <p className="text-sm"><strong>Observații:</strong> {a.note}</p>
                  )}
                  {a && <span className="text-xs text-slate-600">Actualizat: {fmtDateTime(a.updated_at)}</span>}
                </div>
              </div>

              {ctx.canEdit && (status === "neconform" || status === "partial") && (
                <form action={createTask} className="flex flex-wrap items-end gap-2 rounded-lg bg-slate-50 p-3">
                  <input type="hidden" name="requirement_id" value={r.id} />
                  <input type="hidden" name="source" value="autoevaluare" />
                  <label className="label flex-[1_1_260px]">
                    Acțiune în planul de conformare
                    <input name="title" className="input" defaultValue={`Remediere ${r.code}: ${r.title}`} required />
                  </label>
                  <label className="label flex-[0_1_180px]">
                    Responsabil
                    <input name="owner_name" className="input" />
                  </label>
                  <label className="label flex-[0_1_170px]">
                    Termen
                    <input type="date" name="due_date" className="input" />
                  </label>
                  <button className="btn-primary">Adaugă în plan</button>
                </form>
              )}
            </article>
            </div>
          );
        })}
      </div>
    </>
  );
}
