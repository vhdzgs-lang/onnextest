/**
 * Reintenta los reportes que no llegaron al administrador (email_sent = false):
 *   npm run resend-pending
 * Útil después de corregir RESEND_API_KEY o EMAIL_FROM.
 */
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { evaluate } from "@shared/evaluation";
import { testSubmissions } from "../server/db/schema";
import { DrizzleSubmissionStore } from "../server/db/store";
import { sendReportEmail } from "../server/email";
import { env } from "../server/env";
import { logger } from "../server/logger";
import { buildPdfFilename, generatePdf } from "../server/pdfGenerator";

if (!env.databaseUrl) throw new Error("Falta DATABASE_URL");
const pool = mysql.createPool({ uri: env.databaseUrl, ssl: env.databaseSsl ? { minVersion: "TLSv1.2" } : undefined });
const db = drizzle(pool);
const store = new DrizzleSubmissionStore(db);
const pending = await db.select().from(testSubmissions).where(eq(testSubmissions.emailSent, false));
logger.info("SERVER", `Reportes pendientes de envío: ${pending.length}`);

for (const row of pending) {
  const student = { fullName: row.fullName, age: row.age, school: row.school, email: row.email };
  try {
    const report = evaluate(student, row.answers, row.completedAt);
    const pdf = await generatePdf(report);
    const { id } = await sendReportEmail({ student, completedAt: report.completedAt, pdf, filename: buildPdfFilename(row.fullName, row.completedAt) });
    await store.updateDelivery(row.id, { pdfGenerated: true, emailSent: true, emailId: id });
    logger.info("SERVER", "Reporte reenviado", { submissionId: row.id, emailId: id });
  } catch (error) {
    logger.error("SERVER", "No se pudo reenviar el reporte", error, { submissionId: row.id });
  }
}
await pool.end();
