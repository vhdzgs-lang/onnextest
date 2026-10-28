import { describe, expect, it, vi } from "vitest";
import { buildEmailContent, EmailSendError, sendReportEmail, type ResendLike } from "../server/email";
import { ADMIN_EMAIL, env } from "../server/env";
import { student } from "./helpers";

const pdf = Buffer.from("%PDF-1.4 contenido de prueba");
const base = { student, completedAt: "2026-10-28T12:00:00.000Z", pdf, filename: "Reporte-Onnex-Test-Ana-2026-10-28.pdf" };

function fakeClient(result: Awaited<ReturnType<ResendLike["emails"]["send"]>> = { data: { id: "email_123" }, error: null }) {
  const send = vi.fn().mockResolvedValue(result);
  return { client: { emails: { send } } as ResendLike, send };
}

describe("envío del correo con Resend", () => {
  it("envía el PDF adjunto exclusivamente al administrador", async () => {
    const { client, send } = fakeClient();
    await expect(sendReportEmail(base, client)).resolves.toEqual({ id: "email_123" });
    expect(send).toHaveBeenCalledOnce();
    const payload = send.mock.calls[0]![0];
    expect(ADMIN_EMAIL).toBe("vhdzgs@gmail.com");
    expect(payload.to).toEqual(["vhdzgs@gmail.com"]);
    expect(payload).not.toHaveProperty("cc");
    expect(payload).not.toHaveProperty("bcc");
    expect(JSON.stringify(payload.to)).not.toContain(student.email);
    expect(payload.subject).toBe(`Nuevo resultado de orientación vocacional - ${student.fullName}`);
    expect(payload.attachments).toHaveLength(1);
    const [att] = payload.attachments;
    expect(Buffer.isBuffer(att.content)).toBe(true);
    expect(att.content.equals(pdf)).toBe(true);
    expect(att.filename).toMatch(/\.pdf$/);
    expect(att.contentType).toBe("application/pdf");
  });

  it("el cuerpo incluye nombre, escuela, edad y fecha", () => {
    const { html, text } = buildEmailContent(base);
    for (const v of [student.fullName, student.school, "17 años", "28 de octubre de 2026"]) {
      expect(text).toContain(v);
    }
    expect(html).toContain("Ana Sof");
    expect(html).toContain("Onnex Test");
  });

  it("escapa los datos del estudiante en el HTML", () => {
    const { html } = buildEmailContent({ ...base, student: { ...student, school: "<b>x</b>" } });
    expect(html).not.toContain("<b>x</b>");
  });

  it("si Resend devuelve un error, lanza EmailSendError (no lo oculta)", async () => {
    const { client } = fakeClient({ data: null, error: { name: "validation_error", message: "The gmail.com domain is not verified", statusCode: 403 } });
    await expect(sendReportEmail(base, client)).rejects.toThrow(EmailSendError);
    await expect(sendReportEmail(base, client)).rejects.toThrow(/not verified/);
  });

  it("si Resend lanza una excepción, lanza EmailSendError", async () => {
    const client = { emails: { send: vi.fn().mockRejectedValue(new Error("ECONNRESET")) } } as unknown as ResendLike;
    await expect(sendReportEmail(base, client)).rejects.toThrow(/conexión con Resend/);
  });

  it.skipIf(Boolean(env.resendApiKey))("sin RESEND_API_KEY no intenta enviar", async () => {
    await expect(sendReportEmail(base)).rejects.toThrow(/RESEND_API_KEY/);
  });

  it("rechaza adjuntos que no son .pdf o están vacíos", async () => {
    const { client, send } = fakeClient();
    await expect(sendReportEmail({ ...base, filename: "reporte.txt" }, client)).rejects.toThrow(/\.pdf/);
    await expect(sendReportEmail({ ...base, pdf: Buffer.alloc(0) }, client)).rejects.toThrow(/vacío/);
    expect(send).not.toHaveBeenCalled();
  });

  it("no imprime la clave de API en los logs", async () => {
    const logs: string[] = [];
    const spy = vi.spyOn(console, "log").mockImplementation((m) => void logs.push(String(m)));
    const { client } = fakeClient();
    await sendReportEmail(base, client);
    spy.mockRestore();
    expect(logs.join("\n")).toContain("[EMAIL]");
    expect(logs.join("\n")).not.toMatch(/re_[A-Za-z0-9]{8,}/);
  });
});
