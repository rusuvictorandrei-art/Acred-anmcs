# Acredit – pregătire pentru acreditarea ANMCS

Aplicație web prin care spitalele își pregătesc documentația și protocoalele pentru evaluarea ANMCS:

- **Tablou de bord**: conformitate estimată pe secțiuni, documente de revizuit, sarcini întârziate, data vizitei.
- **Standarde și cerințe**: autoevaluare pe fiecare cerință (Conform / Parțial / Neconform / Nu se aplică), observații, dovezi atașate.
- **Proceduri și protocoale**: documente cu versiuni (fișiere PDF/Word), aprobare, termen de revizuire, legătură cu cerințele, plus un șablon Word de procedură operațională.
- **Plan de conformare**: acțiuni cu responsabil și termen, create manual, din autoevaluare sau din simulare.
- **Simulare vizită**: întrebări în stilul evaluatorilor. Ce e „De lucrat” intră automat în plan.
- **Dosar pentru evaluatori**: toate cerințele cu status și dovezi, plus planul, gata de tipărit sau salvat ca PDF.
- **Echipa**: roluri (Administrator, Editor, Doar citire), invitații, jurnal de activitate.
- **Import standarde**: catalogul oficial se încarcă dintr-un fișier CSV (doar pentru tine, ca administrator al platformei).

Fiecare spital vede **doar datele lui**. Regula e impusă chiar în baza de date (Row Level Security), nu doar în aplicație.

> Standardele reale (ediția a II-a, 2018: 17 standarde, 802 indicatori) se încarcă rulând o dată `supabase/import-standarde-editia-2.sql` în Supabase → SQL Editor. Fișierul înlocuiește datele demonstrative. Codurile de tip `S1.2-C3-R1-I2` sunt numerotarea internă a aplicației, nu codurile din listele de verificare ANMCS.

---

## Cum pui aplicația online (fără programare)

Ai nevoie de trei conturi gratuite: **GitHub** (aici e codul), **Supabase** (baza de date, conturile și fișierele) și **Vercel** (site-ul). Totul se face din browser, merge și de pe telefon. Durează cam 30 de minute.

### Pasul 1 – Supabase: creează proiectul

1. Intră pe **supabase.com** → **Start your project** → autentifică-te cu GitHub.
2. **New project**. Nume: `acredit`. Alege o parolă pentru baza de date (păstreaz-o). La **Region** alege **Central EU (Frankfurt)**, ca datele să rămână în UE.
3. Apasă **Create new project** și așteaptă 1–2 minute.

### Pasul 2 – Supabase: creează tabelele

1. În proiect, din meniu, deschide **SQL Editor** → **New query**.
2. În GitHub, deschide fișierul `supabase/schema.sql` din acest repository, apasă **Raw**, selectează tot textul și copiază-l.
3. Lipește-l în SQL Editor și apasă **Run**. Trebuie să apară „Success”.
4. Repetă pentru `supabase/seed-demo.sql` (datele demonstrative), într-un **New query** nou.

### Pasul 3 – Supabase: copiază cheile

Mergi la **Project Settings** → **API** (poate apărea și ca **Data API** sau **API Keys**). Notează:

- **Project URL** (arată ca `https://abcdefgh.supabase.co`)
- cheia publică: **anon public** sau **publishable key**

⚠️ Nu folosi niciodată cheia **service_role** / **secret** în aplicație.

### Pasul 4 – Vercel: publică site-ul

1. Intră pe **vercel.com** → **Sign Up** → **Continue with GitHub**.
2. **Add New…** → **Project** → la repository-ul `Acred-anmcs` apasă **Import**.
3. Deschide **Environment Variables** și adaugă două variabile:
   - `NEXT_PUBLIC_SUPABASE_URL` = Project URL de la pasul 3
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = cheia publică de la pasul 3
4. Apasă **Deploy**. După 1–2 minute primești adresa site-ului, de exemplu `https://acred-anmcs.vercel.app`.

> Dacă schimbi mai târziu variabilele, mergi în Vercel la **Deployments** → **Redeploy**, altfel schimbarea nu se aplică.

### Pasul 5 – Supabase: spune-i adresa site-ului

În Supabase: **Authentication** → **URL Configuration**:

