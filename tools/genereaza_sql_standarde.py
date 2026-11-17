import json, sys

ind = json.load(open('/home/claude/gen/indicators.json'))
OUT = sys.argv[1]

LAB_QC = (
    "⚠ Constatat NEÎNDEPLINIT la o evaluare ANMCS reală (2023), lista de verificare L6 Managementul calității, "
    "indicatorul 02.05.03.01.01: „La nivelul SMC există analize periodice ale rezultatelor controlului intern și extern "
    "de calitate al laboratorului clinic.”\n"
    "Pregătiți: rapoartele de evaluare externă a calității (EEC) ale laboratorului, consemnarea și analiza rezultatelor "
    "după fiecare raport, cu măsurile de îmbunătățire (OMS 1301/2007, art. 24–25), și dovada că structura de management "
    "al calității (SMC) le analizează periodic (proces-verbal sau raport SMC)."
)
MICRO = (
    "⚠ Constatat NEÎNDEPLINIT la o evaluare ANMCS reală (2023), lista de verificare L58 Laborator de analize medicale, "
    "indicatorul 02.10.04.01.02: „Laboratorul de microbiologie are proceduri de control a antibioticorezistenței și de "
    "alertare în cazul apariției unui profil particular de antibioticorezistență.”\n"
    "Atenție la serviciul externalizat: contractul și acreditarea RENAR a laboratorului extern NU au fost acceptate ca "
    "dovadă. Spitalul trebuie să aibă propria procedură de control al antibiorezistenței și un circuit de alertare "
    "(cine anunță, pe cine, în cât timp) când apare un profil de rezistență particular."
)
GUIDANCE = {
    "S2.4-C5-R1-I5": LAB_QC,
    "S2.4-C5-R1-I6": LAB_QC,
    "S2.3-C7-R2-I1": MICRO,
    "S2.3-C7-R2-I5": MICRO,
    "S2.3-C7-R1-I4": MICRO,
}

DOMAINS = [("1", "Managementul strategic și organizațional"), ("2", "Managementul clinic"), ("3", "Etica medicală și drepturile pacientului")]

# Întrebări de simulare: activitățile pe care comisia le face efectiv în vizită (din proiectul raportului de evaluare)
# și indicatorii-cheie din standarde.
SIM = [
    ("Vizita ANMCS", "Comisia simulează o situație de urgență în sediul central. Știe personalul de gardă ce are de făcut, pas cu pas?",
     "Raportul de evaluare consemnează rezultatul simulării de urgență. Exersați scenariul înainte de vizită, cu personalul de tură."),
    ("Vizita ANMCS", "Poate intra o persoană neautorizată în blocul operator, sala de nașteri, ATI sau neonatologie?",
     "Comisia încearcă efectiv să intre. Acces controlat (cartelă, încuietoare electromagnetică) și personal care oprește și legitimează."),
    ("Vizita ANMCS", "Sunteți pregătiți pentru chestionarele ANMCS de satisfacție a pacienților, aplicate pe secții?",
     "La o evaluare din 2023 s-au aplicat câte 3 chestionare în fiecare secție (medicină internă, pediatrie, obstetrică-ginecologie, chirurgie)."),
    ("Vizita ANMCS", "Puteți urmări „traseul pacientului” de la internare la externare, în fiecare secție?",
     "Comisia face câte un interviu de traseu al pacientului pe secție. Foaia de observație, consimțămintele și planul de îngrijire trebuie să fie complete și coerente."),
    ("Vizita ANMCS", "Sunt angajații pregătiți să completeze chestionarele ANMCS de satisfacție a angajaților?",
     "Comisia înmânează și colectează chestionare de la angajați (de exemplu 40 la un spital municipal)."),
    ("Vizita ANMCS", "Sunt îndepliniți toți indicatorii critici privind siguranța pacientului?",
     "Fiecare evaluator completează câte o fișă pentru fiecare indicator critic. Un indicator critic neîndeplinit afectează decisiv categoria de acreditare."),
    ("Laborator", "Analizează structura de management al calității (SMC) periodic rezultatele controlului intern și extern de calitate al laboratorului?",
     "Constatare reală de neconformitate (lista L6, 2023). Cereți rapoartele de evaluare externă și procesul-verbal SMC în care au fost analizate."),
    ("Laborator", "Aveți procedură de control al antibiorezistenței și de alertare la un profil de rezistență particular, chiar dacă microbiologia e externalizată?",
     "Constatare reală de neconformitate (lista L58, 2023): contractul și acreditarea RENAR a laboratorului extern nu au fost suficiente."),
    ("Siguranța pacientului", "Este pacientul identificat dublu (două elemente) înainte de orice îngrijire, examinare, tratament sau transfer?",
     "Standardul 2.7: dubla identificare a pacientului. Evaluatorul verifică pe secție, direct la pacient."),
    ("Siguranța pacientului", "Folosiți lista de verificare a siguranței chirurgicale (model OMS / Ordin MS 1529/2013) la fiecare intervenție?",
     "Se verifică foile de observație chirurgicale, prin sondaj."),
    ("Siguranța pacientului", "Medicamentele cu risc înalt sunt identificate, depozitate separat și administrate după reguli scrise?",
     "Standardul 2.7: sistem pentru siguranța medicamentelor cu risc înalt."),
    ("Infecții asociate", "Aplicați programul multimodal OMS pentru igiena mâinilor și monitorizați complianța personalului?",
     "Se cer observațiile de complianță și măsurile luate după ele."),
    ("Comunicare", "Cum se transmit informațiile și responsabilitatea asupra pacientului la predarea turei sau la transfer?",
     "Standardul 2.7: sistem eficient de transfer al informațiilor între echipe."),
    ("Drepturile pacientului", "Este consimțământul informat obținut și documentat corect, iar pacienții își cunosc diagnosticul și tratamentul?",
     "Standardul 3.1: comisia întreabă direct pacienții dacă își cunosc diagnosticul, tratamentul și medicul curant."),
    ("După vizită", "Știți cine formulează obiecțiunile la proiectul raportului de evaluare și în ce termen?",
     "Obiecțiunile la indicatorii neîndepliniți se transmit în 5 zile lucrătoare de la comunicarea proiectului de raport, prin aplicația CaPeSaRo, respectând instrucțiunile, sub sancțiunea nulității."),
]

