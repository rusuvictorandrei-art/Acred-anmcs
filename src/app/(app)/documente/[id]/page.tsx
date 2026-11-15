import Link from "next/link";
import { notFound } from "next/navigation";
import { getContext } from "@/lib/context";
import { loadCatalog } from "@/lib/queries";
import { DOC_TYPES, fmtDate, fmtDateTime, reviewState } from "@/lib/format";
import { PageHeader, ReadOnlyNote } from "@/components/PageHeader";
import { UploadVersion } from "@/components/UploadVersion";
import { linkRequirement, setDocumentStatus, unlinkRequirement, updateDocument } from "../../actions";

export default async function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getContext();
  const { data: doc } = await ctx.supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .eq("hospital_id", ctx.hospitalId)
    .maybeSingle();
  if (!doc) notFound();

  const [{ data: versions }, { data: linkRows }, { requirements }, { data: members }] = await Promise.all([
    ctx.supabase.from("document_versions").select("*").eq("document_id", id).order("version", { ascending: false }),
    ctx.supabase.from("document_requirements").select("requirement_id").eq("document_id", id),
    loadCatalog(ctx),
    ctx.supabase.from("memberships").select("user_id, full_name, email").eq("hospital_id", ctx.hospitalId),
  ]);
  const nameOf = (uid: string | null) => {
    const m = (members ?? []).find((x) => x.user_id === uid);
    return m?.full_name ?? m?.email ?? "—";
  };
  const linked = new Set((linkRows ?? []).map((l) => l.requirement_id));
  const linkedReqs = requirements.filter((r) => linked.has(r.id));
  const available = requirements.filter((r) => !linked.has(r.id));
  const rs = reviewState(doc.review_due, doc.status);
  const statusLabel = doc.status === "aprobat" ? "Aprobat" : doc.status === "retras" ? "Retras" : "Draft";

  return (
    <>
      <Link href="/documente" className="no-print text-sm text-brand-700 underline underline-offset-2">← Toate documentele</Link>
      <PageHeader title={`${doc.code} · ${doc.title}`} description={`${DOC_TYPES[doc.doc_type]} · ${doc.department ?? "fără secție"}`} />
      {!ctx.canEdit && <ReadOnlyNote />}

      <div className="flex flex-wrap gap-3">
        <span className="rounded-full bg-white px-3 py-1.5 text-sm font-semibold ring-1 ring-slate-200">Status: {statusLabel}</span>
        <span className={`rounded-full px-3 py-1.5 text-sm font-semibold ${rs.cls}`}>
          {rs.label}{doc.review_due ? ` · ${fmtDate(doc.review_due)}` : ""}
        </span>
        {doc.approved_at && (
          <span className="rounded-full bg-white px-3 py-1.5 text-sm ring-1 ring-slate-200">
            Aprobat de {nameOf(doc.approved_by)} la {fmtDateTime(doc.approved_at)}
          </span>
        )}
      </div>

      {ctx.canEdit && (
        <div className="flex flex-wrap gap-2">
          {ctx.isAdmin && doc.status !== "aprobat" && (
            <form action={setDocumentStatus}>
              <input type="hidden" name="id" value={doc.id} />
              <input type="hidden" name="code" value={doc.code} />
              <input type="hidden" name="status" value="aprobat" />
              <button className="btn-primary" disabled={!versions?.length}>Aprobă documentul</button>
            </form>
          )}
          {doc.status !== "retras" ? (
            <form action={setDocumentStatus}>
              <input type="hidden" name="id" value={doc.id} />
              <input type="hidden" name="code" value={doc.code} />
              <input type="hidden" name="status" value="retras" />
              <button className="btn-secondary">Retrage documentul</button>
            </form>
          ) : (
            <form action={setDocumentStatus}>
              <input type="hidden" name="id" value={doc.id} />
              <input type="hidden" name="code" value={doc.code} />
              <input type="hidden" name="status" value="draft" />
              <button className="btn-secondary">Reactivează (draft)</button>
            </form>
          )}
          {ctx.isAdmin && doc.status !== "aprobat" && !versions?.length && (
            <span className="self-center text-sm text-slate-600">Încarcă un fișier înainte de aprobare.</span>
          )}
        </div>
      )}

      <div className="flex flex-wrap gap-4">
        <section className="card flex min-w-0 flex-[1_1_420px] flex-col gap-4 p-6">
          <h2 className="font-semibold">Versiuni</h2>
          {ctx.canEdit && <UploadVersion hospitalId={ctx.hospitalId} documentId={doc.id} />}
          {!versions?.length && <p className="text-sm text-slate-600">Nicio versiune încărcată.</p>}
          <ul className="flex flex-col divide-y divide-slate-100">
            {(versions ?? []).map((v) => (
              <li key={v.id} className="flex flex-wrap items-center justify-between gap-2 py-3">
                <div className="flex min-w-0 flex-col">
                  <span className="font-medium">v{v.version} · {v.file_name}</span>
                  <span className="text-xs text-slate-600">
                    {fmtDateTime(v.created_at)} · {nameOf(v.uploaded_by)}{v.notes ? ` · ${v.notes}` : ""}
                  </span>
                </div>
                <a href={`/documente/descarca/${v.id}`} className="btn-secondary">Descarcă</a>
              </li>
            ))}
          </ul>
        </section>

        <section className="card flex min-w-0 flex-[1_1_360px] flex-col gap-4 p-6">
          <h2 className="font-semibold">Cerințe pentru care este dovadă</h2>
          {linkedReqs.length === 0 && <p className="text-sm text-slate-600">Documentul nu este legat de nicio cerință.</p>}
          <ul className="flex flex-col gap-2">
            {linkedReqs.map((r) => (
              <li key={r.id} className="flex items-start justify-between gap-2 rounded-lg bg-slate-50 p-3">
                <span className="text-sm"><strong>{r.code}</strong> · {r.title}</span>
                {ctx.canEdit && (
                  <form action={unlinkRequirement}>
                    <input type="hidden" name="document_id" value={doc.id} />
                    <input type="hidden" name="requirement_id" value={r.id} />
                    <button className="min-h-11 px-2 text-sm text-red-700 underline" aria-label={`Elimină legătura cu ${r.code}`}>Elimină</button>
                  </form>
                )}
              </li>
            ))}
          </ul>
          {ctx.canEdit && available.length > 0 && (
            <form action={linkRequirement} className="flex flex-wrap items-end gap-2">
              <input type="hidden" name="document_id" value={doc.id} />
              <label className="label min-w-0 flex-[1_1_240px]">
                Leagă de o cerință
                <select name="requirement_id" className="input" required defaultValue="">
                  <option value="" disabled>Alege cerința…</option>
                  {available.map((r) => (
                    <option key={r.id} value={r.id}>{r.code} · {r.title.slice(0, 90)}</option>
                  ))}
                </select>
              </label>
              <button className="btn-primary">Leagă</button>
            </form>
          )}
        </section>
      </div>

      {ctx.canEdit && (
        <details className="card p-6">
          <summary className="flex min-h-11 cursor-pointer items-center font-semibold text-brand-700">Editează detaliile</summary>
          <form action={updateDocument} className="mt-4 grid gap-4 md:grid-cols-2">
            <input type="hidden" name="id" value={doc.id} />
            <label className="label">Cod<input name="code" defaultValue={doc.code} className="input" required /></label>
            <label className="label">Titlu<input name="title" defaultValue={doc.title} className="input" required /></label>
            <label className="label">
              Tip
              <select name="doc_type" defaultValue={doc.doc_type} className="input">
                {Object.entries(DOC_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <label className="label">Secția<input name="department" defaultValue={doc.department ?? ""} className="input" /></label>
            <label className="label">Responsabil<input name="owner_name" defaultValue={doc.owner_name ?? ""} className="input" /></label>
            <label className="label">Termen de revizuire<input type="date" name="review_due" defaultValue={doc.review_due ?? ""} className="input" /></label>
            <div className="md:col-span-2"><button className="btn-primary">Salvează</button></div>
          </form>
        </details>
      )}
    </>
  );
}
