import { COMPANY as C, FACTS } from "@/lib/company";

export const securitate = () => `
Această fișă descrie măsurile tehnice și organizatorice prin care ${C.name} protejează datele unităților sanitare în aplicația ${C.product}. Poate fi folosită de unitățile sanitare în evaluarea furnizorilor (GDPR art. 28 și 32; OUG 155/2024 privind securitatea cibernetică).

## 1. Separarea datelor între spitale

- Fiecare unitate sanitară are acces numai la propriile date. Regula este impusă **direct în baza de date** (Row Level Security), nu doar în interfață: chiar și o cerere trimisă ocolind aplicația nu primește datele altei unități.
- Separarea a fost testată: un utilizator al altei unități nu poate citi și nu poate scrie date străine.
- Unitățile noi sunt verificate și aprobate manual înainte de a primi acces.

## 2. Controlul accesului

- Roluri pe unitate sanitară: Administrator (gestionează echipa și aprobă documentele), Editor, Doar citire. Drepturile sunt verificate în baza de date.
- Parole de minimum 10 caractere, păstrate doar în formă criptată ireversibil (hash). Sesiunile expiră automat.
- Accesul administrativ la infrastructură este limitat la personalul Prestatorului.
- Administratorul platformei poate suspenda imediat o unitate sau un cont.

## 3. Documentele încărcate

- Fișierele sunt păstrate într-un spațiu de stocare **privat**, pe foldere separate pe unitate sanitară.
- Descărcarea se face numai prin linkuri temporare, valabile **5 minute**, generate doar pentru membrii unității.
- Fiecare document are istoric de versiuni, aprobare și termen de revizuire.

## 4. Criptare și găzduire

- Toate conexiunile sunt criptate (HTTPS/TLS).
- ${FACTS.supabaseRegionEU ? "Datele sunt găzduite în **Uniunea Europeană (Frankfurt, Germania)**; datele stocate sunt criptate la nivelul infrastructurii furnizorului." : "Datele stocate sunt criptate la nivelul infrastructurii furnizorului."}
- Funcțiile de server care accesează datele rulează în regiunea Frankfurt.
- Infrastructura este furnizată de Supabase (bază de date, autentificare, stocare) și Vercel (găzduirea aplicației), furnizori cu programe de securitate certificate SOC 2.

## 5. Trasabilitate

- Jurnal de activitate: cine a creat, modificat, aprobat sau retras un document, cine a evaluat o cerință și cine a invitat un utilizator, cu data și ora.
- Data ultimei conectări a fiecărui utilizator este vizibilă administratorului platformei.

## 6. Disponibilitate și copii de siguranță

- ${FACTS.dailyBackups ? "Copii de siguranță zilnice ale bazei de date, păstrate cel puțin 7 zile." : "Copiile de siguranță zilnice sunt activate odată cu trecerea pe planul de producție, înainte de primul contract."}
- Codul aplicației este versionat; orice versiune anterioară poate fi republicată în câteva minute.

## 7. Minimizarea datelor

- Aplicația este destinată exclusiv documentelor organizaționale. **Datele despre pacienți sunt interzise** prin Termeni, iar utilizatorii sunt avertizați la fiecare încărcare de fișier.
- Nu se folosesc cookie-uri de publicitate sau de analiză.

## 8. Incidente

- Incidentele de securitate care afectează datele unei unități sanitare îi sunt notificate în cel mult **48 de ore** de la constatare, cu natura incidentului, datele afectate și măsurile luate.
- Contact pentru securitate: ${C.email}.

## 9. Dezvoltare sigură

- Modificările aplicației sunt testate automat (compilare și verificarea tipurilor) și verificate funcțional înainte de publicare.
- Regulile de acces din baza de date sunt testate la fiecare modificare a structurii.
`;