standards = []
for o in ind:
    if not standards or standards[-1]["c"] != o["std_code"]:
        standards.append({"c": o["std_code"], "d": o["domain"], "n": o["std"], "r": []})
    crs = standards[-1]["r"]
    if not crs or crs[-1]["_ci"] != o["ci"]:
        crs.append({"_ci": o["ci"], "n": o["cr"], "e": []})
    ces = crs[-1]["e"]
    if not ces or ces[-1]["_ri"] != o["ri"]:
        ces.append({"_ri": o["ri"], "n": o["cer"], "i": []})
    item = {"k": o["code"], "t": o["ind"]}
    if o["code"] in GUIDANCE: item["g"] = GUIDANCE[o["code"]]
    ces[-1]["i"].append(item)
for s_ in standards:
    for c in s_["r"]:
        c.pop("_ci")
        for e in c["e"]: e.pop("_ri")

payload = json.dumps(standards, ensure_ascii=False, separators=(",", ":"))
sim = json.dumps([{"k": f"V-{i+1:02d}", "a": a, "q": q, "h": h} for i, (a, q, h) in enumerate(SIM)], ensure_ascii=False, separators=(",", ":"))
assert "$JSON$" not in payload and "$JSON$" not in sim

sql = f"""-- =====================================================================
-- Acredit – import STANDARDE ANMCS, ediția a II-a (2018), din fișierul
-- EDITIA_A_II_STANDARDE_2018_7.xlsx: 17 standarde, 71 de criterii,
-- 183 de cerințe, 802 indicatori.
--
-- Rulează O SINGURĂ DATĂ în Supabase: SQL Editor → New query → lipește tot → Run.
-- Ce face:
--   1. adaugă coloanele pentru standard / criteriu / cerință;
--   2. șterge cerințele și întrebările DEMONSTRATIVE (și evaluările lor);
--   3. încarcă standardele reale și întrebările de simulare.
-- Poate fi rulat din nou fără probleme: actualizează, nu dublează.
--
-- Codurile indicatorilor (ex. S1.2-C3-R1-I2 = Standardul 1.2, criteriul 3,
-- cerința 1, indicatorul 2) sunt NUMEROTARE INTERNĂ a aplicației, după ordinea
-- din fișier. Nu sunt codurile din listele de verificare ANMCS (ex. 02.05.03.01.01).
-- =====================================================================

begin;

alter table public.requirements
  add column if not exists standard_code text,
  add column if not exists standard_name text,
  add column if not exists criterion text,
  add column if not exists cerinta text;

delete from public.requirements where code like 'DEMO-%';
delete from public.sim_questions where code like 'SIM-%';
delete from public.sections s
  where s.code in ('A', 'B', 'C')
    and not exists (select 1 from public.requirements r where r.section_id = s.id);

insert into public.sections (code, name, sort) values
  ('1', 'Managementul strategic și organizațional', 1),
  ('2', 'Managementul clinic', 2),
  ('3', 'Etica medicală și drepturile pacientului', 3)
on conflict (code) do update set name = excluded.name, sort = excluded.sort;

with std as (
  select s.value as s, s.ordinality as sn
  from jsonb_array_elements($JSON${payload}$JSON$::jsonb) with ordinality as s
),
rows as (
  select std.s->>'d' as domain, std.s->>'c' as standard_code, std.s->>'n' as standard_name,
         c.value->>'n' as criterion, e.value->>'n' as cerinta, i.value as i,
         row_number() over (order by std.sn, c.ordinality, e.ordinality, i.ordinality) as sort
  from std,
       jsonb_array_elements(std.s->'r') with ordinality as c,
       jsonb_array_elements(c.value->'e') with ordinality as e,
       jsonb_array_elements(e.value->'i') with ordinality as i
)
insert into public.requirements
  (section_id, code, title, description, guidance, standard_code, standard_name, criterion, cerinta, sort)
select sec.id, r.i->>'k', r.i->>'t', null, r.i->>'g', r.standard_code, r.standard_name,
       r.criterion, r.cerinta, r.sort
from rows r
join public.sections sec on sec.code = r.domain
on conflict (code) do update set
  section_id = excluded.section_id, title = excluded.title, guidance = excluded.guidance,
  standard_code = excluded.standard_code, standard_name = excluded.standard_name,
  criterion = excluded.criterion, cerinta = excluded.cerinta, sort = excluded.sort;

insert into public.sim_questions (code, area, question, hint, sort)
select q.value->>'k', q.value->>'a', q.value->>'q', q.value->>'h', q.ordinality
from jsonb_array_elements($JSON${sim}$JSON$::jsonb) with ordinality as q
on conflict (code) do update set
  area = excluded.area, question = excluded.question, hint = excluded.hint, sort = excluded.sort;

commit;

select (select count(*) from public.requirements) as indicatori,
       (select count(distinct standard_code) from public.requirements) as standarde,
       (select count(*) from public.sim_questions) as intrebari_simulare;
"""
open(OUT, "w").write(sql)
print(len(sql.encode()), "bytes")
