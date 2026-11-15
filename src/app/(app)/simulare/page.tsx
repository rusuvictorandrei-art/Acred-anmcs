import { getContext } from "@/lib/context";
import { PageHeader, ReadOnlyNote } from "@/components/PageHeader";
import { answerSim, resetSim } from "../actions";

export default async function SimulationPage() {
  const ctx = await getContext();
  const [{ data: questions }, { data: answers }] = await Promise.all([
    ctx.supabase.from("sim_questions").select("*").order("sort"),
    ctx.supabase.from("sim_answers").select("question_id, answer").eq("hospital_id", ctx.hospitalId),
  ]);
  const qs = questions ?? [];
  const ans = new Map((answers ?? []).map((a) => [a.question_id, a.answer]));
  const ready = qs.filter((q) => ans.get(q.id) === "pregatit").length;
  const answered = qs.filter((q) => ans.has(q.id)).length;
  const pct = qs.length ? Math.round((ready / qs.length) * 100) : 0;

  return (
    <>
      <PageHeader
        title="Simulare vizită"
        description="Întrebări în stilul evaluatorilor. Ce marchezi „De lucrat” intră automat în planul de conformare. Fă simularea cu șefii de secție, nu doar cu biroul de calitate."
      >
        {ctx.canEdit && answered > 0 && (
          <form action={resetSim}>
            <button className="btn-secondary">Începe o simulare nouă</button>
          </form>
        )}
      </PageHeader>
      {!ctx.canEdit && <ReadOnlyNote />}

      <div className="card flex w-fit items-baseline gap-3 px-5 py-3">
        <span className="text-3xl font-bold text-brand-700">{pct}%</span>
        <span className="text-sm text-slate-600">pregătire · {answered} din {qs.length} răspunse</span>
      </div>

      {qs.length === 0 && <p className="card p-5 text-sm text-slate-600">Nu există întrebări de simulare. Administratorul platformei le poate importa.</p>}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-3">
        {qs.map((q, i) => {
          const a = ans.get(q.id);
          return (
            <article
              key={q.id}
              className={`card flex flex-col gap-2.5 p-5 ${a === "pregatit" ? "border-emerald-600" : a === "de_lucrat" ? "border-red-600" : ""}`}
            >
              <span className="text-xs font-semibold text-slate-600">Întrebarea {i + 1} · {q.area}</span>
              <h2 className="font-semibold leading-snug">{q.question}</h2>
              {q.hint && <p className="text-sm leading-relaxed text-slate-600">{q.hint}</p>}
              {ctx.canEdit ? (
                <div className="mt-auto flex flex-wrap gap-2 pt-1">
                  {(
                    [
                      ["pregatit", "Pregătit", "border-emerald-700 bg-emerald-50 text-emerald-800"],
                      ["de_lucrat", "De lucrat", "border-red-700 bg-red-50 text-red-800"],
                    ] as const
                  ).map(([val, label, on]) => (
                    <form key={val} action={answerSim}>
                      <input type="hidden" name="question_id" value={q.id} />
                      <input type="hidden" name="question" value={q.question} />
                      <input type="hidden" name="answer" value={val} />
                      <button
                        aria-pressed={a === val}
                        className={`min-h-11 cursor-pointer rounded-lg border px-4 text-sm font-semibold ${
                          a === val ? on : "border-slate-300 bg-white text-slate-600"
                        }`}
                      >
                        {label}
                      </button>
                    </form>
                  ))}
                </div>
              ) : (
                <span className="mt-auto text-sm font-semibold">{a === "pregatit" ? "Pregătit" : a === "de_lucrat" ? "De lucrat" : "Fără răspuns"}</span>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}
