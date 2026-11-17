import { getAdminContext } from "@/lib/admin";
import { PageHeader } from "@/components/PageHeader";
import { ACTIONS, fmtDateTime } from "@/lib/format";

type Row = { id: number; created_at: string; action: string; details: string | null; hospital_name: string; email: string | null };

export default async function AdminActivity() {
  const ctx = await getAdminContext();
  const { data } = await ctx.supabase.rpc("admin_activity", { p_limit: 200 });
  const rows = (data ?? []) as Row[];

  return (
    <>
      <PageHeader title="Activitate" description="Ultimele 200 de acțiuni din toate spitalele." />
      <section className="card flex flex-col p-2">
        {rows.length === 0 && <p className="p-4 text-sm text-slate-600">Nicio activitate încă.</p>}
        <ul className="flex flex-col divide-y divide-slate-100">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-wrap gap-x-3 gap-y-1 px-3 py-3 text-sm">
              <span className="w-36 flex-none text-slate-600">{fmtDateTime(r.created_at)}</span>
              <span className="min-w-0 flex-1">
                <strong>{r.email ?? "Utilizator șters"}</strong> {ACTIONS[r.action] ?? r.action} {r.details}
                <span className="block text-xs text-slate-600">{r.hospital_name}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
