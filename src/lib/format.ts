export const STATUS = {
  neevaluat: { label: "Neevaluat", cls: "bg-slate-100 text-slate-700 border-slate-300" },
  conform: { label: "Conform", cls: "bg-emerald-50 text-emerald-800 border-emerald-700" },
  partial: { label: "Parțial", cls: "bg-amber-50 text-amber-900 border-amber-700" },
  neconform: { label: "Neconform", cls: "bg-red-50 text-red-800 border-red-700" },
  nu_se_aplica: { label: "Nu se aplică", cls: "bg-slate-50 text-slate-600 border-slate-400" },
} as const;

export type AssessmentStatus = keyof typeof STATUS;

export const DOC_TYPES: Record<string, string> = {
  procedura: "Procedură operațională",
  protocol: "Protocol clinic",
  registru: "Registru",
  regulament: "Regulament / ROF / ROI",
  alt: "Alt document",
};

export const ROLES: Record<string, string> = {
  admin: "Administrator",
  editor: "Editor",
  viewer: "Doar citire",
};

/** Data de azi în format YYYY-MM-DD, ora României. */
export function todayISO(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Bucharest" }).format(new Date());
}

export function daysUntil(iso: string): number {
  const a = Date.parse(todayISO() + "T00:00:00Z");
  const b = Date.parse(iso.slice(0, 10) + "T00:00:00Z");
  return Math.round((b - a) / 86400000);
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}.${m}.${y}`;
}

export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("ro-RO", {
    timeZone: "Europe/Bucharest",
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(iso));
}

export type ReviewState = { key: "ok" | "soon" | "overdue" | "none"; label: string; cls: string };

/** Starea termenului de revizuire a unui document (fereastra de avertizare: 30 de zile). */
export function reviewState(reviewDue: string | null, status?: string): ReviewState {
  if (status === "retras") return { key: "none", label: "Retras", cls: "bg-slate-100 text-slate-600" };
  if (!reviewDue) return { key: "none", label: "Fără termen", cls: "bg-slate-100 text-slate-700" };
  const d = daysUntil(reviewDue);
  if (d < 0) return { key: "overdue", label: "Revizuire depășită", cls: "bg-red-50 text-red-800" };
  if (d <= 30) return { key: "soon", label: d === 0 ? "Revizuire azi" : `Revizuire în ${d} ${d === 1 ? "zi" : "zile"}`, cls: "bg-amber-50 text-amber-900" };
  return { key: "ok", label: "Valabil", cls: "bg-emerald-50 text-emerald-800" };
}

/** Scor: Conform = 1, Parțial = 0,5; „Nu se aplică” nu intră în calcul. */
export function score(statuses: string[]): number {
  const relevant = statuses.filter((s) => s !== "nu_se_aplica");
  if (!relevant.length) return 0;
  const sum = relevant.reduce((acc, s) => acc + (s === "conform" ? 1 : s === "partial" ? 0.5 : 0), 0);
  return Math.round((sum / relevant.length) * 100);
}

/** Textul afișat în jurnalul de activitate. */
export const ACTIONS: Record<string, string> = {
  spital_creat: "a creat spitalul",
  autoevaluare: "a evaluat cerința",
  sarcina_noua: "a adăugat acțiunea",
  sarcina_finalizata: "a finalizat acțiunea",
  sarcina_redeschisa: "a redeschis acțiunea",
  document_nou: "a creat documentul",
  versiune_noua: "a încărcat versiunea",
  document_aprobat: "a aprobat documentul",
  document_retras: "a retras documentul",
  document_draft: "a reactivat documentul",
  invitatie: "a invitat",
};
