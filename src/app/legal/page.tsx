import Link from "next/link";
import { LEGAL_DOCS } from "@/content/legal";
import { LEGAL_VERSION_LABEL } from "@/lib/company";

export const metadata = { title: "Documente legale – Acredit" };

export default function LegalIndex() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Documente legale</h1>
        <p className="mt-1 text-sm text-slate-600">Versiunea din {LEGAL_VERSION_LABEL}</p>
      </div>
      <ul className="flex flex-col gap-3">
        {LEGAL_DOCS.map((d) => (
          <li key={d.slug}>
            <Link href={`/legal/${d.slug}`} className="card flex flex-col gap-1 p-5 hover:border-brand-600">
              <span className="font-semibold">{d.title}</span>
              <span className="text-sm text-slate-600">{d.summary}</span>
              {d.audience === "spitale" && <span className="text-xs font-semibold text-brand-700">Model de semnat cu unitățile sanitare</span>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
