import { z } from "zod";
import { MAX_ANSWER, MIN_ANSWER, QUESTIONS, TOTAL_QUESTIONS } from "./questions";

export const MIN_AGE = 12;
export const MAX_AGE = 25;

const trimmed = (field: string, min: number, max: number) =>
  z
    .string({ required_error: `Escribe tu ${field}.`, invalid_type_error: `Escribe tu ${field}.` })
    .trim()
    .min(1, `Escribe tu ${field}.`)
    .min(min, `Tu ${field} debe tener al menos ${min} caracteres.`)
    .max(max, `Tu ${field} no puede tener más de ${max} caracteres.`);

export const studentSchema = z.object({
  fullName: trimmed("nombre completo", 3, 120).refine(
    (v) => /^[\p{L}\p{M}' .-]+$/u.test(v),
    "Tu nombre solo puede contener letras, espacios, apóstrofos, puntos y guiones.",
  ),
  age: z.coerce
    .number({ invalid_type_error: "Escribe tu edad con números." })
    .int("Escribe tu edad sin decimales.")
    .min(MIN_AGE, `La edad debe estar entre ${MIN_AGE} y ${MAX_AGE} años.`)
    .max(MAX_AGE, `La edad debe estar entre ${MIN_AGE} y ${MAX_AGE} años.`),
  school: trimmed("escuela", 2, 150),
  email: z
    .string({ required_error: "Escribe tu correo electrónico." })
    .trim()
    .toLowerCase()
    .min(1, "Escribe tu correo electrónico.")
    .max(254, "Tu correo es demasiado largo.")
    .email("Escribe un correo electrónico válido, por ejemplo nombre@correo.com."),
});

export type StudentInput = z.input<typeof studentSchema>;
export type Student = z.output<typeof studentSchema>;

const validIds = new Set(QUESTIONS.map((q) => q.id));

export const answersSchema = z
  .array(
    z.object({
      questionId: z.number().int(),
      value: z.number().int().min(MIN_ANSWER).max(MAX_ANSWER),
    }),
  )
  .length(TOTAL_QUESTIONS, `Debes responder las ${TOTAL_QUESTIONS} preguntas.`)
  .superRefine((answers, ctx) => {
    const seen = new Set<number>();
    for (const a of answers) {
      if (!validIds.has(a.questionId) || seen.has(a.questionId)) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Las respuestas no corresponden al cuestionario." });
        return;
      }
      seen.add(a.questionId);
    }
  });

export type Answer = z.infer<typeof answersSchema>[number];

export const submitTestSchema = z.object({
  student: studentSchema,
  answers: answersSchema,
});

export type SubmitTestInput = z.input<typeof submitTestSchema>;

/** Valida un solo campo del formulario y devuelve el mensaje de error, si lo hay. */
export type StudentErrors = Partial<Record<keyof StudentInput, string>>;

export function validateStudent(
  input: Partial<Record<keyof StudentInput, unknown>>,
): { success: true; data: Student; errors: StudentErrors } | { success: false; errors: StudentErrors } {
  const result = studentSchema.safeParse(input);
  if (result.success) return { success: true, data: result.data, errors: {} };
  const errors: StudentErrors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0] as keyof StudentInput;
    if (!errors[key]) errors[key] = issue.message;
  }
  return { success: false, errors };
}
