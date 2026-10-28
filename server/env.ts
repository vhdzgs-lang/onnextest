import "dotenv/config";

/** Destinatario único de los reportes. No es configurable a propósito. */
export const ADMIN_EMAIL = "vhdzgs@gmail.com";

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  isProduction: process.env.NODE_ENV === "production",
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: process.env.DATABASE_URL ?? "",
  resendApiKey: process.env.RESEND_API_KEY ?? "",
  /** Remitente. Debe pertenecer a un dominio verificado en Resend. */
  emailFrom: process.env.EMAIL_FROM ?? "Onnex Test <onboarding@resend.dev>",
  puppeteerExecutablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
  databaseSsl: process.env.DATABASE_SSL === "true",
  dbAutoMigrate: process.env.DB_AUTO_MIGRATE !== "false",
  trustProxy: process.env.TRUST_PROXY ?? "1",
};
