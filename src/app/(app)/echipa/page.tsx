import { getContext } from "@/lib/context";
import { ACTIONS, ROLES, fmtDateTime } from "@/lib/format";
import { PageHeader } from "@/components/PageHeader";
import { signOut } from "@/app/login/actions";
import { cancelInvite, changeRole, inviteMember, removeMember, updateHospital } from "../actions";



export default async function TeamPage() {
  const ctx = await getContext();
  const [{ data: hospital }, { data: members }, invites, { data: activity }] = await Promise.all([
    ctx.supabase.from("hospitals").select("name, next_visit").eq("id", ctx.hospitalId).single(),
    ctx.supabase.from("memberships").select("user_id, role, full_name, email").eq("hospital_id", ctx.hospitalId).order("created_at"),
    ctx.isAdmin
      ? ctx.supabase.from("invitations").select("id, email, role, accepted_at").eq("hospital_id", ctx.hospitalId).is("accepted_at", null)
      : Promise.resolve({ data: [] as { id: string; email: string; role: string; accepted_at: string | null }[] }),
    ctx.supabase.from("activity_log").select("id, user_id, action, details, created_at").eq("hospital_id", ctx.hospitalId).order("created_at", { ascending: false }).limit(30),
  ]);
  const nameOf = (uid: string | null) => {
    const m = (members ?? []).find((x) => x.user_id === uid);
    return m?.full_name ?? m?.email ?? "Utilizator";
  };

  return (
    <>
      <PageHeader title="Echipa și setări" description="Cine are acces la datele spitalului și ce poate face.">
        <form action={signOut}>
          <button className="btn-secondary">Ieșire din cont</button>
        </form>
      </PageHeader>

      {ctx.isAdmin && (
        <form action={updateHospital} className="card grid gap-4 p-6 md:grid-cols-[1fr_220px_auto] md:items-end">
          <label className="label">
            Numele spitalului
            <input name="name" defaultValue={hospital?.name} className="input" required minLength={2} />
          </label>
          <label className="label">
            Data vizitei de evaluare
            <input type="date" name="next_visit" defaultValue={hospital?.next_visit ?? ""} className="input" />
          </label>
          <button className="btn-primary">Salvează</button>
        </form>
      )}

      <section className="card flex flex-col gap-4 p-6">
        <h2 className="font-semibold">Membri</h2>
        <p className="text-sm text-slate-600">
          <strong>Administrator</strong>: tot, inclusiv aprobarea documentelor și echipa. <strong>Editor</strong>: autoevaluare, documente, plan.{" "}
          <strong>Doar citire</strong>: vede tot, nu modifică nimic.
        </p>
        <ul className="flex flex-col divide-y divide-slate-100">
          {(members ?? []).map((m) => (
            <li key={m.user_id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="flex flex-col">
                <span className="font-medium">{m.full_name ?? m.email}{m.user_id === ctx.userId ? " (tu)" : ""}</span>
                <span className="text-xs text-slate-600">{m.email}</span>
              </div>
              {ctx.isAdmin && m.user_id !== ctx.userId ? (
                <div className="flex flex-wrap items-center gap-2">
                  <form action={changeRole} className="flex gap-2">
                    <input type="hidden" name="user_id" value={m.user_id} />
                    <label className="sr-only" htmlFor={`role-${m.user_id}`}>Rol</label>
                    <select id={`role-${m.user_id}`} name="role" defaultValue={m.role} className="input w-40">
                      {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                    <button className="btn-secondary">Schimbă</button>
                  </form>
                  <form action={removeMember}>
                    <input type="hidden" name="user_id" value={m.user_id} />
                    <button className="min-h-11 px-2 text-sm text-red-700 underline">Elimină</button>
                  </form>
                </div>
              ) : (
                <span className="text-sm text-slate-600">{ROLES[m.role]}</span>
              )}
            </li>
          ))}
        </ul>
      </section>

      {ctx.isAdmin && (
        <section className="card flex flex-col gap-4 p-6">
          <h2 className="font-semibold">Invită un coleg</h2>
          <p className="text-sm text-slate-600">
            Colegul își face cont cu aceeași adresă de e-mail, apoi alege „Am primit o invitație”.
          </p>
          <form action={inviteMember} className="flex flex-wrap items-end gap-3">
            <label className="label min-w-0 flex-[1_1_260px]">
              E-mail
              <input type="email" name="email" className="input" required />
            </label>
            <label className="label">
              Rol
              <select name="role" defaultValue="editor" className="input w-44">
                {Object.entries(ROLES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <button className="btn-primary">Trimite invitația</button>
          </form>
          {(invites.data ?? []).length > 0 && (
            <ul className="flex flex-col gap-2">
              {(invites.data ?? []).map((i) => (
                <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm">
                  <span>{i.email} · {ROLES[i.role]} · în așteptare</span>
                  <form action={cancelInvite}>
                    <input type="hidden" name="id" value={i.id} />
                    <button className="min-h-11 px-2 text-red-700 underline">Anulează</button>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <section className="card flex flex-col gap-3 p-6">
        <h2 className="font-semibold">Documente contractuale</h2>
        <p className="text-sm text-slate-600">Modelele de semnat între unitatea sanitară și furnizorul aplicației. Le poți tipări sau salva ca PDF.</p>
        <ul className="flex flex-wrap gap-2">
          <li><a href="/legal/contract" className="btn-secondary">Contract de abonament</a></li>
          <li><a href="/legal/acord-prelucrare-date" className="btn-secondary">Acord de prelucrare a datelor</a></li>
          <li><a href="/legal/securitate" className="btn-secondary">Fișa de securitate</a></li>
          <li><a href="/legal/termeni" className="btn-secondary">Termeni</a></li>
        </ul>
      </section>

      <section className="card flex flex-col gap-3 p-6">
        <h2 className="font-semibold">Activitate recentă</h2>
        {(activity ?? []).length === 0 && <p className="text-sm text-slate-600">Nicio activitate încă.</p>}
        <ul className="flex flex-col gap-2 text-sm">
          {(activity ?? []).map((a) => (
            <li key={a.id} className="flex flex-wrap gap-x-2">
              <span className="text-slate-600">{fmtDateTime(a.created_at)}</span>
              <span>
                <strong>{nameOf(a.user_id)}</strong> {ACTIONS[a.action] ?? a.action} {a.details}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
