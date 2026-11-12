import { BRAND, logoMarkSvg } from "@shared/brand";
import type { CareerRecommendation, ScoredDimension, VocationalReport } from "@shared/evaluation";
import { DIMENSION_LABELS, STYLE_KEYS } from "@shared/dimensions";

/** Escapa texto para insertarlo en HTML: los datos del estudiante nunca se interpretan como marcado. */
export function escapeHtml(value: unknown): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const e = escapeHtml;
export const TOTAL_PAGES = 7;

export function formatDateEs(iso: string): string {
  return new Intl.DateTimeFormat("es-MX", { day: "numeric", month: "long", year: "numeric", timeZone: "America/Mexico_City" }).format(
    new Date(iso),
  );
}

function levelLabel(score: number): string {
  if (score >= 80) return "Muy alto";
  if (score >= 65) return "Alto";
  if (score >= 45) return "Medio";
  if (score >= 25) return "Bajo";
  return "Muy bajo";
}

function logoInline(size: number, suffix: string, textColor: string = BRAND.ink): string {
  return `<span class="logo">${logoMarkSvg(size, suffix)}<span class="logo-text" style="color:${textColor};font-size:${Math.round(size * 0.58)}px">Onnex Test</span></span>`;
}

function barChart(items: ScoredDimension[], id: string): string {
  const rowH = 26;
  const labelW = 190;
  const barW = 420;
  const height = items.length * rowH + 24;
  const grid = [0, 25, 50, 75, 100]
    .map((v) => {
      const x = labelW + (barW * v) / 100;
      return `<line x1="${x}" y1="0" x2="${x}" y2="${height - 20}" stroke="#E5E7EB" stroke-width="1"/><text x="${x}" y="${height - 4}" font-size="10" fill="#6B7280" text-anchor="middle">${v}</text>`;
    })
    .join("");
  const bars = items
    .map((it, i) => {
      const y = i * rowH + 6;
      const w = Math.max(2, (barW * it.score) / 100);
      return `<text x="${labelW - 10}" y="${y + 13}" font-size="12" fill="#111827" text-anchor="end">${e(it.label)}</text><rect x="${labelW}" y="${y}" width="${w}" height="18" rx="4" fill="url(#bar-${id})"/><text x="${labelW + w + 6}" y="${y + 13}" font-size="11.5" font-weight="700" fill="#111827">${it.score}</text>`;
    })
    .join("");
  return `<svg class="chart" viewBox="0 0 ${labelW + barW + 40} ${height}" width="100%" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="bar-${id}" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${BRAND.blue}"/><stop offset="1" stop-color="${BRAND.purple}"/></linearGradient></defs>${grid}${bars}</svg>`;
}

function list(items: string[], cls = ""): string {
  return `<ul class="${cls}">${items.map((i) => `<li>${e(i)}</li>`).join("")}</ul>`;
}

function chips(items: string[]): string {
  return `<div class="chips">${items.map((i) => `<span class="chip">${e(i)}</span>`).join("")}</div>`;
}

function page(n: number, report: VocationalReport, body: string, opts: { cover?: boolean } = {}): string {
  const header = opts.cover
    ? ""
    : `<header class="pheader">${logoInline(26, `p${n}`)}<span class="pheader-meta">Reporte de orientación vocacional · ${e(report.student.fullName)}</span></header>`;
  return `<section class="page${opts.cover ? " cover" : ""}">${header}<div class="pbody">${body}</div><footer class="pfooter"><span>Onnex Test · Documento confidencial para uso del equipo de orientación</span><span>Página ${n} de ${TOTAL_PAGES}</span></footer></section>`;
}

function careerBlock(rec: CareerRecommendation, rank: number, compact: boolean): string {
  const c = rec.career;
  return `<article class="career${compact ? " compact" : ""}">
    <div class="career-head">
      <div><div class="career-rank">Carrera recomendada #${rank}</div><h2 class="career-name">${e(c.name)}</h2><div class="career-area">${e(c.area)}</div></div>
      <div class="match"><div class="match-num">${rec.match}%</div><div class="match-label">compatibilidad</div></div>
    </div>
    <h3>Descripción</h3><p>${e(c.description)}</p>
    <h3>Motivo de la recomendación</h3><p class="why">${e(rec.justification)}</p>
    ${
      compact
        ? `<div class="cols"><div><h3>Ventajas</h3>${list(c.advantages, "checks")}</div><div><h3>Campo laboral</h3><p>${e(c.jobField)}</p></div></div>`
        : `<div class="cols"><div><h3>Habilidades relacionadas</h3>${chips(c.skills)}</div><div><h3>Ventajas</h3>${list(c.advantages, "checks")}</div></div>
    <h3>Campo laboral</h3><p>${e(c.jobField)}</p><h3>Perfil recomendado</h3><p>${e(c.recommendedProfile)}</p><h3>Perfiles compatibles</h3>${chips(c.compatibleProfiles)}`
    }
  </article>`;
}

