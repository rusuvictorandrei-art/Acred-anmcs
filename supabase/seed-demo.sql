-- =====================================================================
-- DATE DEMONSTRATIVE – NU sunt standardele oficiale ANMCS.
-- Servesc doar ca să vezi aplicația funcționând. Înlocuiește-le cu
-- standardele reale prin pagina „Import standarde” din aplicație.
-- Rulează după schema.sql: SQL Editor → New query → Run.
-- =====================================================================

insert into public.sections (code, name, sort) values
  ('A', 'Management strategic și organizațional', 1),
  ('B', 'Management clinic', 2),
  ('C', 'Etica medicală și drepturile pacientului', 3)
on conflict (code) do update set name = excluded.name, sort = excluded.sort;

insert into public.requirements (section_id, code, title, description, guidance, sort)
select s.id, r.code, r.title, r.description, r.guidance, r.sort
from (values
  ('A', 'DEMO-A.1', 'Planul strategic al spitalului este aprobat și comunicat personalului', 'Plan strategic aprobat, cu obiective măsurabile.', 'Cere planul și întreabă personalul dacă îl cunoaște.', 1),
  ('A', 'DEMO-A.2', 'Organigrama și Regulamentul de organizare și funcționare sunt actualizate', null, 'Compară organigrama cu structura reală.', 2),
  ('A', 'DEMO-A.3', 'Structura de management al calității se întrunește periodic', 'Ședințe cu procese-verbale și urmărirea deciziilor.', 'Cere ultimele procese-verbale.', 3),
  ('A', 'DEMO-A.4', 'Indicatorii de performanță sunt monitorizați și analizați', null, 'Cere rapoartele de analiză și măsurile luate.', 4),
  ('B', 'DEMO-B.1', 'Protocoale de diagnostic și tratament pentru patologiile frecvente', 'Câte un protocol pentru patologiile frecvente din fiecare secție.', 'Compară protocolul scris cu practica pe secție.', 1),
  ('B', 'DEMO-B.2', 'Prevenirea infecțiilor asociate asistenței medicale', null, 'Verifică igiena mâinilor și circuitele.', 2),
  ('B', 'DEMO-B.3', 'Riscul de cădere este evaluat la internare', null, 'Verifică scala de risc în foile de observație.', 3),
  ('B', 'DEMO-B.4', 'Pacientul este identificat corect înainte de orice procedură', null, 'Verifică brățara de identificare pe secție.', 4),
  ('B', 'DEMO-B.5', 'Evenimentele adverse sunt raportate și analizate', null, 'Întreabă personalul cum raportează un eveniment.', 5),
  ('C', 'DEMO-C.1', 'Consimțământul informat este documentat', null, 'Sondaj în foile de observație.', 1),
  ('C', 'DEMO-C.2', 'Reclamațiile pacienților sunt înregistrate și soluționate', null, 'Cere registrul de reclamații și răspunsurile.', 2),
  ('C', 'DEMO-C.3', 'Confidențialitatea datelor pacientului este asigurată', null, 'Verifică accesul la dosare și sistemele informatice.', 3)
) as r(section_code, code, title, description, guidance, sort)
join public.sections s on s.code = r.section_code
on conflict (code) do nothing;

insert into public.sim_questions (code, area, question, hint, sort) values
  ('SIM-1', 'Siguranța pacientului', 'Cum identificați pacientul înainte de a administra un medicament?', 'Evaluatorul cere procedura și verifică pe secție brățara de identificare.', 1),
  ('SIM-2', 'Management', 'Arătați ultimul proces-verbal al structurii de management al calității.', 'Se verifică frecvența ședințelor și urmărirea deciziilor.', 2),
  ('SIM-3', 'Drepturile pacientului', 'Unde este documentat consimțământul informat?', 'Verificare prin sondaj în foile de observație.', 3),
  ('SIM-4', 'Calitate', 'Cum raportează personalul un eveniment advers?', 'Personalul de pe secție poate fi întrebat direct.', 4),
  ('SIM-5', 'Clinic', 'Ce protocol aplicați la suspiciunea de sepsis?', 'Se compară protocolul scris cu practica echipei de gardă.', 5),
  ('SIM-6', 'Infecții asociate', 'Cum monitorizați respectarea igienei mâinilor?', 'Se cer rezultatele observațiilor și acțiunile luate.', 6)
on conflict (code) do nothing;
