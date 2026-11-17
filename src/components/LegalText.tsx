import { Fragment } from "react";

/** Afișează un text simplu: „## titlu”, „### subtitlu”, „- listă”, „1. listă numerotată”, **îngroșat**, paragrafe. */
function inline(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? <strong key={i}>{part.slice(2, -2)}</strong> : <Fragment key={i}>{part}</Fragment>,
  );
}

export function LegalText({ source }: { source: string }) {
  const blocks = source.trim().split(/\n\s*\n/);
  return (
    <div className="flex flex-col gap-4 text-[15px] leading-relaxed text-slate-800">
      {blocks.map((block, i) => {
        const lines = block.split("\n").map((l) => l.trim());
        const first = lines[0];
        if (first.startsWith("### ")) return <h3 key={i} className="mt-2 text-base font-semibold text-ink">{inline(first.slice(4))}</h3>;
        if (first.startsWith("## ")) return <h2 key={i} className="mt-4 text-lg font-semibold text-ink break-after-avoid">{inline(first.slice(3))}</h2>;
        if (lines.every((l) => l.startsWith("- ")))
          return (
            <ul key={i} className="flex list-disc flex-col gap-1.5 pl-6">
              {lines.map((l, j) => <li key={j}>{inline(l.slice(2))}</li>)}
            </ul>
          );
        if (lines.every((l) => /^\d+\.\s/.test(l)))
          return (
            <ol key={i} className="flex list-decimal flex-col gap-1.5 pl-6">
              {lines.map((l, j) => <li key={j}>{inline(l.replace(/^\d+\.\s/, ""))}</li>)}
            </ol>
          );
        return <p key={i}>{inline(lines.join(" "))}</p>;
      })}
    </div>
  );
}
