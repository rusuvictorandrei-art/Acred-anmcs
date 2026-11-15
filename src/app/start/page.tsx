import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";
import { signOut } from "@/app/login/actions";

async function createHospital(formData: FormData) {
  "use server";
  const name = String(formData.get("name") ?? "").trim();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const supabase = await createClient();
  const { error } = await supabase.rpc("create_hospital", { p_name: name, p_full_name: fullName });
  if (error) redirect("/start?eroare=" + encodeURIComponent(error.message));
  redirect("/");
}

async function claim(formData: FormData) {
  "use server";
  const fullName = String(formData.get("full_name") ?? "").trim();
  const supabase = await createClient();
  const { data } = await supabase.rpc("claim_invitations", { p_full_name: fullName });
  if (!data) redirect("/start?eroare=" + encodeURIComponent("Nu există nicio invitație pentru adresa ta de e-mail."));
  redirect("/");
}

export default async function StartPage({ searchParams }: { searchParams: Promise<{ eroare?: string }> }) {
  const { eroare } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: m } = await supabase.from("memberships").select("hospital_id").eq("user_id", user.id).limit(1);
  if (m && m.length) redirect("/");

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        <Logo dark />
        <h1 className="text-2xl font-semibold">Bun venit! Hai să configurăm contul.</h1>
        {eroare && <p role="alert" className="text-sm text-red-700">{eroare}</p>}
        <div className="grid gap-4 md:grid-cols-2">
          <form action={createHospital} className="card p-6 flex flex-col gap-4">
            <h2 className="font-semibold">Înregistrez spitalul meu</h2>
            <p className="text-sm text-slate-600">Devii administratorul spitalului și poți invita colegii.</p>
            <label className="label">
              Numele tău
              <input className="input" name="full_name" required />
            </label>
            <label className="label">
              Numele spitalului
              <input className="input" name="name" required minLength={2} />
            </label>
            <button className="btn-primary mt-auto">Creează spitalul</button>
          </form>
          <form action={claim} className="card p-6 flex flex-col gap-4">
            <h2 className="font-semibold">Am primit o invitație</h2>
            <p className="text-sm text-slate-600">
              Dacă un coleg te-a invitat pe adresa <strong>{user.email}</strong>, intră în echipa lui.
            </p>
            <label className="label">
              Numele tău
              <input className="input" name="full_name" required />
            </label>
            <button className="btn-secondary mt-auto">Acceptă invitația</button>
          </form>
        </div>
        <form action={signOut}>
          <button className="text-sm text-slate-600 underline min-h-11">Ieșire din cont</button>
        </form>
      </div>
    </main>
  );
}