- **Site URL**: adresa de la Vercel (ex. `https://acred-anmcs.vercel.app`)
- **Redirect URLs** → **Add URL**: `https://acred-anmcs.vercel.app/auth/callback`

Așa funcționează linkul din e-mailul de confirmare a contului.

### Pasul 6 – Primul cont și drepturile tale de administrator

1. Deschide site-ul, apasă **Creează unul**, fă-ți cont și confirmă e-mailul.
2. Alege **Înregistrez spitalul meu** (poți crea un spital de test).
3. Ca să poți importa standarde, în Supabase → **SQL Editor** rulează (cu adresa ta de e-mail):

```sql
insert into public.platform_admins (user_id)
select id from auth.users where email = 'adresa.ta@exemplu.ro';
```

Reîncarcă site-ul: în meniu apare **Import standarde**.

### Panoul de administrare

Rulează o dată `supabase/admin-panou.sql` în Supabase → SQL Editor (după ce ți-ai făcut cont în aplicație cu adresa de administrator din fișier). În meniu apare **Administrare platformă**: toate spitalele, utilizatorii cu ultima conectare și activitatea pe toată platforma.

### Securitate: aprobarea spitalelor și autentificarea în doi pași

Rulează o dată `supabase/securitate.sql`. Spitalele noi așteaptă aprobarea ta din panou (Aprobă / Respinge / Suspendă). Fiecare utilizator își poate activa autentificarea în doi pași din **Contul meu**; după activare, baza de date nu-i dă acces la date fără codul din aplicația de autentificare. Din panou poți reseta autentificarea pentru cine și-a pierdut telefonul.

### Pasul 7 – Importă standardele reale

1. Pe pagina **Import standarde** descarcă **fișierul model**.
2. Completează-l în Excel, câte un rând pe cerință, cu coloanele: `sectiune_cod`, `sectiune_nume`, `cod`, `titlu`, `descriere`, `ce_verifica_evaluatorul`.
3. Salvează-l ca **CSV UTF-8** și încarcă-l. Dacă reimporți, codurile existente se actualizează.
4. Apasă **Șterge cerințele demonstrative**.

Întrebările de simulare se importă la fel (`cod`, `domeniu`, `intrebare`, `indiciu`).

### Pasul 8 – Adaugă un spital-client

Un spital nou își face singur cont și alege „Înregistrez spitalul meu”. Persoana care îl înregistrează devine administrator și își invită colegii din **Echipa și setări**. Colegii își fac cont cu adresa invitată și aleg „Am primit o invitație”.

---

## Înainte de primul client real

- **Fără date despre pacienți.** Aplicația e gândită pentru documente organizaționale: proceduri, protocoale, procese-verbale. Spune-le clar spitalelor să nu încarce foi de observație sau alte documente cu date de pacienți.
- **Planuri plătite.** Planurile gratuite au limite. Planul gratuit Vercel este pentru uz necomercial, iar proiectele Supabase gratuite se pot suspenda după o perioadă de inactivitate. Pentru clienți care plătesc, treci la planurile plătite (verifică prețurile actuale) și activează backup-urile în Supabase.
- **E-mailuri.** Supabase trimite din oficiu un număr mic de e-mailuri pe oră. Pentru mai mulți utilizatori, configurează un serviciu de e-mail propriu (SMTP) la **Authentication → Emails**.
- **Acord de prelucrare a datelor (DPA)** cu fiecare spital, termeni de utilizare și politică de confidențialitate.

## Ce mai poate fi adăugat

- notificări pe e-mail pentru termene și documente care expiră;
- semnătură electronică la aprobarea documentelor;
- autentificare în doi pași;
- export Word/Excel al dosarului;
- mai multe spitale pe același cont (pentru consultanți).

---

## Pentru programatori

Next.js 15 (App Router, Server Actions) + Supabase (Postgres cu RLS, Auth, Storage) + Tailwind CSS 4.

```bash
cp .env.example .env.local   # completează URL-ul și cheia anon
npm install
npm run dev
```

- `supabase/schema.sql`: tabele, politici RLS, funcții (`create_hospital`, `claim_invitations`), bucket-ul privat `documents` (calea fișierului începe cu `hospital_id`).
- `src/app/(app)/actions.ts`: toate modificările (Server Actions).
- `src/lib/context.ts`: utilizatorul curent, spitalul și rolul.
