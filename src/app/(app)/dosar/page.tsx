import Link from "next/link";
import { getContext } from "@/lib/context";
import { loadAssessments, loadCatalog, loadDocuments, loadLinks, loadTasks } from "@/lib/queries";
import { STATUS, fmtDate, fmtDateTime, reviewState, score } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { PrintButton } from "@/components/PrintButton";

type SP = Promise<{ parte?: string; sectiune?: string }>;

export default async function DossierPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const ctx = await getContext();
  const [{ sections, requirements }, assessments, documents, links, tasks] = await Promise.all([
    loadCatalog(ctx),
    loadAssessments(ctx),
    loadDocuments(ctx),
    loadLinks(ctx),
    loadTasks(ctx),
  ]);
  const docById = new Map(documents.map((d) => [d.id, d]));
  const reqById = new Map(requirements.map((r) => [r.id, r]));
  const statusOf = (id: string) => assessments.get(id)?.status ?? "neevaluat";
  const onlyPlan = sp.parte === "plan";
  const shownSections = sections.filter((s) => !sp.sectiune || s.code === sp.sectiune);
  const generated = fmtDateTime(new Date().toISOString());

  return (
    <>
      <div className="no-print">
        <PageHeader
          title="Dosar pentru evaluatori"
          description="Situația fiecărei cerințe cu dovezile atașate, plus planul de conformare. Tipărește-l sau salvează-l ca PDF din fereastra de tipărire."
        >
          <PrintButton />
        </PageHeader>
        <div className="mt-4 flex flex-wrap gap-2 text-sm">
          <Link href="/dosar" className="btn-secondary">Dosar complet</Link>
          {sections.map((s) => (
            <Link key={s.id} href={`/dosar?sectiune=${s.code}`} className="btn-secondary">Doar secțiunea {s.code}</Link>
          ))}
          <Link href="/dosar?parte=plan" className="btn-secondary">Doar planul de conformare</Link>
        </div>
      </div>

      <article className="card flex flex-col gap-8 p-8 print:border-0 print:p-0">
        <header className="flex flex-col gap-1 border-b border-slate-200 pb-4">
          <span className="text-sm text-slate-600">{ctx.hospitalName}</span>
          <h1 className="text-2xl font-semibold">{onlyPlan ? "Plan de conformare" : "Dosar de autoevaluare pentru acreditare"}</h1>
          <span className="text-xs text-slate-600">Generat la {generated} · documente legate: versiunea curentă din aplicație</span>
        </header>

        {!onlyPlan &&
          shownSections.map((s) => {
            const reqs = requirements.filter((r) => r.section_id === s.id);
            return (
              <section key={s.id} className="flex flex-col gap-3 break-inside-avoid-page">
                <h2 className="text-lg font-semibold">
                  Secțiunea {s.code} · {s.name}{" "}
                  <span className="text-sm font-normal text-slate-600">(conformitate estimată {score(reqs.map((r) => statusOf(r.id)))}%)</span>
                </h2>
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="text-left">
                      <th scope="col" className="w-24 border border-slate-300 bg-slate-50 px-2 py-1.5">Cod</th>
                      <th scope="col" className="border border-slate-300 bg-slate-50 px-2 py-1.5">Cerință</th>
                      <th scope="col" className="w-28 border border-slate-300 bg-slate-50 px-2 py-1.5">Status</th>
                      <th scope="col" className="border border-slate-300 bg-slate-50 px-2 py-1.5">Dovezi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reqs.map((r, i) => {
                      const a = assessments.get(r.id);
                      const stdHeader =
                        r.standard_code && r.standard_code !== reqs[i - 1]?.standard_code ? (
                          <tr key={`std-${r.id}`} className="break-inside-avoid">
                            <td colSpan={4} className="border border-slate-300 bg-slate-100 px-2 py-1.5 font-semibold">
                              Standardul {r.standard_code} · {r.standard_name}
                            </td>
                          </tr>
                        ) : null;
                      const st = STATUS[statusOf(r.id) as keyof typeof STATUS];
                      const docs = links.filter((l) => l.requirement_id === r.id).map((l) => docById.get(l.document_id)).filter((d) => d && d.status !== "retras");
                      return [
                        stdHeader,
                        <tr key={r.id} className="break-inside-avoid align-top">
                          <td className="border border-slate-300 px-2 py-1.5 font-semibold">{r.code}</td>
                          <td className="border border-slate-300 px-2 py-1.5">
                            {r.title}
                            {a?.note && <div className="mt-1 text-xs text-slate-600">Observații: {a.note}</div>}
                          </td>
                          <td className="border border-slate-300 px-2 py-1.5">{st.label}</td>
                          <td className="border border-slate-300 px-2 py-1.5">
                            {docs.length === 0 ? (
                              <span className="text-slate-500">—</span>
                            ) : (
                              <ul className="flex flex-col gap-0.5">
                                {docs.map((d) => (
                                  <li key={d!.id}>
                                    {d!.code} · {d!.title}{" "}
                                    <span className="text-xs text-slate-600">
                                      ({d!.status === "aprobat" ? "aprobat" : "draft"}; revizuire {fmtDate(d!.review_due)}
                                      {reviewState(d!.review_due).key === "overdue" ? " – depășită" : ""})
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </td>
                        </tr>,
                      ];
                    })}
                  </tbody>
                </table>
              </section>
            );
          })}

        {(onlyPlan || !sp.sectiune) && (
          <section className="flex flex-col gap-3">
            <h2 className="text-lg font-semibold">Plan de conformare</h2>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-left">
                  <th scope="col" className="border border-slate-300 bg-slate-50 px-2 py-1.5">Acțiune</th>
                  <th scope="col" className="w-24 border border-slate-300 bg-slate-50 px-2 py-1.5">Cerința</th>
                  <th scope="col" className="w-40 border border-slate-300 bg-slate-50 px-2 py-1.5">Responsabil</th>
                  <th scope="col" className="w-28 border border-slate-300 bg-slate-50 px-2 py-1.5">Termen</th>
                  <th scope="col" className="w-24 border border-slate-300 bg-slate-50 px-2 py-1.5">Stadiu</th>
                </tr>
              </thead>
              <tbody>
                {tasks.length === 0 && (
                  <tr><td colSpan={5} className="border border-slate-300 px-2 py-1.5 text-slate-600">Nicio acțiune.</td></tr>
                )}
                {tasks.map((t) => (
                  <tr key={t.id} className="break-inside-avoid align-top">
                    <td className="border border-slate-300 px-2 py-1.5">{t.title}</td>
                    <td className="border border-slate-300 px-2 py-1.5">{t.requirement_id ? reqById.get(t.requirement_id)?.code : "—"}</td>
                    <td className="border border-slate-300 px-2 py-1.5">{t.owner_name ?? "—"}</td>
                    <td className="border border-slate-300 px-2 py-1.5">{fmtDate(t.due_date)}</td>
                    <td className="border border-slate-300 px-2 py-1.5">{t.done ? "Finalizat" : "În lucru"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}
      </article>
    </>
  );
}
