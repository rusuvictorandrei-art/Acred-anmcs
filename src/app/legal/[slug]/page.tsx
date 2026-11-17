import { notFound } from "next/navigation";
import { LEGAL_DOCS, legalDoc } from "@/content/legal";
import { LegalText } from "@/components/LegalText";
import { PrintButton } from "@/components/PrintButton";
import { LEGAL_VERSION_LABEL } from "@/lib/company";

export function generateStaticParams() {
  return LEGAL_DOCS.map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: `${legalDoc(slug)?.title ?? "Document"} – Acredit` };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = legalDoc(slug);
  if (!doc) notFound();
  return (
    <article className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{doc.title}</h1>
          <p className="mt-1 text-sm text-slate-600">Versiunea din {LEGAL_VERSION_LABEL}</p>
        </div>
        <div className="no-print">
          <PrintButton label={doc.audience === "spitale" ? "Tipărește / salvează PDF pentru semnare" : "Tipărește / salvează PDF"} />
        </div>
      </header>
      <LegalText source={doc.body()} />
    </article>
  );
}
