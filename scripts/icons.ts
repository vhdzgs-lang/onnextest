/** Genera los iconos PNG de la PWA a partir del SVG oficial: npx tsx scripts/icons.ts */
import fs from "node:fs";
import puppeteer from "puppeteer";
import { logoMarkSvg } from "@shared/brand";
import { PUPPETEER_ARGS } from "../server/pdfGenerator";

const out = "client/public/icons";
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(`${out}/icon.svg`, logoMarkSvg(64, "fav"));

const browser = await puppeteer.launch({ args: PUPPETEER_ARGS, executablePath: process.env.PUPPETEER_EXECUTABLE_PATH });
const page = await browser.newPage();
const render = async (file: string, size: number, maskable: boolean) => {
  await page.setViewport({ width: size, height: size });
  const inner = maskable ? Math.round(size * 0.8) : size;
  const bg = maskable ? "linear-gradient(135deg,#2563EB,#7C3AED)" : "transparent";
  await page.setContent(
    `<html><body style="margin:0;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center;background:${bg}">${logoMarkSvg(inner, "i")}</body></html>`,
  );
  await page.screenshot({ path: `${out}/${file}`, omitBackground: !maskable });
};
await render("icon-192.png", 192, false);
await render("icon-512.png", 512, false);
await render("icon-maskable-512.png", 512, true);
await render("apple-touch-icon.png", 180, true);
await browser.close();
console.log("Iconos generados en", out);
