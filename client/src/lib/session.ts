import type { StudentInput } from "@shared/validation";

/**
 * Guardado temporal durante la sesión del navegador. Se borra al terminar el test
 * o al cerrar la pestaña, así que nunca quedan respuestas en el dispositivo.
 */
const KEYS = { student: "onnex.student", answers: "onnex.answers", index: "onnex.index", done: "onnex.done" } as const;

function read<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown) {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Modo privado o almacenamiento lleno: el test sigue funcionando en memoria.
  }
}

export const session = {
  getStudent: () => read<StudentInput>(KEYS.student),
  setStudent: (s: StudentInput) => write(KEYS.student, s),
  getAnswers: () => read<Record<number, number>>(KEYS.answers) ?? {},
  setAnswers: (a: Record<number, number>) => write(KEYS.answers, a),
  getIndex: () => read<number>(KEYS.index) ?? 0,
  setIndex: (i: number) => write(KEYS.index, i),
  markDone: () => write(KEYS.done, true),
  isDone: () => read<boolean>(KEYS.done) === true,
  /** Borra los datos del test (se llama al enviarlo). */
  clearTest: () => {
    try {
      sessionStorage.removeItem(KEYS.student);
      sessionStorage.removeItem(KEYS.answers);
      sessionStorage.removeItem(KEYS.index);
    } catch {
      /* sin almacenamiento */
    }
  },
  clearAll: () => {
    try {
      Object.values(KEYS).forEach((k) => sessionStorage.removeItem(k));
    } catch {
      /* sin almacenamiento */
    }
  },
};
