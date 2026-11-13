/**
 * Recorre el flujo completo en un navegador real (registro → 50 preguntas → confirmación)
 * contra un servidor en marcha: BASE_URL=http://localhost:3000 npx tsx scripts/e2eFlow.ts
 */
import puppeteer, { type Page } from "puppeteer";
import { PUPPETEER_ARGS } from "../server/pdfGenerator";

export async function runStudentFlow(page: Page, baseUrl: string, shotsDir?: string, accessCode = process.env.ACCESS_CODE ?? "ONX-AB3D-7KPQ") {
  const shot = async (name: string) => {
    if (shotsDir) await page.screenshot({ path: `${shotsDir}/${name}.png`, fullPage: true });
  };
  await page.goto(baseUrl, { waitUntil: "networkidle0" });
  await shot("01-inicio");
  await page.locator("main a[href=\"/registro\"]").click();
  await page.waitForSelector("#fullName");
  // Validación: enviar vacío muestra errores.
  await page.locator("form button[type=submit]").click();
  await page.waitForSelector("[role=alert]");
  await shot("02-registro-errores");
  // Un código que no existe se rechaza antes de empezar.
  await page.type("#accessCode", "ONX-ZZZZ-ZZZZ");
  await page.type("#fullName", "Ana Sofía Ramírez Treviño");
  await page.type("#age", "17");
  await page.type("#school", "Preparatoria Onnex Tampico");
  await page.type("#email", "ana.sofia@example.com");
  await page.locator("form button[type=submit]").click();
  await page.waitForFunction(() => document.getElementById("accessCode-error")?.textContent?.includes("no existe"));
  await page.$eval("#accessCode", (el) => ((el as HTMLInputElement).value = ""));
  await page.click("#accessCode", { count: 3 });
  await page.keyboard.press("Backspace");
  await page.type("#accessCode", accessCode.toLowerCase());
  await shot("03-registro");
  await page.locator("form button[type=submit]").click();
  await page.waitForSelector("[role=radiogroup]");
  await shot("04-pregunta-1");

  for (let i = 0; i < 50; i++) {
    await page.waitForFunction((n) => document.body.innerText.includes(`Pregunta ${n} de 50`), {}, i + 1);
    const options = await page.$$("[role=radio]");
    await options[(i * 3) % 5]!.click();
    if (i === 24) await shot("05-pregunta-25");
    if (i < 49) {
      await page.waitForFunction((n) => document.body.innerText.includes(`Pregunta ${n} de 50`), {}, i + 2);
    }
  }
  // Regresar y volver: la respuesta se conserva.
  await page.locator("button ::-p-text(Anterior)").click();
  await page.waitForFunction(() => document.body.innerText.includes("Pregunta 49 de 50"));
  const kept = await page.$$eval("[role=radio]", (els) => els.some((e) => e.getAttribute("aria-checked") === "true"));
  if (!kept) throw new Error("Se perdió la respuesta al regresar");
  await page.locator("button ::-p-text(Siguiente)").click();
  await page.waitForFunction(() => document.body.innerText.includes("Pregunta 50 de 50"));
  await shot("06-pregunta-50");
  await page.locator("button ::-p-text(Enviar respuestas)").click();
  await page.waitForSelector("[data-testid=confirmation]", { timeout: 90_000 });
  await shot("07-confirmacion");
  const confirmation = await page.$eval("[data-testid=confirmation]", (el) => el.textContent ?? "");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  return { confirmation, url: page.url(), horizontalOverflow: overflow, bodyText: await page.evaluate(() => document.body.innerText) };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const baseUrl = process.env.BASE_URL ?? "http://localhost:3000";
  const browser = await puppeteer.launch({ args: PUPPETEER_ARGS, executablePath: process.env.PUPPETEER_EXECUTABLE_PATH });
  const page = await browser.newPage();
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const res = await runStudentFlow(page, baseUrl, process.env.SHOTS_DIR);
  console.log(JSON.stringify({ ...res, bodyText: undefined }, null, 2));
  await browser.close();
}
