// Valorile din Vercel, curățate de spații sau de un „=” lipit din greșeală la început.
function clean(v: string | undefined): string {
  return (v ?? "").trim().replace(/^=+/, "").trim();
}

// Valorile implicite ale proiectului Supabase (publice prin natura lor: datele sunt
// protejate de regulile Row Level Security din baza de date, nu de această cheie).
// Variabilele din Vercel, dacă există, au prioritate.
const DEFAULT_URL = "https://yujsxxamdlpijgdqyjow.supabase.co";
const DEFAULT_KEY = "sb_publishable_R0Slz_E37735iWD65UNzrg_vVF-2lI8";

export const SUPABASE_URL = (clean(process.env.NEXT_PUBLIC_SUPABASE_URL) || DEFAULT_URL).replace(/\/+$/, "");
// Acceptă și numele folosit de Supabase în fereastra „Connect”.
export const SUPABASE_KEY =
  clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY) || DEFAULT_KEY;
export const SUPABASE_CONFIG_OK = /^https?:\/\/\S+$/.test(SUPABASE_URL) && SUPABASE_KEY.length > 20;
