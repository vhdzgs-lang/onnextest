import { QUESTIONS } from "@shared/questions";
import type { Answer, Student } from "@shared/validation";

export const student: Student = {
  fullName: "Ana Sofía Ramírez Treviño",
  age: 17,
  school: "Preparatoria Onnex Tampico",
  email: "ana.sofia@example.com",
};

/** Respuestas con 5 en las preguntas indicadas y `rest` en las demás. */
export function answersWith(high: number[], rest = 2): Answer[] {
  return QUESTIONS.map((q) => ({ questionId: q.id, value: high.includes(q.id) ? 5 : rest }));
}

export function uniformAnswers(value: number): Answer[] {
  return QUESTIONS.map((q) => ({ questionId: q.id, value }));
}

/** Preguntas cuya dimensión principal (primer peso) es la indicada. */
export function idsFor(dimension: string): number[] {
  return QUESTIONS.filter((q) => Object.keys(q.weights)[0] === dimension).map((q) => q.id);
}
