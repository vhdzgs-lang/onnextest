import { describe, expect, it, vi } from "vitest";
import { TRPCError } from "@trpc/server";
import { MemorySubmissionStore, type SubmissionStore } from "../server/db/store";
import { appRouter, STUDENT_CONFIRMATION } from "../server/routers";
import type { Deps } from "../server/trpc";
import { student, uniformAnswers } from "./helpers";

const input = { student, answers: uniformAnswers(4) };
const PDF = Buffer.from("%PDF-1.7 prueba");

function setup(overrides: Partial<Deps> = {}) {
  const store = new MemorySubmissionStore();
  const deps: Deps = {
    store,
    generatePdf: vi.fn().mockResolvedValue(PDF),
    sendEmail: vi.fn().mockResolvedValue({ id: "email_1" }),
    now: () => new Date("2026-10-28T12:00:00Z"),
    ...overrides,
  };
  return { deps, store, caller: appRouter.createCaller({ deps }) };
}

describe("submitTest", () => {
  it("guarda, genera el PDF y envía el correo; responde los tres estados", async () => {
    const { caller, deps, store } = setup();
    const res = await caller.test.submit(input);
    expect(res).toEqual({ saved: true, pdfGenerated: true, emailSent: true, message: STUDENT_CONFIRMATION });
    expect(store.rows).toHaveLength(1);
    expect(store.rows[0]!.evaluation?.careers).toHaveLength(3);
    expect(store.rows[0]!.delivery).toMatchObject({ pdfGenerated: true, emailSent: true, emailId: "email_1" });
    const email = vi.mocked(deps.sendEmail).mock.calls[0]![0];
    expect(email.pdf).toBe(PDF);
    expect(email.filename).toBe("Reporte-Onnex-Test-Ana-Sofia-Ramirez-Trevino-2026-10-28.pdf");
  });

  it("la respuesta al estudiante no incluye resultados", async () => {
    const res = await setup().caller.test.submit(input);
    expect(Object.keys(res).sort()).toEqual(["emailSent", "message", "pdfGenerated", "saved"]);
    expect(JSON.stringify(res)).not.toMatch(/carrera|career|score|Ingenier/i);
  });

  it("si falla la base de datos, informa el error y no continúa", async () => {
    const failing: SubmissionStore = {
      saveSubmission: vi.fn().mockRejectedValue(new Error("ECONNREFUSED 10.0.0.5:3306 password=secreta")),
      saveEvaluation: vi.fn(),
      updateDelivery: vi.fn(),
    };
    const { caller, deps } = setup({ store: failing });
    const err = await caller.test.submit(input).catch((e) => e);
    expect(err).toBeInstanceOf(TRPCError);
    expect(err.code).toBe("INTERNAL_SERVER_ERROR");
    expect(err.message).toMatch(/No pudimos guardar tu evaluación/);
    expect(err.message).not.toMatch(/ECONNREFUSED|password|3306/);
    expect(deps.generatePdf).not.toHaveBeenCalled();
    expect(deps.sendEmail).not.toHaveBeenCalled();
  });

  it("si falla Puppeteer, no envía un correo incompleto", async () => {
    const { caller, deps, store } = setup({ generatePdf: vi.fn().mockRejectedValue(new Error("Failed to launch")) });
    const res = await caller.test.submit(input);
    expect(res).toEqual({ saved: true, pdfGenerated: false, emailSent: false, message: STUDENT_CONFIRMATION });
    expect(deps.sendEmail).not.toHaveBeenCalled();
    expect(store.rows[0]!.delivery?.deliveryError).toMatch(/pdf: Failed to launch/);
  });

  it("si falla Resend, devuelve una respuesta controlada y registra el error", async () => {
    const errors: string[] = [];
    const spy = vi.spyOn(console, "error").mockImplementation((m) => void errors.push(String(m)));
    const { caller, store } = setup({ sendEmail: vi.fn().mockRejectedValue(new Error("Resend rechazó el envío: domain not verified")) });
    const res = await caller.test.submit(input);
    spy.mockRestore();
    expect(res).toEqual({ saved: true, pdfGenerated: true, emailSent: false, message: STUDENT_CONFIRMATION });
    expect(store.rows[0]!.delivery).toMatchObject({ pdfGenerated: true, emailSent: false });
    expect(errors.join("\n")).toMatch(/\[ROUTER\] .*Falló el envío del correo/);
    expect(errors.join("\n")).toMatch(/Stack trace/);
  });

  it("espera a Resend antes de responder", async () => {
    let resolved = false;
    const sendEmail = vi.fn(() => new Promise<{ id: string }>((r) => setTimeout(() => ((resolved = true), r({ id: "x" })), 30)));
    const res = await setup({ sendEmail }).caller.test.submit(input);
    expect(resolved).toBe(true);
    expect(res.emailSent).toBe(true);
  });

  it("valida los datos en el backend", async () => {
    const { caller, deps } = setup();
    await expect(caller.test.submit({ ...input, student: { ...student, email: "no-es-correo" } })).rejects.toThrow();
    await expect(caller.test.submit({ ...input, answers: input.answers.slice(0, 10) })).rejects.toThrow();
    expect(deps.sendEmail).not.toHaveBeenCalled();
  });

  it("registra cada paso con las etiquetas [ROUTER], en orden", async () => {
    const logs: string[] = [];
    const spy = vi.spyOn(console, "log").mockImplementation((m) => void logs.push(String(m)));
    await setup().caller.test.submit(input);
    spy.mockRestore();
    const steps = [
      "Inicio del procedimiento submitTest",
      "Datos del estudiante recibidos",
      "Respuestas guardadas",
      "Inicio de la evaluación",
      "Inicio de generación del PDF",
      "Enviando el reporte por correo",
      "submitTest completado",
    ];
    let last = -1;
    for (const step of steps) {
      const i = logs.findIndex((l) => l.includes("[ROUTER]") && l.includes(step));
      expect(i, step).toBeGreaterThan(last);
      last = i;
    }
    expect(logs.join("\n")).not.toContain(student.email);
  });

  it("expone las preguntas sin pesos", async () => {
    const { questions } = await setup().caller.test.questions();
    expect(questions).toHaveLength(50);
    expect(questions[0]).not.toHaveProperty("weights");
  });
});
