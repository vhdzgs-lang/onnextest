import puppeteer, { type Browser, type LaunchOptions } from "puppeteer";
import type { VocationalReport } from "@shared/evaluation";
import { env } from "./env";
import { logger } from "./logger";
import { renderReportHtml } from "./reportTemplate";

/** Opciones compatibles con servidores Linux y contenedores. */
export const PUPPETEER_ARGS = ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"];

export class PdfGenerationError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "PdfGenerationError";
  }
}

/** Nombre de archivo seguro: sin acentos, espacios ni caracteres especiales, y siempre con extensión .pdf. */
export function buildPdfFilename(fullName: string, date: Date = new Date()): string {
  const safe =
    fullName
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^A-Za-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60)
      .replace(/-+$/g, "") || "Estudiante";
  const day = date.toISOString().slice(0, 10);
  return `Reporte-Onnex-Test-${safe}-${day}.pdf`;
}

type Launcher = (options: LaunchOptions) => Promise<Browser>;

// Se limita a un navegador a la vez para no agotar la memoria del servidor.
let queue: Promise<unknown> = Promise.resolve();

export async function generatePdf(report: VocationalReport, launch: Launcher = (o) => puppeteer.launch(o)): Promise<Buffer> {
  const run = queue.then(() => renderPdf(report, launch));
  queue = run.catch(() => undefined);
  return run;
}

async function renderPdf(report: VocationalReport, launch: Launcher): Promise<Buffer> {
  const startedAt = Date.now();
  logger.info("PDF", "Inicio de generación del PDF", { careers: report.careers.map((c) => c.career.id) });
  let browser: Browser | undefined;
  try {
    const html = renderReportHtml(report);
    logger.info("PDF", "Iniciando Puppeteer", { args: PUPPETEER_ARGS, executablePath: env.puppeteerExecutablePath ?? "por defecto" });
    browser = await launch({ headless: true, args: PUPPETEER_ARGS, executablePath: env.puppeteerExecutablePath });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load", timeout: 30_000 });
    const data = await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true, timeout: 60_000 });
    const buffer = Buffer.from(data);
    if (buffer.length === 0 || buffer.subarray(0, 5).toString("latin1") !== "%PDF-") {
      throw new PdfGenerationError("Puppeteer devolvió un archivo que no es un PDF válido");
    }
    logger.info("PDF", "PDF generado correctamente", { bytes: buffer.length, kb: Math.round(buffer.length / 1024), ms: Date.now() - startedAt });
    return buffer;
  } catch (error) {
    logger.error("PDF", "Error al generar el PDF", error);
    throw error instanceof PdfGenerationError ? error : new PdfGenerationError("No se pudo generar el PDF", { cause: error });
  } finally {
    if (browser) {
      await browser.close().catch((err) => logger.error("PDF", "Error al cerrar el navegador", err));
      logger.info("PDF", "Navegador cerrado");
    }
  }
}
