/**
 * Prueba de integración del flujo completo en un navegador real con pantalla de celular:
 * registro → 50 preguntas → envío → PDF real con Puppeteer → correo (cliente de Resend simulado) → confirmación.
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import fs from "node:fs";
import type { AddressInfo } from "node:net";
import type { Server } from "node:http";
import path from "node:path";
import puppeteer, { type Browser } from "puppeteer";
import { build } from "vite";
import { CAREERS } from "@shared/careers";
import { createApp } from "../server/app";
import { MemorySubmissionStore } from "../server/db/store";
import { sendReportEmail, type ResendLike } from "../server/email";
import { generatePdf, PUPPETEER_ARGS } from "../server/pdfGenerator";
import { runStudentFlow } from "../scripts/e2eFlow";

const staticDir = path.resolve(import.meta.dirname, "../dist/public");
const sent: Parameters<ResendLike["emails"]["send"]>[0][] = [];
const fakeResend: ResendLike = { emails: { send: async (p) => (sent.push(p), { data: { id: "email_e2e" }, error: null }) } };
const store = new MemorySubmissionStore();
let server: Server;
let browser: Browser;
let baseUrl: string;

beforeAll(async () => {
  if (!fs.existsSync(path.join(staticDir, "index.html"))) {
    await build({ configFile: path.resolve(import.meta.dirname, "../vite.config.ts"), logLevel: "warn" });
  }
  const app = createApp(
    { store, generatePdf, sendEmail: (email) => sendReportEmail(email, fakeResend), now: () => new Date() },
    { staticDir },
  );
  server = app.listen(0);
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  browser = await puppeteer.launch({ args: PUPPETEER_ARGS, executablePath: process.env.PUPPETEER_EXECUTABLE_PATH });
});

afterAll(async () => {
  await browser?.close();
  server?.close();
});

describe("flujo completo en celular", () => {
  it("el estudiante solo ve la confirmación y el administrador recibe el PDF", async () => {
    const page = await browser.newPage();
    await page.setViewport({ width: 375, height: 740, isMobile: true, hasTouch: true });
    const result = await runStudentFlow(page, baseUrl);

    expect(result.url).toMatch(/\/listo$/);
    expect(result.confirmation).toContain("Tu evaluación fue completada correctamente");
    expect(result.horizontalOverflow).toBe(false);
    for (const c of CAREERS) expect(result.bodyText).not.toContain(c.name);

    expect(store.rows).toHaveLength(1);
    expect(store.rows[0]!.delivery).toMatchObject({ pdfGenerated: true, emailSent: true, emailId: "email_e2e" });
    expect(sent).toHaveLength(1);
    expect(sent[0]!.to).toEqual(["vhdzgs@gmail.com"]);
    const att = sent[0]!.attachments[0]!;
    expect(att.filename).toBe(`Reporte-Onnex-Test-Ana-Sofia-Ramirez-Trevino-${new Date().toISOString().slice(0, 10)}.pdf`);
    expect(att.contentType).toBe("application/pdf");
    expect(att.content.subarray(0, 5).toString()).toBe("%PDF-");
    expect((att.content.toString("latin1").match(/\/Type\s*\/Page(?![s\w])/g) ?? []).length).toBe(7);
  });

  it("las páginas públicas caben en pantallas de celular sin desplazamiento horizontal", async () => {
    const page = await browser.newPage();
    for (const width of [320, 375, 414]) {
      await page.setViewport({ width, height: 800, isMobile: true });
      for (const route of ["/", "/registro"]) {
        await page.goto(baseUrl + route, { waitUntil: "networkidle0" });
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow, `${route} a ${width}px`).toBeLessThanOrEqual(0);
        // El logo nunca se parte en dos líneas.
        const logoHeights = await page.$$eval('[aria-label="Onnex Test"][role="img"] > span', (els) =>
          els.map((el) => el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight || "1")),
        );
        for (const h of logoHeights) expect(h).toBeLessThan(1.6);
      }
    }
  });

  it("sirve el manifiesto PWA y el service worker", async () => {
    const manifest = await (await fetch(`${baseUrl}/manifest.webmanifest`)).json();
    expect(manifest.short_name).toBe("Onnex Test");
    expect(manifest.display).toBe("standalone");
    expect((await fetch(`${baseUrl}/sw.js`)).status).toBe(200);
  });
});
