import { initTRPC } from "@trpc/server";
import superjson from "superjson";
import type { SubmissionStore } from "./db/store";
import type { ReportEmail } from "./email";
import type { VocationalReport } from "@shared/evaluation";

/** Servicios que usa el router. Se inyectan para poder probar cada paso por separado. */
export interface Deps {
  store: SubmissionStore;
  generatePdf: (report: VocationalReport) => Promise<Buffer>;
  sendEmail: (email: ReportEmail) => Promise<{ id: string }>;
  now: () => Date;
}

export interface Context {
  deps: Deps;
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
