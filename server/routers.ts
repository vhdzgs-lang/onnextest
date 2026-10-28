import { TRPCError } from "@trpc/server";
import { evaluate, type VocationalReport } from "@shared/evaluation";
import { PUBLIC_QUESTIONS, ANSWER_SCALE } from "@shared/questions";
import { submitTestSchema } from "@shared/validation";
import { ADMIN_EMAIL } from "./env";
import { logger } from "./logger";
import { buildPdfFilename } from "./pdfGenerator";
import { publicProcedure, router } from "./trpc";

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

export const appRouter = router({
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

      // 1. Guardado. Si falla la base de datos no se continúa.
      let submissionId: number;
      try {
        const record = await store.saveSubmission({ student: input.student, answers: input.answers, completedAt });
        submissionId = record.id;
        logger.info("ROUTER", "Respuestas guardadas en la base de datos", { submissionId });
      } catch (error) {
        logger.error("ROUTER", "Error de base de datos al guardar el test; se detiene el proceso", error);
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
