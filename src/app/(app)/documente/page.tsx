import Link from "next/link";
import { getContext } from "@/lib/context";
import { loadDocuments, loadLinks } from "@/lib/queries";
import { DOC_TYPES, fmtDate, reviewState } from "@/lib/format";
import { PageHeader, ReadOnlyNote } from "@/components/PageHeader";
import { createDocument } from "../actions";

type SP = Promise<{ tip?: string; stare?: string; eroare?: string }>;

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "bg-blue-50 text-blue-900" },
  aprobat: { label: "Aprobat", cls: "bg-emerald-50 text-emerald-800" },
  retras: { label: "Retras", cls: "bg-slate-100 text-slate-600" },
};

export default async function DocumentsPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const ctx = await getContext();
  const [documents, links, versions] = await Promise.all([
    loadDocuments(ctx),
    loadLinks(ctx),
    ctx.supabase.from("document_versions").select("document_id, version").eq("hospital_id", ctx.hospitalId),
  ]);
  const latest = new Map<string, number>();
  (versions.data ?? []).forEach((v) => latest.set(v.document_id, Math.max(latest.get(v.document_id) ?? 0, v.version)));

  const filtered = documents.filter((d) => {
    if (sp.tip && d.doc_type !== sp.tip) return false;
    if (sp.stare === "revizuire" && !["soon", "overdue"].includes(reviewState(d.review_due, d.status).key)) return false;
    if (sp.stare === "draft" && d.status !== "draft") return false;
    return true;
  });

  const pill = (active: boolean) =>
    `inline-flex items-center min-h-11 rounded-full border px-4 text-sm font-semibold ${
      active ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white text-ink hover:border-brand-600"
    }`;
  const href = (patch: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    Object.entries({ tip: sp.tip, stare: sp.stare, ...patch }).forEach(([k, v]) => v && p.set(k, v));
    const s = p.toString();
    return "/documente" + (s ? "?" + s : "");
  };

  return (
    <>
      <PageHeader
        title="Proceduri și protocoale"
        description="Procedurile, protocoalele și registrele spitalului, cu versiuni, aprobare, termen de revizuire și legătura cu cerințele standardelor."
      >
        <a href="/documente/sablon" className="btn-secondary">Descarcă șablon procedură (Word)</a>
      </PageHeader>
      {!ctx.canEdit && <ReadOnlyNote />}
      {sp.eroare && <p role="alert" className="text-sm text-red-700">{sp.eroare}</p>}

      {ctx.canEdit && (
        <details className="card p-5">
          <summary className="cursor-pointer font-semibold text-brand-700 min-h-11 flex items-center">+ Document nou</summary>
          <form action={createDocument} className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="label">
              Cod
              <input name="code" className="input" placeholder="ex. PO-12" required />
            </label>
            <label className="label">
              Titlu
              <input name="title" className="input" placeholder="ex. Transferul pacientului între secții" required />
            </label>
            <label className="label">
              Tip
              <select name="doc_type" className="input" defaultValue="procedura">
                {Object.entries(DOC_TYPES).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </label>
            <label className="label">
              Secția / compartimentul
              <input name="department" className="input" placeholder="ex. ATI, Toate secțiile" />
            </label>
            <label className="label">
              Responsabil
              <input name="owner_name" className="input" placeholder="ex. Șef secție ATI" />
            </label>
            <label className="label">
              Termen de revizuire
              <input name="review_due" type="date" className="input" />
            </label>
            <div className="md:col-span-2">
              <button className="btn-primary">Creează documentul</button>
            </div>
          </form>
        </details>
      )}

      <div className="flex flex-wrap gap-2">
        <Link href={href({ tip: undefined })} className={pill(!sp.tip)}>Toate tipurile</Link>
        {Object.entries(DOC_TYPES).map(([k, v]) => (
          <Link key={k} href={href({ tip: k })} className={pill(sp.tip === k)}>{v}</Link>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Link href={href({ stare: undefined })} className={pill(!sp.stare)}>Toate</Link>
        <Link href={href({ stare: "revizuire" })} className={pill(sp.stare === "revizuire")}>De revizuit (30 de zile)</Link>
        <Link href={href({ stare: "draft" })} className={pill(sp.stare === "draft")}>Neaprobate</Link>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-600">
              <th scope="col" className="border-b border-slate-200 px-4 py-3 font-semibold">Cod</th>
              <th scope="col" className="border-b border-slate-200 px-4 py-3 font-semibold">Document</th>
              <th scope="col" className="border-b border-slate-200 px-4 py-3 font-semibold">Secția</th>
              <th scope="col" className="border-b border-slate-200 px-4 py-3 font-semibold">Versiune</th>
              <th scope="col" className="border-b border-slate-200 px-4 py-3 font-semibold">Aprobare</th>
              <th scope="col" className="border-b border-slate-200 px-4 py-3 font-semibold">Revizuire</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-slate-600">Niciun document.</td>
              </tr>
            )}
            {filtered.map((d) => {
              const rs = reviewState(d.review_due, d.status);
              const st = STATUS_LABEL[d.status];
              const n = links.filter((l) => l.document_id === d.id).length;
              return (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap border-b border-slate-100 px-4 py-3 font-semibold text-brand-700">
                    <Link href={`/documente/${d.id}`} className="underline underline-offset-2">{d.code}</Link>
                  </td>
                  <td className="border-b border-slate-100 px-4 py-3">
                    <Link href={`/documente/${d.id}`} className="font-medium hover:underline">{d.title}</Link>
                    <div className="text-xs text-slate-600">{DOC_TYPES[d.doc_type]} · {n} {n === 1 ? "cerință legată" : "cerințe legate"}</div>
                  </td>
                  <td className="border-b border-slate-100 px-4 py-3">{d.department ?? "—"}</td>
                  <td className="border-b border-slate-100 px-4 py-3">{latest.get(d.id) ? `v${latest.get(d.id)}` : "fără fișier"}</td>
                  <td className="border-b border-slate-100 px-4 py-3">
                    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${st.cls}`}>{st.label}</span>
                  </td>
                  <td className="border-b border-slate-100 px-4 py-3">
                    <div className="whitespace-nowrap">{fmtDate(d.review_due)}</div>
                    <span className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold ${rs.cls}`}>{rs.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
