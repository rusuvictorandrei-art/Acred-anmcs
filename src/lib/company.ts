/**
 * DATELE FIRMEI care apar în documentele legale.
 * Completează câmpurile marcate cu [ ] după înființarea firmei; textele se actualizează singure.
 */
export const COMPANY = {
  name: "[DENUMIREA FIRMEI] S.R.L.",
  cui: "[CUI]",
  regCom: "[J__/____/____]",
  address: "[Adresa sediului social]",
  email: "rusu_victor_andrei@yahoo.com", // înlocuiește cu adresa de contact a firmei
  representative: "[Nume și prenume], administrator",
  product: "Acredit",
  website: "https://acred-anmcs.vercel.app",
};

/** Măsuri tehnice care trebuie să fie ADEVĂRATE înainte de a le declara public. */
export const FACTS = {
  /** Proiectul Supabase a fost creat în regiunea Central EU (Frankfurt). Verifică: Supabase → Project Settings → General → Region. */
  supabaseRegionEU: true,
  /** Planul plătit Supabase cu copii de siguranță zilnice este activ. Treci pe true după upgrade. */
  dailyBackups: false,
};

/** Versiunea documentelor. Schimb-o când modifici termenii: utilizatorii noi acceptă noua versiune. */
export const LEGAL_VERSION = "2026-11-17";
export const LEGAL_VERSION_LABEL = "17 noiembrie 2026";
