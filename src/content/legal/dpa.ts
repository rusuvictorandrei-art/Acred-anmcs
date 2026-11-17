import { COMPANY as C, FACTS } from "@/lib/company";

export const dpa = () => `
**Încheiat între:**

**[DENUMIREA UNITĂȚII SANITARE]**, cu sediul în [adresa], CUI [CUI], reprezentată de [nume, funcție], în calitate de **Operator**,

și

**${C.name}**, cu sediul în ${C.address}, CUI ${C.cui}, reprezentată de ${C.representative}, în calitate de **Persoană împuternicită**,

ca anexă la contractul de abonament nr. [nr.] din [data] privind utilizarea aplicației ${C.product} (denumit „Contractul”), în temeiul art. 28 din Regulamentul (UE) 2016/679 (GDPR).

## 1. Obiectul și durata prelucrării

Persoana împuternicită prelucrează date cu caracter personal în numele Operatorului exclusiv pentru furnizarea aplicației ${C.product}, pe durata Contractului și pe perioada de restituire și ștergere prevăzută la art. 9.

## 2. Natura și scopul prelucrării

Stocarea, organizarea, afișarea, transmiterea către utilizatorii autorizați ai Operatorului și ștergerea datelor, în scopul pregătirii documentației și a autoevaluării pentru acreditarea ANMCS.

## 3. Categorii de persoane vizate și de date

- **Persoane vizate:** angajații și colaboratorii Operatorului care folosesc aplicația sau care sunt menționați în documente (autori, responsabili, membri ai comisiilor).
- **Categorii de date:** nume și prenume, funcție, adresă de e-mail de serviciu, semnături și mențiuni din documentele organizaționale, jurnalul acțiunilor din aplicație.
- **Categorii speciale de date (art. 9 GDPR), inclusiv date privind sănătatea pacienților: NU fac obiectul prelucrării.** Operatorul se obligă să nu încarce astfel de date și să anonimizeze documentele înainte de încărcare.

## 4. Obligațiile Persoanei împuternicite

1. Prelucrează datele numai pe baza instrucțiunilor documentate ale Operatorului, inclusiv cele din Contract și din configurarea aplicației de către administratorii Operatorului.
2. Asigură confidențialitatea: persoanele care au acces la date s-au angajat să respecte confidențialitatea.
3. Aplică măsurile tehnice și organizatorice din Anexa 1 (Fișa de securitate a datelor).
4. Respectă condițiile de la art. 5 pentru recurgerea la alte persoane împuternicite.
5. Ajută Operatorul, prin măsuri adecvate, să răspundă cererilor persoanelor vizate.
6. Ajută Operatorul să își îndeplinească obligațiile privind securitatea, notificarea încălcărilor și, dacă este cazul, evaluarea impactului.
7. La încetarea Contractului, restituie și șterge datele conform art. 9.
8. Pune la dispoziția Operatorului informațiile necesare pentru a demonstra respectarea acestui acord și permite audituri, conform art. 8.
9. Informează imediat Operatorul dacă o instrucțiune încalcă, în opinia sa, GDPR sau alte dispoziții legale.

## 5. Alte persoane împuternicite (împuterniciți secundari)

Operatorul autorizează utilizarea următorilor împuterniciți secundari:

- **Supabase Inc.** – bază de date, autentificare, stocare fișiere${FACTS.supabaseRegionEU ? "; date găzduite în UE (Frankfurt)" : ""};
- **Vercel Inc.** – găzduirea aplicației web; funcțiile de server rulează în regiunea Frankfurt.

Persoana împuternicită informează Operatorul cu cel puțin 30 de zile înainte despre orice înlocuire sau adăugare, iar Operatorul poate formula obiecții motivate. Persoana împuternicită impune împuterniciților secundari obligații de protecție a datelor cel puțin echivalente și răspunde față de Operator pentru îndeplinirea lor. Transferurile în afara SEE se fac numai cu garanții adecvate (clauze contractuale standard și/sau cadrul UE–SUA privind confidențialitatea datelor).

## 6. Încălcarea securității datelor

Persoana împuternicită notifică Operatorul fără întârzieri nejustificate, dar nu mai târziu de **48 de ore** de la constatarea unei încălcări a securității datelor cu caracter personal, cu informațiile disponibile despre natura încălcării, datele și persoanele afectate, consecințele probabile și măsurile luate. Notificarea către ANSPDCP și, după caz, către persoanele vizate rămâne obligația Operatorului (art. 33–34 GDPR).

## 7. Securitatea cibernetică (OUG 155/2024 – NIS2)

Persoana împuternicită sprijină Operatorul, în calitate de furnizor din lanțul de aprovizionare, cu informațiile necesare evaluării riscurilor de securitate cibernetică și notifică fără întârziere orice incident care ar putea afecta serviciile Operatorului.

## 8. Audit

Operatorul poate solicita, o dată pe an sau după un incident, informații și documente privind măsurile de securitate. Auditurile la fața locului se programează cu cel puțin 30 de zile înainte, pe cheltuiala Operatorului, și nu pot afecta confidențialitatea datelor altor clienți.

## 9. Restituirea și ștergerea datelor

La încetarea Contractului, Operatorul își poate descărca documentele timp de 30 de zile. În cel mult 60 de zile de la încetare, Persoana împuternicită șterge datele Operatorului din sistemele active${FACTS.dailyBackups ? ", iar copiile de siguranță expiră automat în cel mult 30 de zile după aceea" : ""}, cu excepția datelor pe care legea o obligă să le păstreze. La cerere, confirmă ștergerea în scris.

## 10. Dispoziții finale

Prezentul acord se completează cu Contractul. În caz de contradicție privind protecția datelor, prevalează prezentul acord. Legea aplicabilă este legea română.

**Anexa 1:** Fișa de securitate a datelor ${C.product} (versiunea în vigoare, publicată în aplicație).

Operator: ______________________   Data: __________

Persoană împuternicită: ______________________   Data: __________
`;
