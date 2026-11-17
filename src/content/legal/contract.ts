import { COMPANY as C } from "@/lib/company";

export const contract = () => `
**Nr. [____] din [data]**

## 1. Părțile

**${C.name}**, cu sediul în ${C.address}, CUI ${C.cui}, nr. Reg. Com. ${C.regCom}, cont IBAN [IBAN] deschis la [banca], reprezentată de ${C.representative}, în calitate de **Prestator**,

și

**[DENUMIREA UNITĂȚII SANITARE]**, cu sediul în [adresa], CUI [CUI], cont IBAN [IBAN] deschis la [Trezoreria/banca], reprezentată de [nume], [funcția], în calitate de **Beneficiar**.

## 2. Obiectul contractului

Prestatorul acordă Beneficiarului dreptul de utilizare, sub formă de abonament online, a aplicației ${C.product} pentru pregătirea documentației și autoevaluarea în vederea acreditării ANMCS, inclusiv găzduirea datelor, actualizarea catalogului de standarde și asistența tehnică prin e-mail.

Serviciul nu include consultanță juridică sau de management al calității și nu garantează acreditarea sau o anumită categorie de acreditare.

## 3. Durata

Contractul se încheie pe o perioadă de **12 luni**, începând cu data de [data]. Se poate prelungi prin act adițional sau prin comanda unei noi perioade.

## 4. Prețul și plata

- Prețul abonamentului este de **[PREȚ] lei fără TVA** pentru perioada de 12 luni, la care se adaugă TVA conform legii.
- Numărul de utilizatori incluși: [nelimitat / ___].
- Plata se face în [30] de zile de la primirea facturii, emisă [la semnare / trimestrial].
- Prețul este ferm pe durata contractului.

## 5. Obligațiile Prestatorului

1. Să asigure accesul la aplicație pe durata contractului, cu disponibilitate lunară țintă de 99%, exceptând lucrările planificate anunțate din timp.
2. Să mențină catalogul de standarde actualizat cu modificările publicate de ANMCS, în cel mult 30 de zile de la publicare.
3. Să răspundă solicitărilor de asistență în cel mult 2 zile lucrătoare.
4. Să păstreze confidențialitatea datelor Beneficiarului și să respecte Acordul de prelucrare a datelor (Anexa 2).
5. Să notifice Beneficiarul despre orice incident de securitate care îl afectează, conform Anexei 2.
6. Să ofere o sesiune de instruire online pentru utilizatorii Beneficiarului, la începutul contractului.

## 6. Obligațiile Beneficiarului

1. Să plătească prețul la termen.
2. Să desemneze un administrator al contului și să gestioneze accesul propriilor utilizatori.
3. Să nu încarce date privind pacienții și să anonimizeze documentele folosite ca dovezi.
4. Să respecte Termenii și condițiile de utilizare ale aplicației.

## 7. Datele Beneficiarului

Datele și documentele încărcate aparțin Beneficiarului. La încetarea contractului, Beneficiarul le poate descărca timp de 30 de zile, după care sunt șterse conform Anexei 2.

## 8. Răspunderea

Răspunderea totală a Prestatorului este limitată la valoarea plătită de Beneficiar în ultimele 12 luni, cu excepția prejudiciilor cauzate cu intenție sau din culpă gravă. Prestatorul nu răspunde pentru rezultatul evaluării ANMCS.

## 9. Încetarea contractului

Contractul încetează la expirarea duratei, prin acordul părților sau prin reziliere, dacă una dintre părți nu își îndeplinește obligațiile în 15 zile de la notificarea scrisă. Beneficiarul poate denunța contractul cu o notificare de 30 de zile; sumele plătite pentru perioada rămasă se restituie proporțional.

## 10. Forța majoră

Forța majoră exonerează de răspundere partea care o invocă, în condițiile legii, cu notificarea celeilalte părți în 5 zile.

## 11. Litigii și legea aplicabilă

Contractul este guvernat de legea română. Litigiile se soluționează pe cale amiabilă, iar în caz contrar de instanțele competente.

## 12. Anexe

- Anexa 1 – Termenii și condițiile de utilizare ${C.product} (versiunea în vigoare).
- Anexa 2 – Acordul de prelucrare a datelor cu caracter personal.
- Anexa 3 – Fișa de securitate a datelor.

Încheiat astăzi, [data], în 2 exemplare originale, câte unul pentru fiecare parte (sau semnat electronic).

**Prestator:** ${C.name}, prin ${C.representative} ______________________

**Beneficiar:** [DENUMIREA UNITĂȚII SANITARE], prin [nume, funcție] ______________________
`;
