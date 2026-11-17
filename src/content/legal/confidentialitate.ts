import { COMPANY as C, FACTS } from "@/lib/company";

export const confidentialitate = () => `
## 1. Cine prelucrează datele

Pentru conturile de utilizator și pentru funcționarea Aplicației ${C.product}, operator de date este ${C.name}, ${C.address}, CUI ${C.cui}, e-mail ${C.email}.

Pentru datele pe care o unitate sanitară le introduce în Aplicație despre activitatea și personalul ei (de exemplu responsabili în planul de conformare, autori ai procedurilor), **operatorul este unitatea sanitară**, iar ${C.name} acționează ca persoană împuternicită, conform Acordului de prelucrare a datelor.

## 2. Ce date prelucrăm

- **Date de cont:** adresa de e-mail, numele, parola (păstrată doar în formă criptată ireversibil), unitatea sanitară și rolul.
- **Date de utilizare:** data creării contului, data ultimei conectări, jurnalul acțiunilor din Aplicație (de exemplu „a aprobat documentul PO-12”).
- **Date tehnice:** adresa IP și informații despre browser, păstrate temporar în jurnalele furnizorilor de infrastructură, pentru securitate.
- **Conținut încărcat de unitatea sanitară:** documente, evaluări, observații, sarcini.

Aplicația **nu este destinată datelor despre pacienți**, iar încărcarea lor este interzisă prin Termeni.

## 3. De ce și pe ce temei

- Pentru a crea și administra contul și a furniza serviciul – executarea contractului (art. 6 alin. (1) lit. b) GDPR).
- Pentru securitate, prevenirea abuzurilor și jurnalul de activitate – interesul legitim de a proteja Aplicația și datele clienților (art. 6 alin. (1) lit. f) GDPR).
- Pentru facturare și obligații fiscale – obligație legală (art. 6 alin. (1) lit. c) GDPR).
- Pentru e-mailuri de serviciu (confirmarea contului, resetarea parolei, invitații) – executarea contractului.

Nu folosim datele pentru publicitate, nu le vindem și nu facem profilare.

## 4. Unde sunt păstrate datele

${FACTS.supabaseRegionEU ? "Baza de date și fișierele sunt găzduite în Uniunea Europeană (Frankfurt, Germania)." : "Baza de date și fișierele sunt găzduite la furnizorul de infrastructură indicat mai jos."} Aplicația rulează pe infrastructura furnizorilor de mai jos (împuterniciți secundari):

- **Supabase Inc.** – baza de date, autentificarea și stocarea fișierelor.
- **Vercel Inc.** – găzduirea Aplicației web; funcțiile care accesează datele rulează în regiunea Frankfurt.
- **GitHub Inc.** – păstrarea codului sursă (nu conține date ale clienților).

Supabase, Vercel și GitHub sunt companii cu sediul în SUA. Eventualele transferuri de date în afara Spațiului Economic European se fac pe baza clauzelor contractuale standard ale Comisiei Europene și/sau a cadrului UE–SUA privind confidențialitatea datelor, după caz.

## 5. Cât timp păstrăm datele

- Datele de cont: pe durata contului; după ștergerea contului, cel mult 60 de zile.
- Conținutul unității sanitare: pe durata contractului plus 30 de zile pentru descărcare, apoi se șterge${FACTS.dailyBackups ? "; copiile de siguranță se rotesc și expiră automat în cel mult 30 de zile" : ""}.
- Documentele de facturare: cât prevede legislația fiscală.

## 6. Drepturile tale

Ai dreptul de acces, rectificare, ștergere, restricționare, portabilitate și opoziție, precum și dreptul de a nu face obiectul unei decizii bazate exclusiv pe prelucrare automată. Pentru datele introduse de unitatea sanitară, cererea se adresează în primul rând unității sanitare, iar noi o sprijinim.

Ne poți scrie la ${C.email}. Răspundem în cel mult o lună. Ai și dreptul de a depune plângere la Autoritatea Națională de Supraveghere a Prelucrării Datelor cu Caracter Personal (ANSPDCP), www.dataprotection.ro.

## 7. Cookie-uri

Aplicația folosește doar cookie-uri strict necesare pentru autentificare (păstrarea sesiunii). Nu folosim cookie-uri de analiză sau de publicitate, deci nu este necesar consimțământul pentru ele.

## 8. Securitate

Măsurile tehnice și organizatorice sunt descrise în Fișa de securitate a datelor, disponibilă public în Aplicație.

## 9. Modificări

Putem actualiza această politică. Versiunea în vigoare este afișată mereu în Aplicație, cu data ultimei actualizări.
`;
