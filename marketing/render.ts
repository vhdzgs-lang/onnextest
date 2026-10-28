/**
 * Genera los artes para redes sociales en marketing/artes/: npm run ads
 * Formatos: 16:9 (1920x1080), 9:16 (1080x1920) y 1:1 (1080x1080).
 */
import fs from "node:fs";
import path from "node:path";
import puppeteer from "puppeteer";
import { BRAND, logoMarkSvg } from "@shared/brand";
import { PUPPETEER_ARGS } from "../server/pdfGenerator";

const FORMATS = [
  { name: "onnex-test-16x9", width: 1920, height: 1080, layout: "wide" },
  { name: "onnex-test-9x16", width: 1080, height: 1920, layout: "tall" },
  { name: "onnex-test-1x1", width: 1080, height: 1080, layout: "square" },
] as const;

const BENEFITS = ["Conoce tus fortalezas", "Identifica tus intereses", "Explora carreras", "Decide con mayor claridad"];

function html(layout: (typeof FORMATS)[number]["layout"], width: number, height: number): string {
  const s = Math.min(width, height) / 1080; // escala base
  const wide = layout === "wide";
  const square = layout === "square";
  const tall = layout === "tall";
  const check = `<svg width="${34 * s}" height="${34 * s}" viewBox="0 0 24 24"><circle cx="12" cy="12" r="12" fill="#fff"/><path d="M7 12.5l3.2 3.2L17 9" stroke="${BRAND.purple}" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{width:${width}px;height:${height}px;overflow:hidden;font-family:Inter,"Segoe UI",Arial,"Liberation Sans","DejaVu Sans",sans-serif;background:#F6F7FF;color:${BRAND.ink}}
  .wrap{position:relative;overflow:hidden;width:100%;height:100%;padding:${(tall ? 90 : 72) * s}px;display:flex;flex-direction:${wide ? "row" : "column"};gap:${(square ? 36 : 56) * s}px}
  .list{display:grid;grid-template-columns:${square ? "1fr 1fr" : "1fr"};gap:${(tall ? 24 : 16) * s}px}
  .blob{position:absolute;border-radius:50%;filter:blur(${2 * s}px)}
  .logo{display:inline-flex;align-items:center;gap:${18 * s}px;white-space:nowrap}
  .logo span{font-weight:800;font-size:${46 * s}px;letter-spacing:-0.02em;white-space:nowrap;color:${BRAND.ink}}
  .left{flex:${wide ? 1.15 : "none"};display:flex;flex-direction:column;justify-content:${wide ? "center" : "flex-start"};gap:${(tall ? 46 : square ? 22 : 30) * s}px;position:relative;z-index:1}
  .kicker{display:inline-block;align-self:flex-start;font-size:${24 * s}px;font-weight:700;color:#4F46E5;background:#fff;border-radius:999px;padding:${10 * s}px ${22 * s}px;box-shadow:0 ${4 * s}px ${20 * s}px rgba(79,70,229,.12)}
  h1{font-size:${(tall ? 104 : wide ? 92 : 74) * s}px;line-height:1.02;letter-spacing:-0.035em;font-weight:900}
  h1 em{font-style:normal;white-space:nowrap;background:linear-gradient(90deg,${BRAND.blue},${BRAND.purple});-webkit-background-clip:text;color:transparent}
  .sub{font-size:${(tall ? 36 : wide ? 30 : 27) * s}px;line-height:1.35;color:#3F4254;max-width:${(wide ? 820 : 960) * s}px}
  .card{flex:1;position:relative;z-index:1;border-radius:${44 * s}px;padding:${(tall ? 64 : 48) * s}px;color:#fff;background:linear-gradient(135deg,${BRAND.blue},#4F46E5 50%,${BRAND.purple});box-shadow:0 ${30 * s}px ${80 * s}px rgba(79,70,229,.35);display:flex;flex-direction:column;justify-content:center;gap:${(tall ? 30 : 20) * s}px}
  .card h2{font-size:${(tall ? 40 : 32) * s}px;font-weight:800;opacity:.9;text-transform:uppercase;letter-spacing:.06em}
  .b{display:flex;align-items:center;gap:${18 * s}px;font-size:${(tall ? 44 : square ? 29 : 36) * s}px;font-weight:800;background:rgba(255,255,255,.13);border:1px solid rgba(255,255,255,.25);border-radius:${22 * s}px;padding:${(tall ? 24 : 18) * s}px ${24 * s}px}
  .cta{display:flex;align-items:center;justify-content:space-between;gap:${20 * s}px;flex-wrap:wrap;margin-top:${(tall ? 14 : 6) * s}px}
  .btn{background:#fff;color:${BRAND.ink};font-weight:900;font-size:${(tall ? 40 : 32) * s}px;border-radius:${20 * s}px;padding:${20 * s}px ${34 * s}px;white-space:nowrap}
  .phone{font-size:${(tall ? 40 : 32) * s}px;font-weight:800;white-space:nowrap}
  .phone small{display:block;font-size:${(tall ? 24 : 20) * s}px;font-weight:600;opacity:.85}
  </style></head><body><div class="wrap">
  <div class="blob" style="width:${700 * s}px;height:${700 * s}px;right:${-200 * s}px;top:${-260 * s}px;background:rgba(124,58,237,.10)"></div>
  <div class="blob" style="width:${520 * s}px;height:${520 * s}px;left:${-180 * s}px;bottom:${-200 * s}px;background:rgba(37,99,235,.10)"></div>
  <div class="left">
    <div class="logo">${logoMarkSvg(Math.round(76 * s), "ad")}<span>Onnex Test</span></div>
    <span class="kicker">Orientación vocacional para preparatoria</span>
    <h1>¿Qué carrera <em>va contigo?</em></h1>
    <p class="sub">Responde nuestro test vocacional y recibe orientación personalizada sobre tus intereses, tu personalidad y las carreras más compatibles contigo.</p>
  </div>
  <div class="card">
    <h2>Con Onnex Test</h2>
    <div class="list">${BENEFITS.map((b) => `<div class="b">${check}<span>${b}</span></div>`).join("")}</div>
    <div class="cta"><span class="btn">¡Haz tu test hoy!</span><span class="phone"><small>Informes y WhatsApp</small>${BRAND.contactPhone}</span></div>
  </div>
  </div></body></html>`;
}

const outDir = path.resolve(import.meta.dirname, "artes");
fs.mkdirSync(outDir, { recursive: true });
const browser = await puppeteer.launch({ args: PUPPETEER_ARGS, executablePath: process.env.PUPPETEER_EXECUTABLE_PATH });
try {
  const page = await browser.newPage();
  for (const f of FORMATS) {
    await page.setViewport({ width: f.width, height: f.height });
    await page.setContent(html(f.layout, f.width, f.height), { waitUntil: "load" });
    const overflow = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
    if (overflow > 0) console.warn(`Aviso: ${f.name} se desborda ${overflow}px`);
    await page.screenshot({ path: path.join(outDir, `${f.name}.png`) });
    console.log("Arte generado:", `${f.name}.png`);
  }
} finally {
  await browser.close();
}
