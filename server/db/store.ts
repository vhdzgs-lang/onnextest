import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { drizzle, type MySql2Database } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Answer, Student } from "@shared/validation";
import { logger } from "../logger";
import { testSubmissions } from "./schema";

export interface SubmissionRecord {
  id: number;
  publicId: string;
}

export interface EvaluationSummary {
  scores: Record<string, number>;
  careers: { id: string; name: string; match: number }[];
}

export interface DeliveryStatus {
  pdfGenerated: boolean;
  emailSent: boolean;
  emailId?: string | null;
  deliveryError?: string | null;
}

/** Persistencia de los tests. Separada para poder probar el flujo sin una base real. */
export interface SubmissionStore {
  saveSubmission(input: { student: Student; answers: Answer[]; completedAt: Date }): Promise<SubmissionRecord>;
  saveEvaluation(id: number, evaluation: EvaluationSummary): Promise<void>;
  updateDelivery(id: number, status: DeliveryStatus): Promise<void>;
}

export class DrizzleSubmissionStore implements SubmissionStore {
  constructor(private readonly db: MySql2Database) {}

  async saveSubmission({ student, answers, completedAt }: { student: Student; answers: Answer[]; completedAt: Date }) {
    const publicId = randomUUID();
    const [result] = await this.db.insert(testSubmissions).values({
      publicId,
      fullName: student.fullName,
      age: student.age,
      school: student.school,
      email: student.email,
      answers,
      completedAt,
    });
    return { id: result.insertId, publicId };
  }

  async saveEvaluation(id: number, evaluation: EvaluationSummary) {
    await this.db
      .update(testSubmissions)
      .set({ scores: evaluation.scores, recommendedCareers: evaluation.careers })
      .where(eq(testSubmissions.id, id));
  }

  async updateDelivery(id: number, status: DeliveryStatus) {
    await this.db
      .update(testSubmissions)
      .set({
        pdfGenerated: status.pdfGenerated,
        emailSent: status.emailSent,
        emailId: status.emailId ?? null,
        deliveryError: status.deliveryError ?? null,
      })
      .where(eq(testSubmissions.id, id));
  }
}

/** Almacén en memoria: solo para pruebas y desarrollo local sin MySQL. */
export class MemorySubmissionStore implements SubmissionStore {
  rows: (SubmissionRecord & { student: Student; answers: Answer[]; completedAt: Date; evaluation?: EvaluationSummary; delivery?: DeliveryStatus })[] = [];

  async saveSubmission(input: { student: Student; answers: Answer[]; completedAt: Date }) {
    const record = { id: this.rows.length + 1, publicId: randomUUID() };
    this.rows.push({ ...record, ...input });
    return record;
  }

  async saveEvaluation(id: number, evaluation: EvaluationSummary) {
    const row = this.rows.find((r) => r.id === id);
    if (row) row.evaluation = evaluation;
  }

  async updateDelivery(id: number, status: DeliveryStatus) {
    const row = this.rows.find((r) => r.id === id);
    if (row) row.delivery = status;
  }
}

/** Conecta a MySQL/TiDB y aplica las migraciones pendientes. */
export async function createDatabaseStore(
  databaseUrl: string,
  { autoMigrate, ssl }: { autoMigrate: boolean; ssl: boolean },
): Promise<SubmissionStore> {
  const pool = mysql.createPool({
    uri: databaseUrl,
    connectionLimit: 5,
    // TiDB Cloud y la mayoría de proveedores administrados exigen TLS.
    ssl: ssl || /tidbcloud\.com/i.test(databaseUrl) ? { minVersion: "TLSv1.2", rejectUnauthorized: true } : undefined,
  });
  const db = drizzle(pool);
  await pool.query("SELECT 1");
  logger.info("DB", "Conexión a la base de datos establecida");
  if (autoMigrate) {
    const migrationsFolder = findMigrationsFolder();
    if (!migrationsFolder) throw new Error("No se encontró la carpeta drizzle/ con las migraciones");
    await migrate(db, { migrationsFolder });
    logger.info("DB", "Migraciones aplicadas", { migrationsFolder });
  }
  return new DrizzleSubmissionStore(db);
}

function findMigrationsFolder(): string | undefined {
  const here = path.dirname(fileURLToPath(import.meta.url));
  // En desarrollo este archivo vive en server/db; en producción, empaquetado en dist/server.
  return [path.resolve(process.cwd(), "drizzle"), path.resolve(here, "../../drizzle"), path.resolve(here, "../drizzle")].find((p) =>
    existsSync(path.join(p, "meta", "_journal.json")),
  );
}
