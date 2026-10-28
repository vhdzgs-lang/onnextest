import { describe, expect, it } from "vitest";
import { answersSchema, studentSchema, submitTestSchema, validateStudent } from "@shared/validation";
import { student, uniformAnswers } from "./helpers";

describe("validación de datos del estudiante", () => {
  it("acepta datos correctos y normaliza el correo", () => {
    const r = studentSchema.parse({ ...student, email: "  Ana.Sofia@Example.COM ", age: "17" });
    expect(r.email).toBe("ana.sofia@example.com");
    expect(r.age).toBe(17);
  });

  it("rechaza nombre vacío", () => {
    const r = validateStudent({ ...student, fullName: "   " });
    expect(r.success).toBe(false);
    expect(r.errors.fullName).toMatch(/nombre/i);
  });

  it("rechaza nombres con caracteres no válidos", () => {
    expect(validateStudent({ ...student, fullName: "<script>alert(1)</script>" }).success).toBe(false);
  });

  it.each([["abc"], [11], [26], [16.5], [""], [undefined]])("rechaza la edad %s", (age) => {
    const r = validateStudent({ ...student, age });
    expect(r.success).toBe(false);
    expect(r.errors.age).toBeDefined();
  });

  it("rechaza escuela vacía", () => {
    expect(validateStudent({ ...student, school: "" }).errors.school).toBeDefined();
  });

  it.each(["", "ana", "ana@", "ana@correo", "ana correo@x.com"])("rechaza el correo %j", (email) => {
    expect(validateStudent({ ...student, email }).errors.email).toBeDefined();
  });

  it("exige exactamente 50 respuestas válidas y sin repetir", () => {
    expect(answersSchema.safeParse(uniformAnswers(3)).success).toBe(true);
    expect(answersSchema.safeParse(uniformAnswers(3).slice(0, 49)).success).toBe(false);
    const dup = uniformAnswers(3);
    dup[1] = { questionId: 1, value: 3 };
    expect(answersSchema.safeParse(dup).success).toBe(false);
    const outOfRange = uniformAnswers(3);
    outOfRange[0] = { questionId: 1, value: 6 };
    expect(answersSchema.safeParse(outOfRange).success).toBe(false);
  });

  it("valida la solicitud completa", () => {
    expect(submitTestSchema.safeParse({ student, answers: uniformAnswers(4) }).success).toBe(true);
  });
});
