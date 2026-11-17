import { getAdminContext } from "@/lib/admin";
import { PageHeader } from "@/components/PageHeader";
import { ImportForm } from "./ImportForm";
import { deleteDemoData } from "../actions";

export default async function ImportPage() {
  const ctx = await getAdminContext();
  const [{ count: reqCount }, { count: simCount }, { count: demoCount }] = await Promise.all([
    ctx.supabase.from("requirements").select("id", { count: "exact", head: true }),
    ctx.supabase.from("sim_questions").select("id", { count: "exact", head: true }),
    ctx.supabase.from("requirements").select("id", { count: "exact", head: true }).like("code", "DEMO-%"),
  ]);

  return (
    <>
      <PageHeader
        title="Import standarde"
        description="Doar pentru administratorul platformei. Catalogul de standarde este comun pentru toate spitalele. Un cod existent se actualizează, un cod nou se adaugă; nimic nu se șterge."
      />
      <p className="text-sm text-slate-600">În catalog acum: {reqCount ?? 0} cerințe și {simCount ?? 0} întrebări de simulare.</p>
      {(demoCount ?? 0) > 0 && (
        <form action={deleteDemoData} className="card flex flex-wrap items-center justify-between gap-3 border-amber-300 bg-amber-50 p-4">
          <span className="text-sm text-amber-900">
            În catalog sunt încă {demoCount} cerințe demonstrative (cod „DEMO-…”). Șterge-le după ce imporți standardele reale. Se șterg și evaluările spitalelor pe aceste cerințe.
          </span>
          <button className="btn-secondary">Șterge cerințele demonstrative</button>
        </form>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card flex flex-col gap-4 p-6">
          <h2 className="font-semibold">Standarde și cerințe</h2>
          <p className="text-sm text-slate-600">
            Fișier CSV (din Excel: „Salvare ca” → CSV UTF-8) cu coloanele:{" "}
            <code className="text-xs">sectiune_cod, sectiune_nume, cod, titlu, descriere, ce_verifica_evaluatorul</code>.
            Primele patru sunt obligatorii.
          </p>
          <a href="/model-standarde.csv" className="text-sm text-brand-700 underline" download>Descarcă fișierul model</a>
          <ImportForm kind="standarde" />
        </section>
        <section className="card flex flex-col gap-4 p-6">
          <h2 className="font-semibold">Întrebări de simulare</h2>
          <p className="text-sm text-slate-600">
            Fișier CSV cu coloanele: <code className="text-xs">cod, domeniu, intrebare, indiciu</code>.
          </p>
          <a href="/model-simulare.csv" className="text-sm text-brand-700 underline" download>Descarcă fișierul model</a>
          <ImportForm kind="simulare" />
        </section>
      </div>
    </>
  );
}
