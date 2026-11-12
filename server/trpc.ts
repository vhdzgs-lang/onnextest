import { timingSafeEqual } from "node:crypto";
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import type { SubmissionStore } from "./db/store";
import type { AccessCodeStore } from "./db/accessCodes";
import type { ReportEmail } from "./email";
import type { VocationalReport } from "@shared/evaluation";

/** Servicios que usa el router. Se inyectan para poder probar cada paso por separado. */
export interface Deps {
  store: SubmissionStore;
  codes: AccessCodeStore;
  generatePdf: (report: VocationalReport) => Promise<Buffer>;
  sendEmail: (email: ReportEmail) => Promise<{ id: string }>;
  now: () => Date;
  /** Contraseña del panel de administración. Vacía = panel desactivado. */
  adminPassword?: string;
}

export interface Context {
  deps: Deps;
  /** Contraseña enviada por el navegador en el encabezado x-admin-key. */
  adminKey?: string;
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
  // Nunca se envían al navegador stack traces ni detalles internos.
  errorFormatter({ shape }) {
    return { ...shape, data: { code: shape.data.code, httpStatus: shape.data.httpStatus } };
  },
});

export const router = t.router;
export const publicProcedure = t.procedure;

function samePassword(a: string, b: string): boolean {
  const ba = Buffer.from(a);
  const bb = Buffer.from(b);
  return ba.length === bb.length && timingSafeEqual(ba, bb);
}

/** Solo el administrador (con la contraseña de ADMIN_PASSWORD) puede usar estos procedimientos. */
export const adminProcedure = t.procedure.use(({ ctx, next }) => {
  const expected = ctx.deps.adminPassword ?? "";
  if (!expected) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "El panel de administración no está activado." });
  if (!ctx.adminKey || !samePassword(ctx.adminKey, expected)) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "Contraseña incorrecta." });
  }
  return next();
});
