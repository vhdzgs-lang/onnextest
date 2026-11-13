import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "./app";
import { createDatabaseStore, MemorySubmissionStore, type SubmissionStore } from "./db/store";
import { MemoryAccessCodeStore, type AccessCodeStore } from "./db/accessCodes";
import { sendReportEmail } from "./email";
import { env, ADMIN_EMAIL } from "./env";
import { logger } from "./logger";
import { generatePdf } from "./pdfGenerator";

async function main() {
  let store: SubmissionStore;
  let codes: AccessCodeStore;
  if (env.databaseUrl) {
    ({ store, codes } = await createDatabaseStore(env.databaseUrl, { autoMigrate: env.dbAutoMigrate, ssl: env.databaseSsl }));
  } else if (env.isProduction) {
    throw new Error("Falta la variable de entorno DATABASE_URL");
  } else {
    logger.warn("DB", "DATABASE_URL no está definida: se usa almacenamiento en memoria (solo desarrollo)");
    store = new MemorySubmissionStore();
    codes = new MemoryAccessCodeStore();
  }
  if (!env.adminPassword) logger.warn("ADMIN", "ADMIN_PASSWORD no está definida: el panel /admin para generar códigos está desactivado");

  if (!env.resendApiKey) logger.warn("EMAIL", "RESEND_API_KEY no está definida: los correos no se podrán enviar");
  if (env.emailFrom.includes("onboarding@resend.dev")) {
    logger.warn("EMAIL", `EMAIL_FROM usa el remitente de prueba de Resend; solo podrá enviar al dueño de la cuenta de Resend (${ADMIN_EMAIL} debe serlo)`);
  }

  const here = path.dirname(fileURLToPath(import.meta.url));
  const staticDir = path.resolve(here, "../public");
  const app = createApp(
    { store, codes, generatePdf, sendEmail: sendReportEmail, now: () => new Date(), adminPassword: env.adminPassword },
    {
      staticDir: env.isProduction ? staticDir : undefined,
      health: () => ({ database: Boolean(env.databaseUrl), email: Boolean(env.resendApiKey) }),
    },
  );
  app.listen(env.port, () => logger.info("SERVER", `Onnex Test escuchando en el puerto ${env.port}`, { env: env.nodeEnv }));
}

process.on("unhandledRejection", (reason) => logger.error("SERVER", "Promesa rechazada sin manejar", reason));

main().catch((error) => {
  logger.error("SERVER", "No se pudo iniciar el servidor", error);
  process.exit(1);
});
