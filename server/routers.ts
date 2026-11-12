import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { ACCESS_CODE_MESSAGES, formatCode, isWellFormedCode, normalizeCode } from "@shared/accessCode";
import { randomCode } from "./db/accessCodes";
import { evaluate, type VocationalReport } from "@shared/evaluation";
import { PUBLIC_QUESTIONS, ANSWER_SCALE } from "@shared/questions";
import { submitTestSchema } from "@shared/validation";
import { ADMIN_EMAIL } from "./env";
import { logger } from "./logger";
import { buildPdfFilename } from "./pdfGenerator";
import { adminProcedure, publicProcedure, router } from "./trpc";

export const STUDENT_CONFIRMATION =
  "Tu evaluación fue completada correctamente. Nuestro equipo revisará tus resultados y se pondrá en contacto contigo para compartirte información sobre tu orientación vocacional.";

export interface SubmitTestResult {
  /** El test quedó guardado en la base de datos. */
  saved: boolean;
  /** El PDF se generó correctamente. */
  pdfGenerated: boolean;
  /** Resend confirmó el envío del correo al administrador. */
  emailSent: boolean;
  /** Mensaje para el estudiante: nunca incluye resultados ni detalles técnicos. */
  message: string;
}

function maskEmail(email: string): string {
  const [user = "", domain = ""] = email.split("@");
  return `${user.slice(0, 2)}***@${domain}`;
}

const errorMessage = (err: unknown) => (err instanceof Error ? err.message : String(err));

const codeNotAccepted = (status: "used" | "not_found" | "available") =>
  status === "used" ? ACCESS_CODE_MESSAGES.used : ACCESS_CODE_MESSAGES.notFound;

