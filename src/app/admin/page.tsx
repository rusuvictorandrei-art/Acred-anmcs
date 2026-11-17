import Link from "next/link";
import { getAdminContext } from "@/lib/admin";
import { PageHeader } from "@/components/PageHeader";
import { daysUntil, fmtDate, fmtDateTime } from "@/lib/format";

type HospitalRow = {
  id: string;
  name: string;
  created_at: string;
  next_visit: string | null;
  members: number;
  evaluated: number;
  total_requirements: number;
  score: number | null;
  documents: number;
  open_tasks: number;
  last_activity: string | null;
};
type UserRow = { last_sign_in_at: string | null };

export default async function AdminOverview() {
  const ctx = await getAdminContext();
  const [{ data: h, error }, { data: u }] = await Promise.all([
    ctx.supabase.rpc("admin_hospitals"),
    ctx.supabase.rpc("admin_users"),
  ]);
  const hospitals = (h ?? []) as HospitalRow[];
  const users = (u ?? []) as UserRow[];
  const now = Date.now();
  const active7 = users.filter((x) => x.last_sign_in_at && now - Date.parse(x.last_sign_in_at) < 7 * 86400000).length;
  const active30 = users.filter((x) => x.last_sign_in_at && now - Date.parse(x.last_sign_in_at) < 30 * 86400000).length;

  const kpis = [
    { label: "Spitale înregistrate", value: hospitals.length, sub: "toate conturile de spital" },
    { label: "Utilizatori", value: users.length, sub: "conturi create" },
    { label: "Activi în ultimele 7 zile", value: active7, sub: `${active30} în ultimele 30 de zile` },
    {
      label: "Vizite programate",
      value: hospitals.filter((x) => x.next_visit && daysUntil(x.next_visit) >= 0).length,
      sub: "spitale cu dată de evaluare viitoare",
    },
  ];

  return (
    <>
      <PageHeader title="Administrare platformă" description="Situația tuturor spitalelor care folosesc aplicația. Doar tu vezi această pagină." />
      {error && (
        <p role="alert" className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
          Panoul nu poate citi datele. Rulează în Supabase fișierul <code>supabase/admin-panou.sql</code>. ({error.message})
        </p>
      )}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="card flex flex-col gap-1.5 p-5">
            <span className="text-sm font-medium text-slate-600">{k.label}</span>
            <span className="text-3xl font-semibold">{k.value}</span>
            <span className="text-xs text-slate-600">{k.sub}</span>
          </div>
        ))}
      </div>

      <section className="card overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <caption className="px-4 pt-4 text-left font-semibold">Spitale</caption>
          <thead>
            <tr className="text-left text-xs text-slate-600">
              {["Spital", "Înregistrat", "Membri", "Autoevaluare", "Conformitate", "Documente", "Sarcini deschise", "Vizita ANMCS", "Ultima activitate"].map((t) => (
                <th key={t} scope="col" className="border-b border-slate-200 px-4 py-3 font-semibold">{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hospitals.length === 0 && (
              <tr><td colSpan={9} className="px-4 py-6 text-slate-600">Niciun spital înregistrat încă.</td></tr>
            )}
            {hospitals.map((x) => {
              const pct = x.total_requirements ? Math.round((x.evaluated / x.total_requirements) * 100) : 0;
              return (
                <tr key={x.id} className="align-top hover:bg-slate-50">
                  <td className="border-b border-slate-100 px-4 py-3 font-medium">{x.name}</td>
                  <td className="whitespace-nowrap border-b border-slate-100 px-4 py-3">{fmtDate(x.created_at)}</td>
                  <td className="border-b border-slate-100 px-4 py-3">{x.members}</td>
                  <td className="border-b border-slate-100 px-4 py-3">
                    <div className="whitespace-nowrap">{x.evaluated} / {x.total_requirements}</div>
                    <div className="mt-1 h-1.5 w-24 overflow-hidden rounded-full bg-slate-200">
                      <div className="h-1.5 bg-brand-600" style={{ width: `${pct}%` }} />
                    </div>
                  </td>
                  <td className="border-b border-slate-100 px-4 py-3">{x.score ?? 0}%</td>
                  <td className="border-b border-slate-100 px-4 py-3">{x.documents}</td>
                  <td className="border-b border-slate-100 px-4 py-3">{x.open_tasks}</td>
                  <td className="whitespace-nowrap border-b border-slate-100 px-4 py-3">{fmtDate(x.next_visit)}</td>
                  <td className="whitespace-nowrap border-b border-slate-100 px-4 py-3">{fmtDateTime(x.last_activity)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
      <p className="text-xs text-slate-600">
        Conformitatea este estimarea internă a aplicației (Conform = 1, Parțial = 0,5), nu scorul oficial ANMCS.{" "}
        <Link href="/admin/utilizatori" className="text-brand-700 underline">Vezi utilizatorii</Link>
      </p>
    </>
  );
}
