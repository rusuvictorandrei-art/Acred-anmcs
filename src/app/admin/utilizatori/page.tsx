import { getAdminContext } from "@/lib/admin";
import { PageHeader } from "@/components/PageHeader";
import { ROLES, fmtDateTime } from "@/lib/format";

type UserRow = {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
  full_name: string | null;
  role: string | null;
  hospital_name: string | null;
  is_platform_admin: boolean;
  has_mfa?: boolean;
};

function ago(iso: string | null): string {
  if (!iso) return "niciodată";
  const min = Math.round((Date.now() - Date.parse(iso)) / 60000);
  if (min < 2) return "acum";
  if (min < 60) return `acum ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `acum ${h} ${h === 1 ? "oră" : "ore"}`;
  const d = Math.round(h / 24);
  return `acum ${d} ${d === 1 ? "zi" : "zile"}`;
}

export default async function AdminUsers() {
  const ctx = await getAdminContext();
  const { data } = await ctx.supabase.rpc("admin_users");
  const users = (data ?? []) as UserRow[];

  return (
    <>
      <PageHeader
        title="Utilizatori"
        description="Toate conturile din aplicație, ordonate după ultima conectare. Pentru blocarea sau ștergerea unui cont folosește Supabase → Authentication → Users."
      />
      <section className="card overflow-x-auto">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs text-slate-600">
              {["Utilizator", "Spital", "Rol în spital", "Ultima conectare", "Cont creat", "E-mail confirmat"].map((t) => (
                <th key={t} scope="col" className="border-b border-slate-200 px-4 py-3 font-semibold">{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id + (u.hospital_name ?? "")} className="align-top hover:bg-slate-50">
                <td className="border-b border-slate-100 px-4 py-3">
                  <div className="font-medium">{u.full_name ?? u.email}</div>
                  <div className="text-xs text-slate-600">{u.email}</div>
                  {u.is_platform_admin && (
                    <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900">Administrator platformă</span>
                  )}
                </td>
                <td className="border-b border-slate-100 px-4 py-3">{u.hospital_name ?? <span className="text-slate-500">fără spital</span>}</td>
                <td className="border-b border-slate-100 px-4 py-3">{u.role ? (u.role === "admin" ? "Administrator al spitalului" : ROLES[u.role]) : "—"}</td>
                <td className="border-b border-slate-100 px-4 py-3">
                  <div className="whitespace-nowrap font-medium">{ago(u.last_sign_in_at)}</div>
                  <div className="whitespace-nowrap text-xs text-slate-600">{fmtDateTime(u.last_sign_in_at)}</div>
                </td>
                <td className="whitespace-nowrap border-b border-slate-100 px-4 py-3">{fmtDateTime(u.created_at)}</td>
                <td className="border-b border-slate-100 px-4 py-3">
                  {u.email_confirmed_at ? "Da" : <span className="font-semibold text-amber-900">Neconfirmat</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
