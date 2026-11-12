/**
 * Artes de comparación "Otros tests vs Onnex Test": npx tsx marketing/comparativo.ts
 * Formatos: 1:1 (feed) y 9:16 (historias / reels).
 */
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer";
import { BRAND, logoMarkSvg } from "@shared/brand";
import { PUPPETEER_ARGS } from "../server/pdfGenerator";

const FORMATS = [
  { name: "onnex-comparativo-1x1", width: 1080, height: 1080, tall: false },
  { name: "onnex-comparativo-9x16", width: 1080, height: 1920, tall: true },
] as const;

const ROWS: [string, string][] = [
  ["Preguntas genéricas", "50 preguntas pensadas para prepa en México"],
  ["Un resultado automático y ya", "Un orientador revisa tus resultados contigo"],
  ["“Eres creativo” y nada más", "Personalidad, fortalezas, intereses y competencias"],
  ["Carreras de otros países", "3 carreras compatibles, con su campo laboral en México"],
  ["Nada que puedas consultar después", "Reporte profesional de 7 páginas"],
];

function html(width: number, height: number, tall: boolean): string {
  const s = width / 1080;
  const x = `<svg width="${30 * s}" height="${30 * s}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#E5E7EB"/><path d="M8 8l8 8M16 8l-8 8" stroke="#9CA3AF" stroke-width="2.6" stroke-linecap="round"/></svg>`;
  const ok = `<svg width="${30 * s}" height="${30 * s}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#fff"/><path d="M7 12.5l3.2 3.2L17 9" stroke="${BRAND.purple}" stroke-width="2.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const f = (n: number) => `${n * s}px`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{width:${width}px;height:${height}px;overflow:hidden;font-family:Inter,"Segoe UI",Arial,"Liberation Sans","DejaVu Sans",sans-serif;background:#F6F7FF;color:${BRAND.ink}}
  .wrap{position:relative;overflow:hidden;height:100%;padding:${tall ? `${f(150)} ${f(70)} ${f(230)}` : `${f(60)} ${f(60)}`};display:flex;flex-direction:column;gap:${f(tall ? 44 : 24)};justify-content:${tall ? "space-between" : "flex-start"}}
  .blob{position:absolute;border-radius:50%}
  .top{display:flex;justify-content:space-between;align-items:center;position:relative}
  .logo{display:inline-flex;align-items:center;gap:${f(14)};white-space:nowrap}
  .logo span{font-weight:800;font-size:${f(tall ? 44 : 36)};letter-spacing:-0.02em}
  .tag{font-size:${f(tall ? 24 : 20)};font-weight:800;color:#4F46E5;background:#fff;border-radius:999px;padding:${f(10)} ${f(20)};box-shadow:0 ${f(4)} ${f(18)} rgba(79,70,229,.12);white-space:nowrap}
  h1{position:relative;font-size:${f(tall ? 92 : 62)};line-height:1.03;letter-spacing:-0.035em;font-weight:900}
  h1 em{font-style:normal;background:linear-gradient(90deg,${BRAND.blue},${BRAND.purple});-webkit-background-clip:text;color:transparent}
  .table{position:relative;display:grid;grid-template-columns:0.82fr 1.18fr;border-radius:${f(34)};overflow:hidden;box-shadow:0 ${f(24)} ${f(70)} rgba(79,70,229,.22)${tall ? "" : ";flex:1"}}
  .col{display:flex;flex-direction:column}
  .them{background:#fff}
  .us{background:linear-gradient(160deg,${BRAND.blue},#4F46E5 50%,${BRAND.purple});color:#fff}
  .head{font-size:${f(tall ? 30 : 23)};font-weight:900;text-transform:uppercase;letter-spacing:.05em;padding:${f(tall ? 30 : 20)} ${f(24)}}
  .them .head{color:#6B7280}
  .cell{flex:1;display:flex;align-items:center;gap:${f(14)};padding:${f(tall ? 36 : 12)} ${f(24)};font-size:${f(tall ? 31 : 22)};line-height:1.22;font-weight:700;border-top:1px solid}
  .cell svg{flex-shrink:0}
  .them .cell{color:#6B7280;border-color:#EEF0F4}
  .us .cell{font-weight:800;border-color:rgba(255,255,255,.18)}
  .bottom{position:relative;display:flex;align-items:center;justify-content:space-between;gap:${f(20)};flex-wrap:wrap}
  .price{display:flex;flex-direction:column}
  .price small{font-size:${f(tall ? 26 : 20)};font-weight:700;color:#4F46E5;text-transform:uppercase;letter-spacing:.05em}
  .price b{font-size:${f(tall ? 86 : 58)};font-weight:900;letter-spacing:-0.03em;line-height:1}
  .price s{font-size:${f(tall ? 34 : 26)};color:#9CA3AF;font-weight:700;margin-left:${f(10)}}
  .cta{background:${BRAND.ink};color:#fff;border-radius:${f(24)};padding:${f(tall ? 26 : 18)} ${f(tall ? 34 : 26)};display:flex;flex-direction:column;align-items:flex-start}
  .cta small{font-size:${f(tall ? 24 : 18)};font-weight:600;opacity:.8}
  .cta span{font-size:${f(tall ? 42 : 32)};font-weight:900;white-space:nowrap}
  .foot{position:relative;font-size:${f(tall ? 28 : 20)};color:#3F4254;font-weight:600}
  </style></head><body><div class="wrap">
  <div class="blob" style="width:${f(720)};height:${f(720)};right:${f(-260)};top:${f(-300)};background:rgba(124,58,237,.10)"></div>
  <div class="blob" style="width:${f(560)};height:${f(560)};left:${f(-220)};bottom:${f(-240)};background:rgba(37,99,235,.10)"></div>
  <div class="top"><div class="logo">${logoMarkSvg(Math.round((tall ? 70 : 58) * s), "cmp")}<span>Onnex Test</span></div>${tall ? "" : `<span class="tag">Para prepa · México</span>`}</div>
  <h1>No todos los tests vocacionales <em>son iguales</em></h1>
  <div class="table">
    <div class="col them"><div class="head">Otros tests</div>${ROWS.map(([a]) => `<div class="cell">${x}<span>${a}</span></div>`).join("")}</div>
    <div class="col us"><div class="head">Onnex Test</div>${ROWS.map(([, b]) => `<div class="cell">${ok}<span>${b}</span></div>`).join("")}</div>
  </div>
  ${tall ? `<p class="foot">Toma de 10 a 15 minutos y lo haces desde tu celular.</p>` : ""}
  <div class="bottom">
    <div class="price"><small>Precio de lanzamiento</small><div><b>$299</b><s>$499</s></div></div>
    <div class="cta"><small>Pide tu código por WhatsApp</small><span>${BRAND.contactPhone}</span></div>
  </div>
  </div></body></html>`;
}

const outDir = path.resolve(import.meta.dirname, "artes");
fs.mkdirSync(outDir, { recursive: true });
const browser = await puppeteer.launch({ args: PUPPETEER_ARGS, executablePath: process.env.PUPPETEER_EXECUTABLE_PATH });
try {
  const page = await browser.newPage();
  for (const fm of FORMATS) {
    await page.setViewport({ width: fm.width, height: fm.height });
    await page.setContent(html(fm.width, fm.height, fm.tall), { waitUntil: "load" });
    const overflow = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
    if (overflow > 0) console.warn(`Aviso: ${fm.name} se desborda ${overflow}px`);
    await page.screenshot({ path: path.join(outDir, `${fm.name}.png`) });
    console.log("Arte generado:", `${fm.name}.png`);
  }
} finally {
  await browser.close();
}