export const appRouter = router({
  access: router({
    /** Revisa si un código se puede usar, antes de empezar el test. No lo marca como usado. */
    check: publicProcedure.input(z.object({ code: z.string().max(40) })).query(async ({ input, ctx }) => {
      if (!isWellFormedCode(input.code)) return { ok: false as const, message: "Revisa tu código: tiene el formato ONX-XXXX-XXXX." };
      const status = await ctx.deps.codes.status(normalizeCode(input.code));
      if (status === "available") return { ok: true as const, code: formatCode(input.code) };
      return { ok: false as const, message: codeNotAccepted(status) };
    }),
  }),

  admin: router({
    /** Comprueba la contraseña al entrar al panel. */
    login: adminProcedure.query(() => ({ ok: true })),

    codes: adminProcedure.query(async ({ ctx }) => {
      const rows = await ctx.deps.codes.list();
      return rows.map((r) => ({ ...r, code: formatCode(r.code) }));
    }),

    createCodes: adminProcedure
      .input(z.object({ quantity: z.number().int().min(1).max(50), note: z.string().trim().max(200).optional() }))
      .mutation(async ({ input, ctx }) => {
        const codes = new Set<string>();
        while (codes.size < input.quantity) codes.add(randomCode());
        const created = await ctx.deps.codes.create([...codes], input.note || null);
        logger.info("ADMIN", "Códigos de acceso generados", { quantity: created.length });
        return created.map((r) => ({ ...r, code: formatCode(r.code) }));
      }),

    removeCode: adminProcedure.input(z.object({ code: z.string().max(40) })).mutation(async ({ input, ctx }) => {
      const removed = await ctx.deps.codes.removeUnused(normalizeCode(input.code));
      if (!removed) throw new TRPCError({ code: "BAD_REQUEST", message: "Solo se pueden borrar códigos que no se han usado." });
      logger.info("ADMIN", "Código de acceso borrado");
      return { ok: true };
    }),
  }),

  test: router({
    /** Preguntas del cuestionario, sin los pesos que usa la evaluación. */
    questions: publicProcedure.query(() => ({ questions: PUBLIC_QUESTIONS, scale: ANSWER_SCALE })),

    submit: publicProcedure.input(submitTestSchema).mutation(async ({ input, ctx }): Promise<SubmitTestResult> => {
      const { store, generatePdf, sendEmail, now } = ctx.deps;
      const completedAt = now();
      logger.info("ROUTER", "Inicio del procedimiento submitTest");
      logger.info("ROUTER", "Datos del estudiante recibidos y validados", {
        fullName: input.student.fullName,
        age: input.student.age,
        school: input.student.school,
        email: maskEmail(input.student.email),
        answers: input.answers.length,
      });

      // 0. Código de acceso: se marca como usado de forma atómica, así dos personas no pueden usar el mismo.
      const { codes } = ctx.deps;
      let redeemed: boolean;
      try {
        redeemed = await codes.redeem(input.accessCode, { name: input.student.fullName, email: input.student.email });
      } catch (error) {
        logger.error("ROUTER", "Error de base de datos al validar el código de acceso", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "No pudimos guardar tu evaluación. Por favor intenta de nuevo en unos minutos.",
        });
      }
      if (!redeemed) {
        const status = await codes.status(input.accessCode).catch(() => "not_found" as const);
        logger.warn("ROUTER", "Código de acceso rechazado", { status });
        throw new TRPCError({ code: "FORBIDDEN", message: codeNotAccepted(status) });
      }
      logger.info("ROUTER", "Código de acceso aceptado");

      // 1. Guardado. Si falla la base de datos no se continúa (y el código vuelve a quedar disponible).
      let submissionId: number;
      try {
        const record = await store.saveSubmission({ student: input.student, answers: input.answers, completedAt });
        submissionId = record.id;
        logger.info("ROUTER", "Respuestas guardadas en la base de datos", { submissionId });
        await codes
          .linkSubmission(input.accessCode, submissionId)
          .catch((err) => logger.error("ROUTER", "No se pudo ligar el código al test", err, { submissionId }));
      } catch (error) {
        logger.error("ROUTER", "Error de base de datos al guardar el test; se detiene el proceso", error);
        await codes.release(input.accessCode).catch((err) => logger.error("ROUTER", "No se pudo liberar el código de acceso", err));
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "No pudimos guardar tu evaluación. Por favor intenta de nuevo en unos minutos.",
        });
      }

      // 2. Evaluación vocacional.
      let report: VocationalReport;
      try {
        logger.info("ROUTER", "Inicio de la evaluación vocacional", { submissionId });
        report = evaluate(input.student, input.answers, completedAt);
        logger.info("ROUTER", "Evaluación completada", {
          submissionId,
          personalityType: report.personalityType.name,
          careers: report.careers.map((c) => `${c.career.id}:${c.match}`),
        });
      } catch (error) {
        logger.error("ROUTER", "Error en la evaluación vocacional", error, { submissionId });
        await store
          .updateDelivery(submissionId, { pdfGenerated: false, emailSent: false, deliveryError: `evaluación: ${errorMessage(error)}` })
          .catch((err) => logger.error("ROUTER", "No se pudo registrar el error en la base de datos", err));
        return { saved: true, pdfGenerated: false, emailSent: false, message: STUDENT_CONFIRMATION };
      }

      try {
        await store.saveEvaluation(submissionId, {
          scores: report.scores,
          careers: report.careers.map((c) => ({ id: c.career.id, name: c.career.name, match: c.match })),
        });
      } catch (error) {
        // No bloquea el envío: el reporte ya está calculado.
        logger.error("ROUTER", "No se pudo guardar el resultado de la evaluación (se continúa con el PDF)", error, { submissionId });
      }

      // 3. PDF. Si falla, no se envía un correo incompleto.
      let pdf: Buffer;
      const filename = buildPdfFilename(input.student.fullName, completedAt);
      try {
        logger.info("ROUTER", "Inicio de generación del PDF", { submissionId, filename });
        pdf = await generatePdf(report);
        logger.info("ROUTER", "PDF listo", { submissionId, bytes: pdf.length });
      } catch (error) {
        logger.error("ROUTER", "Falló la generación del PDF; no se enviará el correo", error, { submissionId });
        await store
          .updateDelivery(submissionId, { pdfGenerated: false, emailSent: false, deliveryError: `pdf: ${errorMessage(error)}` })
          .catch((err) => logger.error("ROUTER", "No se pudo registrar el error en la base de datos", err));
        return { saved: true, pdfGenerated: false, emailSent: false, message: STUDENT_CONFIRMATION };
      }

      // 4. Correo al administrador (se espera la respuesta de Resend antes de responder).
      try {
        logger.info("ROUTER", "Enviando el reporte por correo", { submissionId, to: ADMIN_EMAIL, filename });
        const { id } = await sendEmail({ student: input.student, completedAt: report.completedAt, pdf, filename });
        await store
          .updateDelivery(submissionId, { pdfGenerated: true, emailSent: true, emailId: id })
          .catch((err) => logger.error("ROUTER", "No se pudo registrar el envío en la base de datos", err));
        logger.info("ROUTER", "submitTest completado: guardado, PDF y correo correctos", { submissionId, emailId: id });
        return { saved: true, pdfGenerated: true, emailSent: true, message: STUDENT_CONFIRMATION };
      } catch (error) {
        logger.error("ROUTER", "Falló el envío del correo al administrador", error, { submissionId });
        await store
          .updateDelivery(submissionId, { pdfGenerated: true, emailSent: false, deliveryError: `correo: ${errorMessage(error)}` })
          .catch((err) => logger.error("ROUTER", "No se pudo registrar el error en la base de datos", err));
        return { saved: true, pdfGenerated: true, emailSent: false, message: STUDENT_CONFIRMATION };
      }
    }),
  }),
});

export type AppRouter = typeof appRouter;
