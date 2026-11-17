import { termeni } from "./termeni";
import { confidentialitate } from "./confidentialitate";
import { dpa } from "./dpa";
import { contract } from "./contract";
import { securitate } from "./securitate";

export type LegalDoc = { slug: string; title: string; summary: string; audience: "toți" | "spitale"; body: () => string };

export const LEGAL_DOCS: LegalDoc[] = [
  { slug: "termeni", title: "Termeni și condiții de utilizare", summary: "Regulile de folosire a aplicației, inclusiv interdicția datelor despre pacienți.", audience: "toți", body: termeni },
  { slug: "confidentialitate", title: "Politica de confidențialitate", summary: "Ce date prelucrăm, de ce, unde sunt păstrate și ce drepturi ai.", audience: "toți", body: confidentialitate },
  { slug: "securitate", title: "Fișa de securitate a datelor", summary: "Măsurile tehnice și organizatorice de protecție (GDPR art. 32, NIS2).", audience: "toți", body: securitate },
  { slug: "acord-prelucrare-date", title: "Acord de prelucrare a datelor (DPA)", summary: "Model de semnat cu fiecare unitate sanitară, conform art. 28 GDPR.", audience: "spitale", body: dpa },
  { slug: "contract", title: "Contract de abonament", summary: "Model de contract între furnizor și unitatea sanitară.", audience: "spitale", body: contract },
];

export const legalDoc = (slug: string) => LEGAL_DOCS.find((d) => d.slug === slug);
