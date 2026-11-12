import { boolean, int, json, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

export const testSubmissions = mysqlTable("test_submissions", {
  id: int("id").autoincrement().primaryKey(),
  publicId: varchar("public_id", { length: 36 }).notNull().unique(),
  fullName: varchar("full_name", { length: 120 }).notNull(),
  age: int("age").notNull(),
  school: varchar("school", { length: 150 }).notNull(),
  email: varchar("email", { length: 254 }).notNull(),
  answers: json("answers").$type<{ questionId: number; value: number }[]>().notNull(),
  scores: json("scores").$type<Record<string, number>>(),
  recommendedCareers: json("recommended_careers").$type<{ id: string; name: string; match: number }[]>(),
  pdfGenerated: boolean("pdf_generated").notNull().default(false),
  emailSent: boolean("email_sent").notNull().default(false),
  emailId: varchar("email_id", { length: 100 }),
  deliveryError: text("delivery_error"),
  completedAt: timestamp("completed_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow().onUpdateNow(),
});

export type TestSubmissionRow = typeof testSubmissions.$inferSelect;

/** Códigos de acceso que se venden por WhatsApp. Cada uno sirve para un solo test. */
export const accessCodes = mysqlTable("access_codes", {
  id: int("id").autoincrement().primaryKey(),
  /** Sin prefijo ni guiones (8 caracteres). Se muestra como ONX-XXXX-XXXX. */
  code: varchar("code", { length: 16 }).notNull().unique(),
  /** Nota libre del administrador: a quién se vendió, teléfono, etc. */
  note: varchar("note", { length: 200 }),
  redeemedAt: timestamp("redeemed_at"),
  redeemedByName: varchar("redeemed_by_name", { length: 120 }),
  redeemedByEmail: varchar("redeemed_by_email", { length: 254 }),
  submissionId: int("submission_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type AccessCodeRow = typeof accessCodes.$inferSelect;
