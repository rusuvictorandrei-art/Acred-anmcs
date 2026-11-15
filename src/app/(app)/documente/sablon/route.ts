import { getContext } from "@/lib/context";

function esc(s: string) {
  return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
}

// Șablon de procedură operațională, deschis direct în Word.
// Structura urmează modelul de procedură din OSGG 600/2018 (control intern managerial).
export async function GET() {
  const ctx = await getContext();
  const hospital = esc(ctx.hospitalName);
  const sections = [
    ["Scopul procedurii operaționale", "Ce reglementează procedura și de ce este necesară."],
    ["Domeniul de aplicare", "Activitatea, secțiile și persoanele cărora li se aplică."],
    ["Documente de referință", "Legislație, standarde de acreditare, ghiduri, alte proceduri interne."],
    ["Definiții și abrevieri", "Termenii folosiți în procedură."],
    ["Descrierea procedurii", "Pașii activității, în ordine: cine face, ce face, când, cu ce resurse, ce se înregistrează."],
    ["Responsabilități", "Responsabilitățile fiecărei funcții implicate."],
    ["Formulare și anexe", "Formularele, registrele și diagramele folosite."],
  ];
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head><meta charset="utf-8"><title>Procedură operațională</title>
<style>body{font-family:Calibri,Arial,sans-serif;font-size:11pt}table{border-collapse:collapse;width:100%}td,th{border:1px solid #444;padding:4pt 6pt;vertical-align:top}h1{font-size:16pt;text-align:center}h2{font-size:12pt;margin-top:14pt}</style></head>
<body>
<table>
<tr><td><b>${hospital}</b></td><td><b>PROCEDURĂ OPERAȚIONALĂ</b><br>[Titlul procedurii]</td><td>Cod: PO-[nr]<br>Ediția: 1<br>Revizia: 0</td></tr>
</table>
<h2>Lista responsabililor cu elaborarea, verificarea și aprobarea</h2>
<table>
<tr><th></th><th>Nume și prenume</th><th>Funcția</th><th>Data</th><th>Semnătura</th></tr>
<tr><td>Elaborat</td><td></td><td></td><td></td><td></td></tr>
<tr><td>Verificat</td><td></td><td></td><td></td><td></td></tr>
<tr><td>Aprobat</td><td></td><td></td><td></td><td></td></tr>
</table>
<h2>Situația edițiilor și reviziilor</h2>
<table>
<tr><th>Ediția / revizia</th><th>Componenta revizuită</th><th>Modalitatea reviziei</th><th>Data aplicării</th></tr>
<tr><td>Ediția 1</td><td>—</td><td>—</td><td></td></tr>
</table>
<h2>Lista de difuzare</h2>
<table>
<tr><th>Scopul difuzării</th><th>Compartiment</th><th>Funcția</th><th>Nume și prenume</th><th>Data primirii</th><th>Semnătura</th></tr>
<tr><td>Aplicare</td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td>Informare</td><td></td><td></td><td></td><td></td><td></td></tr>
<tr><td>Arhivare</td><td></td><td></td><td></td><td></td><td></td></tr>
</table>
${sections.map(([t, d], i) => `<h2>${i + 1}. ${t}</h2><p><i>${d}</i></p><p>[Completați]</p>`).join("\n")}
</body></html>`;
  return new Response("﻿" + html, {
    headers: {
      "Content-Type": "application/msword; charset=utf-8",
      "Content-Disposition": 'attachment; filename="sablon-procedura-operationala.doc"',
    },
  });
}
