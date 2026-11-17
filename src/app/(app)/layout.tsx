import { getContext } from "@/lib/context";
import { Nav } from "@/components/Nav";
import { Logo } from "@/components/Logo";
import { signOut } from "@/app/login/actions";
import { ROLES } from "@/lib/format";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await getContext();
  const items = [
    { href: "/", label: "Tablou de bord" },
    { href: "/standarde", label: "Standarde și cerințe" },
    { href: "/documente", label: "Proceduri și protocoale" },
    { href: "/plan", label: "Plan de conformare" },
    { href: "/simulare", label: "Simulare vizită" },
    { href: "/dosar", label: "Dosar pentru evaluatori" },
    { href: "/echipa", label: "Echipa și setări" },
    { href: "/cont", label: "Contul meu" },
  ];
  if (ctx.isPlatformAdmin) items.push({ href: "/admin", label: "Administrare platformă" });

  return (
    <div className="flex min-h-screen flex-wrap">
      <div className="no-print w-full bg-navy md:w-64 md:flex-none">
      <nav
        aria-label="Navigare principală"
        className="flex flex-col gap-3 p-4 text-white md:sticky md:top-0 md:h-screen md:gap-6"
      >
        <div className="px-2 pt-2">
          <Logo />
        </div>
        <Nav items={items} />
        <div className="mt-auto hidden flex-col gap-2 rounded-lg md:flex bg-white/5 p-3 text-xs text-slate-300">
          <span className="font-semibold text-white">{ctx.hospitalName}</span>
          <span>
            {ctx.fullName ?? ctx.email} · {ROLES[ctx.role]}
          </span>
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
