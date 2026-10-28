import { Resend } from "resend";
import type { Student } from "@shared/validation";
import { BRAND } from "@shared/brand";
// Gmail elimina los SVG, así que el correo usa un icono hecho con HTML y estilos en línea.
import { ADMIN_EMAIL, env } from "./env";
import { logger } from "./logger";
import { escapeHtml as e, formatDateEs } from "./reportTemplate";

export class EmailSendError extends Error {
  constructor(message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "EmailSendError";
  }
}

/** Lo mínimo que se usa del cliente de Resend; permite sustituirlo en pruebas. */
export interface ResendLike {
  emails: {
    send(payload: {
      from: string;
      to: string[];
      subject: string;
      html: string;
      text: string;
      attachments: { filename: string; content: Buffer; contentType: string }[];
    }): Promise<{ data: { id: string } | null; error: { message: string; name?: string; statusCode?: number | null } | null }>;
  };
}

export interface ReportEmail {
  student: Student;
  completedAt: string;
  pdf: Buffer;
  filename: string;
}

export function buildEmailContent({ student, completedAt }: Pick<ReportEmail, "student" | "completedAt">) {
  const date = formatDateEs(completedAt);
  const subject = `Nuevo resultado de orientación vocacional - ${student.fullName}`;
  const text = [
    "Se recibió un nuevo resultado de orientación vocacional en Onnex Test.",
    "",
    `Estudiante: ${student.fullName}`,
    `Escuela: ${student.school}`,
    `Edad: ${student.age} años`,
    `Correo del estudiante: ${student.email}`,
    `Fecha de realización: ${date}`,
    "",
    "El reporte completo va adjunto en PDF. El estudiante no recibió el reporte; solo vio la pantalla de confirmación.",
  ].join("\n");
  const row = (k: string, v: string) =>
    `<tr><td style="padding:6px 12px 6px 0;color:#6B7280;white-space:nowrap">${k}</td><td style="padding:6px 0;color:#111827;font-weight:600">${e(v)}</td></tr>`;
  const html = `<!doctype html><html lang="es"><body style="margin:0;background:#F5F6FB;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:560px;margin:0 auto;padding:24px">
    <div style="background:#fff;border-radius:16px;padding:28px;border:1px solid #E5E7EB">
      <table role="presentation"><tr><td style="width:36px;height:36px;border-radius:9px;background-color:#4F46E5;background-image:linear-gradient(135deg,${BRAND.blue},${BRAND.purple});color:#ffffff;font-weight:800;font-size:22px;line-height:36px;text-align:center">T<span style="color:${BRAND.ink}">.</span></td><td style="vertical-align:middle;padding-left:10px;font-size:20px;font-weight:800;color:${BRAND.ink};white-space:nowrap">Onnex Test</td></tr></table>
      <h1 style="font-size:20px;color:#111827;margin:22px 0 8px">Nuevo resultado de orientación vocacional</h1>
      <p style="color:#374151;margin:0 0 16px">Se recibió un nuevo resultado. El reporte completo va adjunto en PDF.</p>
      <table role="presentation" style="font-size:14px">${row("Estudiante", student.fullName)}${row("Escuela", student.school)}${row("Edad", `${student.age} años`)}${row("Correo", student.email)}${row("Fecha", date)}</table>
      <p style="color:#6B7280;font-size:12px;margin:20px 0 0">El estudiante no recibió el reporte; solo vio la pantalla de confirmación.</p>
    </div>
  </div></body></html>`;
  return { subject, html, text };
}

/**
 * Envía el reporte al administrador. El destinatario es fijo (ADMIN_EMAIL):
 * no hay forma de enviar el PDF a otra dirección desde esta función.
 */
export async function sendReportEmail(report: ReportEmail, client?: ResendLike): Promise<{ id: string }> {
  if (!client && !env.resendApiKey) {
    const err = new EmailSendError("Falta la variable de entorno RESEND_API_KEY");
    logger.error("EMAIL", "No se puede enviar el correo", err);
    throw err;
  }
  if (!report.filename.toLowerCase().endsWith(".pdf")) throw new EmailSendError("El nombre del adjunto debe terminar en .pdf");
  if (!Buffer.isBuffer(report.pdf) || report.pdf.length === 0) throw new EmailSendError("El PDF adjunto está vacío");

  const resend: ResendLike = client ?? (new Resend(env.resendApiKey) as unknown as ResendLike);
  const { subject, html, text } = buildEmailContent(report);
  const to = [ADMIN_EMAIL];

  logger.info("EMAIL", "Inicio de llamada a Resend", {
    to: ADMIN_EMAIL,
    from: env.emailFrom,
    subject,
    attachment: report.filename,
    contentType: "application/pdf",
    bytes: report.pdf.length,
    resendApiKeyPresent: Boolean(env.resendApiKey) || Boolean(client),
  });

  let response: Awaited<ReturnType<ResendLike["emails"]["send"]>>;
  try {
    response = await resend.emails.send({
      from: env.emailFrom,
      to,
      subject,
      html,
      text,
      attachments: [{ filename: report.filename, content: report.pdf, contentType: "application/pdf" }],
    });
  } catch (error) {
    logger.error("EMAIL", "Resend lanzó una excepción", error);
    throw new EmailSendError("Falló la conexión con Resend", { cause: error });
  }

  // Resend no lanza excepciones ante errores de la API: los devuelve en `error`.
  if (response.error || !response.data) {
    const err = new EmailSendError(`Resend rechazó el envío: ${response.error?.message ?? "respuesta vacía"}`);
    logger.error("EMAIL", "Resend respondió con error", err, {
      resendError: response.error?.name,
      statusCode: response.error?.statusCode,
      hint: /domain|verify|testing emails/i.test(response.error?.message ?? "")
        ? "Verifica que el dominio del remitente (EMAIL_FROM) esté verificado en Resend. Con onboarding@resend.dev solo se puede enviar al correo dueño de la cuenta de Resend."
        : undefined,
    });
    throw err;
  }

  logger.info("EMAIL", "Resend confirmó el envío", { id: response.data.id, to: ADMIN_EMAIL });
  return { id: response.data.id };
}
