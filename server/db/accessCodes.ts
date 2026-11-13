import { randomInt } from "node:crypto";
import { and, desc, eq, isNull } from "drizzle-orm";
import type { MySql2Database } from "drizzle-orm/mysql2";
import { CODE_ALPHABET, CODE_LENGTH } from "@shared/accessCode";
import { accessCodes } from "./schema";

export interface AccessCode {
  id: number;
  code: string;
  note: string | null;
  redeemedAt: Date | null;
  redeemedByName: string | null;
  redeemedByEmail: string | null;
  submissionId: number | null;
  createdAt: Date;
}

export type CodeStatus = "available" | "used" | "not_found";

/** Persistencia de los códigos de acceso. */
export interface AccessCodeStore {
  create(codes: string[], note: string | null): Promise<AccessCode[]>;
  list(): Promise<AccessCode[]>;
  status(code: string): Promise<CodeStatus>;
  /** Marca el código como usado solo si estaba disponible (operación atómica). Devuelve true si lo logró. */
  redeem(code: string, by: { name: string; email: string }): Promise<boolean>;
  /** Devuelve el código a disponible (si no se pudo guardar el test). */
  release(code: string): Promise<void>;
  linkSubmission(code: string, submissionId: number): Promise<void>;
  /** Borra un código que no se ha usado. Devuelve true si lo borró. */
  removeUnused(code: string): Promise<boolean>;
}

export function randomCode(): string {
  let out = "";
  for (let i = 0; i < CODE_LENGTH; i++) out += CODE_ALPHABET[randomInt(CODE_ALPHABET.length)];
  return out;
}

export class DrizzleAccessCodeStore implements AccessCodeStore {
  constructor(private readonly db: MySql2Database) {}

  async create(codes: string[], note: string | null) {
    if (codes.length) await this.db.insert(accessCodes).values(codes.map((code) => ({ code, note })));
    const rows = await this.list();
    return rows.filter((r) => codes.includes(r.code));
  }

  async list() {
    return this.db.select().from(accessCodes).orderBy(desc(accessCodes.id));
  }

  async status(code: string): Promise<CodeStatus> {
    const [row] = await this.db.select({ redeemedAt: accessCodes.redeemedAt }).from(accessCodes).where(eq(accessCodes.code, code)).limit(1);
    if (!row) return "not_found";
    return row.redeemedAt ? "used" : "available";
  }

  async redeem(code: string, by: { name: string; email: string }) {
    const [result] = await this.db
      .update(accessCodes)
      .set({ redeemedAt: new Date(), redeemedByName: by.name, redeemedByEmail: by.email })
      .where(and(eq(accessCodes.code, code), isNull(accessCodes.redeemedAt)));
    return result.affectedRows === 1;
  }

  async release(code: string) {
    await this.db
      .update(accessCodes)
      .set({ redeemedAt: null, redeemedByName: null, redeemedByEmail: null, submissionId: null })
      .where(eq(accessCodes.code, code));
  }

  async linkSubmission(code: string, submissionId: number) {
    await this.db.update(accessCodes).set({ submissionId }).where(eq(accessCodes.code, code));
  }

  async removeUnused(code: string) {
    const [result] = await this.db.delete(accessCodes).where(and(eq(accessCodes.code, code), isNull(accessCodes.redeemedAt)));
    return result.affectedRows === 1;
  }
}

/** Almacén en memoria: solo para pruebas y desarrollo local sin MySQL. */
export class MemoryAccessCodeStore implements AccessCodeStore {
  rows: AccessCode[] = [];

  async create(codes: string[], note: string | null) {
    const created = codes.map((code) => {
      if (this.rows.some((r) => r.code === code)) throw new Error(`Duplicate entry '${code}'`);
      const row: AccessCode = {
        id: this.rows.length + 1,
        code,
        note,
        redeemedAt: null,
        redeemedByName: null,
        redeemedByEmail: null,
        submissionId: null,
        createdAt: new Date(),
      };
      this.rows.push(row);
      return row;
    });
    return created;
  }

  async list() {
    return [...this.rows].reverse();
  }

  async status(code: string): Promise<CodeStatus> {
    const row = this.rows.find((r) => r.code === code);
    if (!row) return "not_found";
    return row.redeemedAt ? "used" : "available";
  }

  async redeem(code: string, by: { name: string; email: string }) {
    const row = this.rows.find((r) => r.code === code);
    if (!row || row.redeemedAt) return false;
    Object.assign(row, { redeemedAt: new Date(), redeemedByName: by.name, redeemedByEmail: by.email });
    return true;
  }

  async release(code: string) {
    const row = this.rows.find((r) => r.code === code);
    if (row) Object.assign(row, { redeemedAt: null, redeemedByName: null, redeemedByEmail: null, submissionId: null });
  }

  async linkSubmission(code: string, submissionId: number) {
    const row = this.rows.find((r) => r.code === code);
    if (row) row.submissionId = submissionId;
  }

  async removeUnused(code: string) {
    const i = this.rows.findIndex((r) => r.code === code && !r.redeemedAt);
    if (i === -1) return false;
    this.rows.splice(i, 1);
    return true;
  }
}
