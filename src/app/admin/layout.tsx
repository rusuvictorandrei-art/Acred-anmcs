import Link from "next/link";
import { getAdminContext } from "@/lib/admin";
import { Nav } from "@/components/Nav";
import { Logo } from "@/components/Logo";
import { signOut } from "@/app/login/actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getAdminContext();
  const items = [
    { href: "/admin", label: "Prezentare" },
    { href: "/admin/utilizatori", label: "Utilizatori" },
    { href: "/admin/activitate", label: "Activitate" },
    { href: "/admin/import", label: "Import standarde" },
  ];
  // Pe telefon, colțul de jos al meniului e ascuns, deci legătura spre spital e în meniu.
  if (ctx.hasHospital) items.push({ href: "/", label: "← Spitalul meu" });

  return (
    <div className="flex min-h-screen flex-wrap">
      <div className="no-print w-full bg-navy md:w-64 md:flex-none">
        <nav aria-label="Administrare" className="flex flex-col gap-3 p-4 text-white md:sticky md:top-0 md:h-screen md:gap-6">
          <div className="px-2 pt-2">
            <Logo />
            <span className="mt-2 inline-block rounded-full bg-amber-300 px-2 py-0.5 text-xs font-bold text-navy">Administrare platformă</span>
          </div>
          <Nav items={items} exact />
          <div className="mt-auto hidden flex-col gap-2 rounded-lg bg-white/5 p-3 text-xs text-slate-300 md:flex">
            <span className="text-white">{ctx.email}</span>
            {ctx.hasHospital && (
              <Link href="/" className="min-h-11 content-center text-slate-200 underline underline-offset-2">
                ← Înapoi la spitalul meu
              </Link>
            )}
            <form action={signOut}>
              <button className="min-h-11 text-left text-slate-200 underline underline-offset-2">Ieșire din cont</button>
            </form>
          </div>
        </nav>
      </div>
      <main className="min-w-0 flex-1 basis-[560px] p-5 md:p-8">
        <div className="mx-auto flex max-w-6xl flex-col gap-6">{children}</div>
      </main>
    </div>
  );
}
