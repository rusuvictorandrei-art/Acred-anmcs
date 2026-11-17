import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Logo } from "@/components/Logo";
import { requireSecondFactor } from "@/lib/mfa";
import { changePassword } from "./actions";

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ parola?: string }> }) {
  const { parola } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  await requireSecondFactor(supabase);

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col gap-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Logo dark />
        <Link href="/" className="btn-secondary">← Înapoi în aplicație</Link>
      </div>
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">Contul meu</h1>
        <p className="text-sm text-slate-600">{user.email}</p>
      </header>

      <section className="card flex flex-col gap-4 p-6">
        <h2 className="font-semibold">Schimbă parola</h2>
        <form action={changePassword} className="flex flex-wrap items-end gap-3">
          <label className="label min-w-0 flex-[1_1_240px]">
            Parola nouă (minimum 10 caractere)
            <input type="password" name="password" minLength={10} required autoComplete="new-password" className="input" />
          </label>
          <button className="btn-primary">Schimbă parola</button>
        </form>
        {parola === "ok" && <p role="status" className="text-sm text-emerald-800">Parola a fost schimbată.</p>}
        {parola && parola !== "ok" && <p role="alert" className="text-sm text-red-700">{parola}</p>}
      </section>
    </main>
  );
}
