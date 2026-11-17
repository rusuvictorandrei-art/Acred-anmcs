import { COMPANY as C } from "@/lib/company";

export const termeni = () => `
## 1. Cine suntem

Aplicația ${C.product} (denumită în continuare „Aplicația”), disponibilă la ${C.website}, este furnizată de ${C.name}, cu sediul în ${C.address}, CUI ${C.cui}, înregistrată la Registrul Comerțului sub nr. ${C.regCom} (denumită în continuare „Furnizorul”). Ne poți contacta la ${C.email}.

Prin crearea unui cont sau prin utilizarea Aplicației accepți acești Termeni și condiții. Dacă folosești Aplicația în numele unei unități sanitare, declari că ai dreptul să o reprezinți în acest scop.

## 2. Ce face Aplicația

Aplicația ajută unitățile sanitare să se pregătească pentru evaluarea în vederea acreditării de către Autoritatea Națională de Management al Calității în Sănătate (ANMCS): autoevaluare pe standarde și indicatori, gestionarea procedurilor și protocoalelor, plan de conformare, simulare a vizitei de evaluare și dosar pentru evaluatori.

**Aplicația este un instrument de lucru și de organizare. Ea nu garantează acreditarea și nici încadrarea într-o anumită categorie de acreditare.** Decizia de acreditare aparține exclusiv ANMCS. Scorurile afișate în Aplicație sunt estimări interne și nu reprezintă scorul oficial ANMCS.

Conținutul standardelor și indicatorilor este preluat din documentele publice ale ANMCS și poate să nu reflecte ultimele modificări. Unitatea sanitară rămâne responsabilă să verifice versiunea în vigoare a standardelor.

## 3. Conturi și spitale

- Contul este personal. Nu îți împarți parola cu alte persoane.
- Unitatea sanitară este înregistrată de un reprezentant al ei, care devine administratorul spitalului în Aplicație și își invită colegii.
- Furnizorul poate verifica și aproba înregistrarea unei unități sanitare înainte de activare și poate suspenda accesul în cazurile de la punctul 8.
- Administratorul spitalului răspunde de cine primește acces și cu ce rol (Administrator, Editor, Doar citire).

## 4. Ce date poți încărca – și ce NU

Aplicația este destinată **documentelor organizaționale**: proceduri, protocoale, regulamente, registre, procese-verbale, planuri și rapoarte.

**Este interzisă încărcarea de date despre pacienți**: foi de observație, rezultate de analize, imagini medicale, date de identificare a pacienților sau orice alte date privind sănătatea unor persoane identificate sau identificabile. Dacă un document necesar ca dovadă conține astfel de date, el trebuie anonimizat înainte de încărcare.

Unitatea sanitară răspunde de conținutul documentelor pe care le încarcă și de dreptul de a le încărca.

## 5. Datele unității sanitare

Datele și documentele încărcate de unitatea sanitară îi aparțin. Furnizorul le prelucrează doar pentru a furniza serviciul, conform Acordului de prelucrare a datelor și Politicii de confidențialitate.

Fiecare unitate sanitară are acces numai la propriile date. Separarea este impusă la nivelul bazei de date.

La încetarea contractului, unitatea sanitară își poate descărca documentele timp de 30 de zile. După acest termen, datele sunt șterse conform Acordului de prelucrare a datelor.

## 6. Disponibilitate și asistență

Furnizorul depune eforturi rezonabile ca Aplicația să fie disponibilă permanent, dar nu poate garanta funcționarea fără întreruperi. Lucrările planificate sunt anunțate, pe cât posibil, din timp. Asistența se acordă prin e-mail la ${C.email}, în zilele lucrătoare.

## 7. Prețul

Utilizarea Aplicației de către unitățile sanitare se face pe baza unui contract de abonament, cu prețul și durata stabilite în contract. Perioadele de testare sau pilot gratuite sunt stabilite în scris.

## 8. Suspendarea accesului

Furnizorul poate suspenda accesul unui cont sau al unei unități sanitare dacă: încarcă date despre pacienți sau conținut ilegal, încearcă să acceseze datele altor unități, folosește Aplicația pentru a o compromite, nu plătește abonamentul în termenul contractual sau la cererea unei autorități competente. Suspendarea nu duce la ștergerea datelor.

## 9. Proprietate intelectuală

Aplicația, codul sursă, designul și materialele proprii ale Furnizorului (șabloane, întrebări de simulare, explicații) aparțin Furnizorului. Unitatea sanitară primește un drept de utilizare neexclusiv, pe durata contractului.

## 10. Răspundere

Furnizorul nu răspunde pentru rezultatul evaluării ANMCS, pentru deciziile luate de unitatea sanitară pe baza Aplicației sau pentru conținutul încărcat de utilizatori. Răspunderea totală a Furnizorului față de o unitate sanitară este limitată la valoarea plătită de aceasta în ultimele 12 luni, cu excepția cazurilor în care legea nu permite limitarea.

## 11. Modificări

Furnizorul poate modifica acești Termeni. Modificările importante sunt anunțate cu cel puțin 30 de zile înainte, prin e-mail sau în Aplicație.

## 12. Legea aplicabilă

Acești Termeni sunt guvernați de legea română. Litigiile se soluționează pe cale amiabilă, iar în caz contrar de instanțele competente de la sediul Furnizorului.
`;
