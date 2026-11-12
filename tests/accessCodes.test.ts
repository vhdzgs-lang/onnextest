import { describe, expect, it, vi } from "vitest";
import { TRPCError } from "@trpc/server";
import { formatCode, isWellFormedCode, normalizeCode } from "@shared/accessCode";
import { MemoryAccessCodeStore, randomCode } from "../server/db/accessCodes";
import { MemorySubmissionStore, type SubmissionStore } from "../server/db/store";
import { appRouter } from "../server/routers";
import type { Deps } from "../server/trpc";
import { student, uniformAnswers } from "./helpers";

function setup(overrides: Partial<Deps> = {}, adminKey?: string) {
  const store = new MemorySubmissionStore();
  const codes = new MemoryAccessCodeStore();
  const deps: Deps = {
    store,
    codes,
    generatePdf: vi.fn().mockResolvedValue(Buffer.from("%PDF-")),
    sendEmail: vi.fn().mockResolvedValue({ id: "e" }),
    now: () => new Date("2026-11-12T12:00:00Z"),
    adminPassword: "clave-secreta-larga",
    ...overrides,
  };
  return { deps, store, codes, caller: appRouter.createCaller({ deps, adminKey }) };
}

describe("formato del código", () => {
  it("acepta minúsculas, espacios, guiones y el prefijo ONX", () => {
    expect(normalizeCode("onx-ab3d 7kpq")).toBe("AB3D7KPQ");
    expect(normalizeCode("AB3D-7KPQ")).toBe("AB3D7KPQ");
    expect(formatCode("ab3d7kpq")).toBe("ONX-AB3D-7KPQ");
    expect(isWellFormedCode("ONX-AB3D-7KPQ")).toBe(true);
    expect(isWellFormedCode("ONX-AB3D-7KP")).toBe(false);
    expect(isWellFormedCode("ONX-AB0D-7KPQ")).toBe(false); // el 0 no se usa
  });

  it("genera códigos válidos y distintos", () => {
    const set = new Set(Array.from({ length: 500 }, randomCode));
    expect(set.size).toBe(500);
    for (const c of set) expect(isWellFormedCode(c)).toBe(true);
  });
});

describe("panel de administración", () => {
  it("rechaza sin contraseña o con contraseña incorrecta", async () => {
    await expect(setup().caller.admin.codes()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(setup({}, "otra").caller.admin.codes()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("queda desactivado si no hay ADMIN_PASSWORD", async () => {
    await expect(setup({ adminPassword: "" }, "").caller.admin.login()).rejects.toMatchObject({ code: "PRECONDITION_FAILED" });
  });

  it("genera, lista y borra códigos sin usar", async () => {
    const { caller, codes } = setup({}, "clave-secreta-larga");
    const created = await caller.admin.createCodes({ quantity: 3, note: "Juan · 833 000 0000" });
    expect(created).toHaveLength(3);
    for (const c of created) expect(c.code).toMatch(/^ONX-[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    expect(codes.rows.every((r) => r.note === "Juan · 833 000 0000")).toBe(true);
    expect(await caller.admin.codes()).toHaveLength(3);
    await caller.admin.removeCode({ code: created[0]!.code });
    expect(await caller.admin.codes()).toHaveLength(2);
  });

  it("no deja borrar un código ya usado", async () => {
    const { caller, codes } = setup({}, "clave-secreta-larga");
    const [c] = await caller.admin.createCodes({ quantity: 1 });
    await codes.redeem(normalizeCode(c!.code), { name: "Ana", email: "a@b.com" });
    await expect(caller.admin.removeCode({ code: c!.code })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});

describe("código al hacer el test", () => {
  const input = (accessCode: string) => ({ student, answers: uniformAnswers(3), accessCode });

  it("access.check distingue disponible, usado e inexistente", async () => {
    const { caller, codes } = setup();
    await codes.create(["AB3D7KPQ", "XYZW2345"], null);
    await codes.redeem("XYZW2345", { name: "x", email: "x@x.com" });
    expect(await caller.access.check({ code: "onx-ab3d-7kpq" })).toEqual({ ok: true, code: "ONX-AB3D-7KPQ" });
    expect(await caller.access.check({ code: "ONX-XYZW-2345" })).toMatchObject({ ok: false, message: expect.stringMatching(/ya fue usado/) });
    expect(await caller.access.check({ code: "ONX-HHHH-HHHH" })).toMatchObject({ ok: false, message: expect.stringMatching(/no existe/) });
    expect(await caller.access.check({ code: "hola" })).toMatchObject({ ok: false });
  });

  it("un código sirve para un solo test", async () => {
    const { caller, codes, store } = setup();
    await codes.create(["AB3D7KPQ"], null);
    await caller.test.submit(input("ONX-AB3D-7KPQ"));
    expect(codes.rows[0]).toMatchObject({ redeemedByName: student.fullName, redeemedByEmail: student.email, submissionId: 1 });
    const err = await caller.test.submit(input("ONX-AB3D-7KPQ")).catch((e) => e);
    expect(err).toBeInstanceOf(TRPCError);
    expect(err.code).toBe("FORBIDDEN");
    expect(err.message).toMatch(/ya fue usado/);
    expect(store.rows).toHaveLength(1);
  });

  it("rechaza un código inexistente sin guardar ni enviar nada", async () => {
    const { caller, deps, store } = setup();
    await expect(caller.test.submit(input("ONX-HHHH-HHHH"))).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(store.rows).toHaveLength(0);
    expect(deps.sendEmail).not.toHaveBeenCalled();
  });

  it("si falla la base al guardar, el código vuelve a quedar disponible", async () => {
    const failing: SubmissionStore = {
      saveSubmission: vi.fn().mockRejectedValue(new Error("db caída")),
      saveEvaluation: vi.fn(),
      updateDelivery: vi.fn(),
    };
    const { caller, codes } = setup({ store: failing });
    await codes.create(["AB3D7KPQ"], null);
    await expect(caller.test.submit(input("ONX-AB3D-7KPQ"))).rejects.toMatchObject({ code: "INTERNAL_SERVER_ERROR" });
    expect(await codes.status("AB3D7KPQ")).toBe("available");
  });

  it("dos envíos al mismo tiempo con el mismo código: solo uno pasa", async () => {
    const { caller, codes, store } = setup();
    await codes.create(["AB3D7KPQ"], null);
    const results = await Promise.allSettled([caller.test.submit(input("ONX-AB3D-7KPQ")), caller.test.submit(input("ONX-AB3D-7KPQ"))]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(store.rows).toHaveLength(1);
  });
});
