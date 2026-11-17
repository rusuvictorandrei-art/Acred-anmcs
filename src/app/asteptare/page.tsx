import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";
import { signOut } from "@/app/login/actions";
import { requireSecondFactor } from "@/lib/mfa";

export default async function WaitingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await requireSecondFactor(supabase);
  const { data: m } = await supabase
    .from("memberships")
    .select("hospital_id, hospitals(name, status)")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();
  if (!m) redirect("/start");
  const h = m.hospitals as unknown as { name: string; status?: string } | null;
  if (!h?.status || h.status === "aprobat") redirect("/");
  const { data: pa } = await supabase.from("platform_admins").select("user_id").eq("user_id", user.id).maybeSingle();
  const suspended = h.status === "suspendat";

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="card flex w-full max-w-lg flex-col gap-5 p-8">
        <Logo dark />
        <h1 className="text-2xl font-semibold">{suspended ? "Acces suspendat" : "Contul spitalului așteaptă aprobarea"}</h1>
        <p className="text-sm leading-relaxed text-slate-700">
          {suspended ? (
            <>Accesul pentru <strong>{h.name}</strong> a fost suspendat. Datele spitalului sunt păstrate. Pentru reactivare, contactează administratorul platformei.</>
          ) : (
            <>Am primit înregistrarea pentru <strong>{h.name}</strong>. Administratorul platformei verifică fiecare spital nou, de obicei în aceeași zi lucrătoare. După aprobare, reîncarcă pagina și poți începe lucrul.</>
          )}
        </p>
        <div className="flex flex-wrap gap-2">
          <Link href="/" className="btn-primary">Verifică din nou</Link>
          <Link href="/cont" className="btn-secondary">Contul meu</Link>
          {pa && <Link href="/admin" className="btn-secondary">Administrare platformă</Link>}
        </div>
        <form action={signOut}>
          <button className="min-h-11 text-sm text-slate-600 underline">Ieșire din cont</button>
        </form>
      </div>
    </main>
  );
}
