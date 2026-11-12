import { z } from "zod";

/** Letras y números sin caracteres que se confunden al dictarlos o leerlos (0/O, 1/I/L). */
export const CODE_ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
export const CODE_LENGTH = 8;
const PREFIX = "ONX";

/**
 * Normaliza lo que escribe el estudiante: mayúsculas, sin espacios ni guiones y sin el prefijo ONX.
 * "onx-ab3d 7kpq" → "AB3D7KPQ".
 */
export function normalizeCode(raw: string): string {
  const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  return clean.startsWith(PREFIX) && clean.length > CODE_LENGTH ? clean.slice(PREFIX.length) : clean;
}

/** Forma legible para compartir: ONX-AB3D-7KPQ. */
export function formatCode(code: string): string {
  const c = normalizeCode(code);
  return `${PREFIX}-${c.slice(0, 4)}-${c.slice(4)}`;
}

export function isWellFormedCode(code: string): boolean {
  const c = normalizeCode(code);
  return c.length === CODE_LENGTH && [...c].every((ch) => CODE_ALPHABET.includes(ch));
}

export const accessCodeSchema = z
  .string({ required_error: "Escribe tu código de acceso.", invalid_type_error: "Escribe tu código de acceso." })
  .trim()
  .min(1, "Escribe tu código de acceso.")
  .max(40, "Revisa tu código de acceso.")
  .refine(isWellFormedCode, "Revisa tu código: tiene el formato ONX-XXXX-XXXX.")
  .transform(normalizeCode);

export const ACCESS_CODE_MESSAGES = {
  notFound: "Ese código no existe. Revisa que esté bien escrito o escríbenos por WhatsApp.",
  used: "Ese código ya fue usado. Cada código sirve para un solo test.",
} as const;