const CSS = `
@page { size: A4; margin: 0; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { font-family: Inter, "Segoe UI", "Helvetica Neue", Arial, "Liberation Sans", "DejaVu Sans", sans-serif; color: #1F2937; font-size: 10.6pt; line-height: 1.45; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { position: relative; width: 210mm; height: 297mm; overflow: hidden; page-break-after: always; break-after: page; display: flex; flex-direction: column; }
.page:last-child { page-break-after: auto; break-after: auto; }
.pheader { display: flex; align-items: center; justify-content: space-between; padding: 11mm 16mm 4mm; border-bottom: 1px solid #E5E7EB; margin: 0 0 0; }
.pheader-meta { font-size: 8.5pt; color: #6B7280; }
.pbody { flex: 1; padding: 6mm 16mm 0; overflow: hidden; }
.pfooter { display: flex; justify-content: space-between; padding: 4mm 16mm 9mm; font-size: 8pt; color: #9CA3AF; border-top: 1px solid #F3F4F6; }
.logo { display: inline-flex; align-items: center; gap: 8px; white-space: nowrap; }
.logo svg { flex: none; display: block; }
.logo-text { font-weight: 800; letter-spacing: -0.02em; white-space: nowrap; }
h1 { font-size: 21pt; line-height: 1.15; margin: 0 0 3mm; color: #111827; letter-spacing: -0.02em; }
h2 { font-size: 13.5pt; margin: 0 0 2mm; color: #111827; }
h3 { font-size: 10pt; margin: 3.2mm 0 1.2mm; color: ${BRAND.purple}; text-transform: uppercase; letter-spacing: 0.04em; }
p { margin: 0 0 2mm; }
ul { margin: 0; padding-left: 5mm; }
li { margin: 0 0 1.3mm; }
ul.checks { list-style: none; padding-left: 0; }
ul.checks li { padding-left: 5.5mm; position: relative; }
ul.checks li::before { content: ""; position: absolute; left: 0; top: 1.6mm; width: 2.6mm; height: 2.6mm; border-radius: 50%; background: linear-gradient(135deg, ${BRAND.blue}, ${BRAND.purple}); }
.section-title { display: flex; align-items: baseline; gap: 3mm; margin: 0 0 3mm; }
.section-title .num { font-size: 9pt; font-weight: 700; color: #fff; background: linear-gradient(135deg, ${BRAND.blue}, ${BRAND.purple}); border-radius: 999px; padding: 0.6mm 2.6mm; }
.card { border: 1px solid #E5E7EB; border-radius: 4mm; padding: 4mm 5mm; margin-bottom: 4mm; background: #fff; }
.card.soft { background: #F7F7FD; border-color: #E7E5FB; }
.cols { display: grid; grid-template-columns: 1fr 1fr; gap: 6mm; }
.chips { display: flex; flex-wrap: wrap; gap: 1.6mm; }
.chip { font-size: 8.8pt; padding: 1mm 2.8mm; border-radius: 999px; background: #EEF0FF; color: #3730A3; font-weight: 600; }
.chart { display: block; }
table { width: 100%; border-collapse: collapse; font-size: 9.2pt; }
th { text-align: left; background: #F3F4F6; color: #374151; padding: 1.6mm 2.5mm; font-weight: 700; }
td { padding: 1.4mm 2.5mm; border-bottom: 1px solid #F3F4F6; }
td.num { text-align: right; font-weight: 700; font-variant-numeric: tabular-nums; }
.lvl { white-space: nowrap; font-size: 8.4pt; font-weight: 700; padding: 0.4mm 2mm; border-radius: 999px; background: #EEF0FF; color: #3730A3; }
/* Portada */
.cover .pbody { padding: 0; display: flex; flex-direction: column; }
.cover-top { display: flex; justify-content: space-between; align-items: center; padding: 14mm 16mm 8mm; }
.cover-tag { font-size: 8.5pt; color: #6B7280; text-transform: uppercase; letter-spacing: 0.08em; }
.hero { margin: 0 12mm; border-radius: 6mm; padding: 14mm 12mm; color: #fff; background: linear-gradient(135deg, ${BRAND.blue} 0%, #4F46E5 50%, ${BRAND.purple} 100%); position: relative; overflow: hidden; }
.hero::after { content: ""; position: absolute; right: -30mm; top: -30mm; width: 90mm; height: 90mm; border-radius: 50%; background: rgba(255,255,255,0.09); }
.hero::before { content: ""; position: absolute; right: 20mm; bottom: -35mm; width: 70mm; height: 70mm; border-radius: 50%; background: rgba(255,255,255,0.07); }
.hero .kicker { font-size: 9.5pt; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.85; }
.hero h1 { color: #fff; font-size: 27pt; margin: 3mm 0 8mm; max-width: 150mm; }
.hero .student { font-size: 18pt; font-weight: 800; margin-bottom: 6mm; }
.facts { display: grid; grid-template-columns: 2fr 1fr 1.4fr; gap: 4mm; position: relative; z-index: 1; }
.fact { background: rgba(255,255,255,0.14); border: 1px solid rgba(255,255,255,0.25); border-radius: 3mm; padding: 3mm 4mm; }
.fact .k { font-size: 8pt; text-transform: uppercase; letter-spacing: 0.08em; opacity: 0.8; }
.fact .v { font-size: 11pt; font-weight: 700; margin-top: 0.8mm; }
.cover-profile { padding: 9mm 16mm 0; }
.type-pill { display: inline-block; font-weight: 800; color: #fff; background: linear-gradient(135deg, ${BRAND.blue}, ${BRAND.purple}); border-radius: 999px; padding: 1.4mm 4mm; font-size: 10.5pt; }
.top-areas { display: grid; grid-template-columns: repeat(3, 1fr); gap: 4mm; margin-top: 5mm; }
.top-area { border: 1px solid #E5E7EB; border-radius: 3mm; padding: 3.5mm 4mm; }
.top-area .rank { font-size: 8pt; color: #6B7280; text-transform: uppercase; letter-spacing: 0.06em; }
.top-area .name { font-weight: 800; font-size: 11pt; margin: 1mm 0; color: #111827; }
.meter { height: 2.2mm; background: #EEF0FF; border-radius: 99px; overflow: hidden; }
.meter > span { display: block; height: 100%; background: linear-gradient(90deg, ${BRAND.blue}, ${BRAND.purple}); border-radius: 99px; }
.comp { display: grid; grid-template-columns: 44mm 1fr 10mm; gap: 3mm; align-items: center; padding: 2.2mm 0; border-bottom: 1px solid #F3F4F6; }
.comp .name { font-weight: 700; color: #111827; font-size: 9.8pt; }
.comp .desc { grid-column: 1 / -1; font-size: 9pt; color: #4B5563; margin-top: -1mm; }
.comp .score { text-align: right; font-weight: 800; font-size: 10pt; }
/* Carreras */
.career { border: 1px solid #E5E7EB; border-radius: 5mm; padding: 6mm 7mm; }
.career.compact { padding: 3.5mm 5.5mm; margin-bottom: 3mm; font-size: 9.3pt; line-height: 1.38; }
.career.compact:last-child { margin-bottom: 0; }
.career.compact h3 { margin-top: 1.8mm; margin-bottom: 0.8mm; font-size: 9pt; }
.career.compact p { margin-bottom: 0.8mm; }
.career.compact li { margin-bottom: 0.6mm; }
.career.compact .career-head { padding-bottom: 2mm; }
.career.compact .why { padding: 1.8mm 3mm; }
.career.compact .match { padding: 2mm 4mm; }
.career.compact .match-num { font-size: 14pt; }
.career-head { display: flex; justify-content: space-between; gap: 6mm; align-items: flex-start; padding-bottom: 3mm; border-bottom: 1px solid #F3F4F6; }
.career-rank { font-size: 8.5pt; font-weight: 700; color: ${BRAND.purple}; text-transform: uppercase; letter-spacing: 0.06em; }
.career-name { font-size: 17pt; margin: 1mm 0; }
.career.compact .career-name { font-size: 14pt; }
.career-area { font-size: 9pt; color: #6B7280; }
.match { text-align: center; flex: none; color: #fff; background: linear-gradient(135deg, ${BRAND.blue}, ${BRAND.purple}); border-radius: 4mm; padding: 2.5mm 4.5mm; }
.match-num { font-size: 17pt; font-weight: 800; line-height: 1; }
.match-label { font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.06em; opacity: 0.9; }
.why { background: #F7F7FD; border-left: 1.2mm solid ${BRAND.purple}; padding: 2.5mm 4mm; border-radius: 0 2mm 2mm 0; }
.final { color: #fff; background: linear-gradient(135deg, ${BRAND.blue}, ${BRAND.purple}); border-radius: 4mm; padding: 5mm 6mm; margin: 3mm 0; }
.disclaimer { font-size: 8.6pt; color: #4B5563; background: #F9FAFB; border: 1px dashed #D1D5DB; border-radius: 3mm; padding: 3mm 4mm; }
.contact { display: flex; justify-content: space-between; align-items: center; margin-top: 4mm; padding-top: 3mm; border-top: 1px solid #E5E7EB; font-size: 9pt; color: #374151; }
`;

