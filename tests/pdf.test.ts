import { describe, expect, it, vi } from "vitest";
import puppeteer, { type Browser } from "puppeteer";
import { evaluate } from "@shared/evaluation";
import { CAREERS } from "@shared/careers";
import { buildPdfFilename, generatePdf, PdfGenerationError, PUPPETEER_ARGS } from "../server/pdfGenerator";
import { escapeHtml, renderReportHtml, TOTAL_PAGES } from "../server/reportTemplate";
import { answersWith, idsFor, student } from "./helpers";

const report = evaluate(student, answersWith(idsFor("tecnologica")), new Date("2026-10-28T12:00:00Z"));
const countPages = (pdf: Buffer) => (pdf.toString("latin1").match(/\/Type\s*\/Page(?![s\w])/g) ?? []).length;

describe("nombre del archivo PDF", () => {
  it("incluye el nombre del estudiante sin acentos ni caracteres peligrosos y termina en .pdf", () => {
    const date = new Date("2026-10-28T12:00:00Z");
    expect(buildPdfFilename("Ana Sofía Ramírez Treviño", date)).toBe("Reporte-Onnex-Test-Ana-Sofia-Ramirez-Trevino-2026-10-28.pdf");
    expect(buildPdfFilename("../../etc/passwd", date)).toBe("Reporte-Onnex-Test-etc-passwd-2026-10-28.pdf");
    expect(buildPdfFilename("!!!", date)).toBe("Reporte-Onnex-Test-Estudiante-2026-10-28.pdf");
    expect(buildPdfFilename("a".repeat(300), date).length).toBeLessThan(110);
  });
});

describe("plantilla del reporte", () => {
  it("escapa los datos del estudiante", () => {
    const html = renderReportHtml({ ...report, student: { ...student, school: `<img src=x onerror="alert(1)">` } });
    expect(html).not.toContain("<img src=x");
    expect(html).toContain(escapeHtml(`<img src=x onerror="alert(1)">`));
  });

  it("contiene las 7 páginas, el logo y los datos de portada", () => {
    const html = renderReportHtml(report);
    expect(html.match(/class="page/g)).toHaveLength(TOTAL_PAGES);
    expect(html).toContain("Onnex Test");
    expect(html).toContain("<svg");
    for (const v of [student.fullName, student.school, "17 años", "28 de octubre de 2026"]) expect(html).toContain(escapeHtml(v));
    expect(html).toContain("833 343 5410");
    expect(html).toMatch(/no sustituye una evaluación psicológica clínica/i);
  });
});

describe("generación del PDF con Puppeteer", () => {
  it("crea un buffer PDF válido de 7 páginas", async () => {
    const pdf = await generatePdf(report);
    expect(Buffer.isBuffer(pdf)).toBe(true);
    expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
    expect(pdf.length).toBeGreaterThan(20_000);
    expect(countPages(pdf)).toBe(TOTAL_PAGES);
  });

  it("ningún contenido se sale de su página, aun con textos largos", async () => {
    const browser = await puppeteer.launch({ args: PUPPETEER_ARGS, executablePath: process.env.PUPPETEER_EXECUTABLE_PATH });
    try {
      const page = await browser.newPage();
      const longStudent = {
        ...student,
        fullName: "María Guadalupe Fernández de la Garza Villarreal",
        school: "Centro de Bachillerato Tecnológico Industrial y de Servicios No. 103",
      };
      for (let i = 0; i < CAREERS.length; i += 2) {
        const base = evaluate(longStudent, answersWith(idsFor("social")));
        const careers = [0, 1, 2].map((k) => ({ ...base.careers[0]!, career: CAREERS[(i + k) % CAREERS.length]! }));
        await page.setContent(renderReportHtml({ ...base, careers }));
        const overflow = await page.evaluate(() => Array.from(document.querySelectorAll(".pbody")).map((el) => el.scrollHeight - el.clientHeight));
        expect(overflow.every((o) => o <= 0), `carreras desde ${i}: ${overflow}`).toBe(true);
      }
    } finally {
      await browser.close();
    }
  });

  it("si Puppeteer no arranca, lanza PdfGenerationError", async () => {
    const launch = vi.fn().mockRejectedValue(new Error("Failed to launch the browser process"));
    await expect(generatePdf(report, launch)).rejects.toBeInstanceOf(PdfGenerationError);
  });

  it("cierra el navegador aunque falle la generación", async () => {
    const close = vi.fn().mockResolvedValue(undefined);
    const fakeBrowser = {
      newPage: vi.fn().mockResolvedValue({
        setContent: vi.fn().mockResolvedValue(undefined),
        pdf: vi.fn().mockRejectedValue(new Error("Target closed")),
      }),
      close,
    } as unknown as Browser;
    await expect(generatePdf(report, async () => fakeBrowser)).rejects.toThrow(/No se pudo generar el PDF/);
    expect(close).toHaveBeenCalledOnce();
  });

  it("rechaza una salida que no es PDF", async () => {
    const fakeBrowser = {
      newPage: async () => ({ setContent: async () => undefined, pdf: async () => new Uint8Array([1, 2, 3]) }),
      close: async () => undefined,
    } as unknown as Browser;
    await expect(generatePdf(report, async () => fakeBrowser)).rejects.toThrow(/no es un PDF válido/);
  });

  it("usa las opciones de Linux requeridas", () => {
    expect(PUPPETEER_ARGS).toEqual(["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"]);
  });
});
