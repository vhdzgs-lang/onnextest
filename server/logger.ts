/**
 * Logs del servidor con etiqueta ([ROUTER], [PDF], [EMAIL], [DB], [SERVER]).
 * Nunca imprime claves: cualquier campo cuyo nombre parezca un secreto se reemplaza.
 */
export type LogTag = "ROUTER" | "PDF" | "EMAIL" | "DB" | "SERVER";

const SECRET_KEY = /(key|token|secret|password|authorization|database_url)/i;

function redact(meta: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(meta).map(([k, v]) => [k, SECRET_KEY.test(k) ? "[oculto]" : v]));
}

function format(tag: LogTag, message: string, meta?: Record<string, unknown>): string {
  const base = `${new Date().toISOString()} [${tag}] ${message}`;
  return meta && Object.keys(meta).length ? `${base} ${JSON.stringify(redact(meta))}` : base;
}

export const logger = {
  info(tag: LogTag, message: string, meta?: Record<string, unknown>) {
    console.log(format(tag, message, meta));
  },
  warn(tag: LogTag, message: string, meta?: Record<string, unknown>) {
    console.warn(format(tag, message, meta));
  },
  /** Registra el error completo: nombre, mensaje y stack trace. */
  error(tag: LogTag, message: string, error: unknown, meta?: Record<string, unknown>) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error(format(tag, message, { ...meta, errorName: err.name, errorMessage: err.message }));
    if (err.stack) console.error(`[${tag}] Stack trace:\n${err.stack}`);
  },
};
