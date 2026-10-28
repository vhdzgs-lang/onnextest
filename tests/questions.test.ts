import { describe, expect, it } from "vitest";
import { ALL_DIMENSIONS, AREA_KEYS, COMPETENCY_KEYS } from "@shared/dimensions";
import { ANSWER_SCALE, PUBLIC_QUESTIONS, QUESTIONS, TOTAL_QUESTIONS } from "@shared/questions";

describe("cuestionario", () => {
  it("tiene exactamente 50 preguntas con id único y consecutivo", () => {
    expect(QUESTIONS).toHaveLength(50);
    expect(TOTAL_QUESTIONS).toBe(50);
    expect(QUESTIONS.map((q) => q.id)).toEqual(Array.from({ length: 50 }, (_, i) => i + 1));
    expect(new Set(QUESTIONS.map((q) => q.text)).size).toBe(50);
  });

  it("evalúa de forma equilibrada todas las orientaciones y competencias", () => {
    for (const area of AREA_KEYS) {
      expect(QUESTIONS.filter((q) => Object.keys(q.weights)[0] === area), area).toHaveLength(4);
    }
    for (const c of COMPETENCY_KEYS) {
      expect(QUESTIONS.filter((q) => (q.weights[c] ?? 0) >= 1).length, c).toBeGreaterThanOrEqual(2);
    }
    for (const d of ALL_DIMENSIONS) {
      expect(QUESTIONS.some((q) => (q.weights[d] ?? 0) > 0), d).toBe(true);
    }
  });

  it("usa una escala de 5 respuestas", () => {
    expect(ANSWER_SCALE.map((s) => s.label)).toEqual([
      "Totalmente en desacuerdo",
      "En desacuerdo",
      "Neutral",
      "De acuerdo",
      "Totalmente de acuerdo",
    ]);
  });

  it("la versión pública no expone los pesos de evaluación", () => {
    expect(PUBLIC_QUESTIONS).toHaveLength(50);
    for (const q of PUBLIC_QUESTIONS) expect(q).not.toHaveProperty("weights");
  });
});
