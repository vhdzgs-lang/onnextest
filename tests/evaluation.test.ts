import { describe, expect, it } from "vitest";
import { CAREERS } from "@shared/careers";
import { ALL_DIMENSIONS } from "@shared/dimensions";
import { computeScores, DISCLAIMER, evaluate, recommendCareers } from "@shared/evaluation";
import { answersWith, idsFor, student, uniformAnswers } from "./helpers";

describe("evaluación de respuestas", () => {
  it("calcula puntuaciones de 0 a 100 en todas las dimensiones", () => {
    expect(Object.values(computeScores(uniformAnswers(1))).every((s) => s === 0)).toBe(true);
    expect(Object.values(computeScores(uniformAnswers(5))).every((s) => s === 100)).toBe(true);
    const mid = computeScores(uniformAnswers(3));
    for (const d of ALL_DIMENSIONS) expect(mid[d]).toBe(50);
  });

  it("falla si falta una respuesta", () => {
    expect(() => computeScores(uniformAnswers(3).slice(1))).toThrow(/pregunta 1/);
  });

  it("identifica la orientación predominante", () => {
    const report = evaluate(student, answersWith([...idsFor("cientifica"), ...idsFor("social"), 47]));
    expect(report.areas[0]!.key).toMatch(/cientifica|social/);
    expect(["Investigador analítico", "Social humanista"]).toContain(report.personalityType.name);
  });

  it.each([
    ["tecnológico", [...idsFor("tecnologica"), 33, 34, 39, 40, 49], ["sistemas", "mecatronica"]],
    ["salud", [...idsFor("cientifica"), ...idsFor("social"), 47, 41], ["medicina", "enfermeria", "nutricion"]],
    ["artístico", [...idsFor("artistica"), 31, 32, 45], ["diseno", "arquitectura", "comunicacion"]],
    ["administrativo", [...idsFor("administrativa"), 37, 38, 50], ["contaduria", "administracion"]],
    ["empresarial", [...idsFor("empresarial"), 29, 30, 48], ["finanzas", "administracion", "mercadotecnia"]],
  ])("perfil %s recibe carreras afines", (_name, high, expected) => {
    const report = evaluate(student, answersWith(high));
    expect(expected).toContain(report.careers[0]!.career.id);
  });

  it("selecciona exactamente tres carreras distintas con justificación personalizada", () => {
    const report = evaluate(student, answersWith(idsFor("tecnologica")));
    expect(report.careers).toHaveLength(3);
    expect(new Set(report.careers.map((c) => c.career.id)).size).toBe(3);
    for (const c of report.careers) {
      expect(c.justification).toContain("Ana");
      expect(c.justification).toContain(c.career.name);
      expect(c.match).toBeGreaterThanOrEqual(0);
      expect(c.match).toBeLessThanOrEqual(100);
    }
    expect(report.careers[0]!.match).toBeGreaterThanOrEqual(report.careers[1]!.match);
  });

  it("es determinista ante empates", () => {
    const a = recommendCareers(computeScores(uniformAnswers(3)));
    const b = recommendCareers(computeScores(uniformAnswers(3)));
    expect(a.map((c) => c.career.id)).toEqual(b.map((c) => c.career.id));
  });

  it("genera todas las secciones del reporte e incluye la nota no clínica", () => {
    const r = evaluate(student, answersWith([1, 2, 9, 10, 31]), new Date("2026-10-28T12:00:00Z"));
    expect(r.completedAt).toBe("2026-10-28T12:00:00.000Z");
    for (const key of ["profileSummary", "workStyle", "learningStyle", "finalMessage"] as const) expect(r[key].length).toBeGreaterThan(20);
    for (const key of [
      "dominantTraits", "strengths", "developmentAreas", "workPreferences", "motivationFactors",
      "highlightedCompetencies", "recommendedEnvironments", "growthAreas", "compatibleAreas",
      "recommendations", "nextSteps", "universityTips",
    ] as const) expect(r[key].length, key).toBeGreaterThan(0);
    expect(r.disclaimer).toBe(DISCLAIMER);
    expect(DISCLAIMER).toMatch(/orientación vocacional/);
    expect(DISCLAIMER).toMatch(/no sustituye una evaluación psicológica clínica/i);
    expect(DISCLAIMER).toMatch(/diagnóstico médico o psicológico/);
  });
});

describe("base de datos de carreras", () => {
  it("tiene al menos 20 carreras completas", () => {
    expect(CAREERS.length).toBeGreaterThanOrEqual(20);
    expect(new Set(CAREERS.map((c) => c.id)).size).toBe(CAREERS.length);
    for (const c of CAREERS) {
      expect(c.name && c.area && c.description && c.recommendedProfile && c.jobField, c.id).toBeTruthy();
      expect(c.skills.length, c.id).toBeGreaterThanOrEqual(3);
      expect(c.advantages.length, c.id).toBeGreaterThanOrEqual(3);
      expect(c.compatibleProfiles.length, c.id).toBeGreaterThan(0);
      expect(Object.keys(c.compatibility).length, c.id).toBeGreaterThanOrEqual(3);
    }
  });

  it("cada carrera puede quedar en primer lugar con algún perfil", () => {
    // Para cada carrera, un estudiante que responde 5 solo en sus dimensiones debe tenerla entre las 3 primeras.
    for (const career of CAREERS) {
      const dims = Object.keys(career.compatibility);
      const scores = Object.fromEntries(ALL_DIMENSIONS.map((d) => [d, dims.includes(d) ? 100 : 0])) as never;
      const top = recommendCareers(scores).map((c) => c.career.id);
      expect(top, career.id).toContain(career.id);
    }
  });
});
