// Valorile din Vercel, curățate de spații sau de un „=” lipit din greșeală la început.
function clean(v: string | undefined): string {
  return (v ?? "").trim().replace(/^=+/, "").trim();
}

export const SUPABASE_URL = clean(process.env.NEXT_PUBLIC_SUPABASE_URL).replace(/\/+$/, "");
export const SUPABASE_KEY = clean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
export const SUPABASE_CONFIG_OK = /^https?:\/\/\S+$/.test(SUPABASE_URL) && SUPABASE_KEY.length > 20;