export function renderReportHtml(report: VocationalReport): string {
  const s = report.student;
  const date = formatDateEs(report.completedAt);
  const [c1, c2, c3] = report.careers as [CareerRecommendation, CareerRecommendation, CareerRecommendation];

  const p1 = page(
    1,
    report,
    `<div class="cover-top">${logoInline(46, "cover")}<span class="cover-tag">Reporte confidencial</span></div>
    <div class="hero">
      <div class="kicker">Evaluación vocacional</div>
      <h1>Reporte de Orientación Vocacional</h1>
      <div class="student">${e(s.fullName)}</div>
      <div class="facts">
        <div class="fact"><div class="k">Escuela</div><div class="v">${e(s.school)}</div></div>
        <div class="fact"><div class="k">Edad</div><div class="v">${e(s.age)} años</div></div>
        <div class="fact"><div class="k">Fecha de realización</div><div class="v">${e(date)}</div></div>
      </div>
    </div>
    <div class="cover-profile">
      <div class="section-title"><span class="num">Perfil</span><h2>Perfil vocacional general</h2></div>
      <p style="margin-bottom:4mm">Tipo de perfil predominante: <span class="type-pill">${e(report.personalityType.name)}</span></p>
      <p>${e(report.profileSummary)}</p>
      <div class="top-areas">${report.areas
        .slice(0, 3)
        .map(
          (a, i) =>
            `<div class="top-area"><div class="rank">Área #${i + 1}</div><div class="name">${e(a.label)}</div><div class="meter"><span style="width:${a.score}%"></span></div><div style="font-size:9pt;margin-top:1.2mm;color:#4B5563">${a.score}/100 · ${levelLabel(a.score)}</div></div>`,
        )
        .join("")}</div>
      <h3 style="margin-top:6mm">Carreras recomendadas</h3>
      ${list(report.careers.map((c) => `${c.career.name} (${c.match}% de compatibilidad)`), "checks")}
    </div>`,
    { cover: true },
  );

  const styleRows = STYLE_KEYS.map(
    (k) => `<tr><td>${e(DIMENSION_LABELS[k])}</td><td class="num">${report.scores[k]}</td><td><span class="lvl">${levelLabel(report.scores[k])}</span></td></tr>`,
  ).join("");
  const p2 = page(
    2,
    report,
    `<div class="section-title"><span class="num">01</span><h2>Resultados por área</h2></div>
    <div class="card"><h3 style="margin-top:0">Intereses profesionales (0 a 100)</h3>${barChart(report.areas, "areas")}</div>
    <div class="card"><h3 style="margin-top:0">Habilidades y competencias (0 a 100)</h3>${barChart(report.competencies, "comp")}</div>
    <div class="cols">
      <div><h3 style="margin-top:0">Resumen de intereses y habilidades</h3><table><thead><tr><th>Dimensión</th><th style="text-align:right">Puntos</th><th>Nivel</th></tr></thead><tbody>${[
        ...report.areas.slice(0, 3),
        ...report.competencies.slice(0, 3),
      ]
        .map((d) => `<tr><td>${e(d.label)}</td><td class="num">${d.score}</td><td><span class="lvl">${levelLabel(d.score)}</span></td></tr>`)
        .join("")}</tbody></table></div>
      <div><h3 style="margin-top:0">Estilo de trabajo, aprendizaje y motivación</h3><table><thead><tr><th>Dimensión</th><th style="text-align:right">Puntos</th><th>Nivel</th></tr></thead><tbody>${styleRows}</tbody></table></div>
    </div>`,
  );

  const p3 = page(
    3,
    report,
    `<div class="section-title"><span class="num">02</span><h2>Análisis psicológico orientativo</h2></div>
    <div class="card soft"><h3 style="margin-top:0">Tipo de personalidad predominante</h3><p style="margin-bottom:1mm"><span class="type-pill">${e(report.personalityType.name)}</span></p><p style="margin:2mm 0 0">${e(report.personalityType.description)}</p></div>
    <h3>Rasgos dominantes</h3>${chips(report.dominantTraits)}
    <div class="cols" style="margin-top:2mm">
      <div><h3>Fortalezas principales</h3>${list(report.strengths, "checks")}</div>
      <div><h3>Áreas de desarrollo</h3>${list(report.developmentAreas)}</div>
    </div>
    <div class="cols">
      <div><h3>Preferencias laborales</h3>${list(report.workPreferences)}</div>
      <div><h3>Factores de motivación</h3>${list(report.motivationFactors, "checks")}</div>
    </div>`,
  );

  const p4 = page(
    4,
    report,
    `<div class="section-title"><span class="num">03</span><h2>Análisis de competencias</h2></div>
    <h3 style="margin-top:0">Habilidades destacadas</h3>
    ${report.highlightedCompetencies
      .map(
        (c) =>
          `<div class="comp"><span class="name">${e(c.label)}</span><div class="meter"><span style="width:${c.score}%"></span></div><span class="score">${c.score}</span><div class="desc">${e(c.description)}</div></div>`,
      )
      .join("")}
    <div class="cols" style="margin-top:2mm">
      <div><h3>Estilo de trabajo</h3><p>${e(report.workStyle)}</p><p>${e(report.learningStyle)}</p></div>
      <div><h3>Entornos profesionales recomendados</h3>${list(report.recommendedEnvironments, "checks")}</div>
    </div>
    <h3>Áreas profesionales compatibles</h3>${chips(report.compatibleAreas)}
    <h3>Posibles áreas de crecimiento</h3>${list(report.growthAreas)}`,
  );

  const p5 = page(5, report, `<div class="section-title"><span class="num">04</span><h2>Primera carrera recomendada</h2></div>${careerBlock(c1, 1, false)}`);
  const p6 = page(
    6,
    report,
    `<div class="section-title"><span class="num">05</span><h2>Segunda y tercera carrera recomendada</h2></div>${careerBlock(c2, 2, true)}${careerBlock(c3, 3, true)}`,
  );

  const p7 = page(
    7,
    report,
    `<div class="section-title"><span class="num">06</span><h2>Recomendaciones y próximos pasos</h2></div>
    <div class="cols">
      <div><h3 style="margin-top:0">Recomendaciones personalizadas</h3>${list(report.recommendations, "checks")}</div>
      <div><h3 style="margin-top:0">Próximos pasos sugeridos</h3>${list(report.nextSteps)}</div>
    </div>
    <h3>Cómo investigar universidades</h3>${list(report.universityTips, "checks")}
    <div class="final"><strong>Mensaje final de orientación</strong><p style="margin:1.5mm 0 0">${e(report.finalMessage)}</p></div>
    <div class="disclaimer"><strong>Nota importante.</strong> ${e(report.disclaimer)}</div>
    <div class="contact">${logoInline(30, "end")}<span>WhatsApp: <strong>${e(BRAND.contactPhone)}</strong> · ${e(BRAND.contactEmail)}</span></div>`,
  );

  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Reporte Onnex Test - ${e(s.fullName)}</title><style>${CSS}</style></head><body>${p1}${p2}${p3}${p4}${p5}${p6}${p7}</body></html>`;
}
