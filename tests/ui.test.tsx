// @vitest-environment jsdom
import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen, cleanup, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Router } from "wouter";
import { memoryLocation } from "wouter/memory-location";
import Register from "@/pages/Register";
import Done, { CONFIRMATION_MESSAGE } from "@/pages/Done";
import { Logo } from "@/components/Logo";
import { session } from "@/lib/session";
import { STUDENT_CONFIRMATION } from "../server/routers";

const checkAccessCode = vi.fn();
vi.mock("@/lib/trpc", () => ({ checkAccessCode: (code: string) => checkAccessCode(code) }));

beforeEach(() => {
  checkAccessCode.mockReset();
  cleanup();
  sessionStorage.clear();
});

function renderAt(path: string, ui: React.ReactNode) {
  const loc = memoryLocation({ path, record: true });
  render(<Router hook={loc.hook}>{ui}</Router>);
  return loc;
}

describe("logo", () => {
  it("muestra 'Onnex Test' en una sola línea junto al icono", () => {
    render(<Logo />);
    const logo = screen.getByRole("img", { name: "Onnex Test" });
    expect(logo.className).toContain("whitespace-nowrap");
    expect(logo.className).toContain("inline-flex");
    expect(logo.querySelector("svg")).not.toBeNull();
    const text = within(logo).getByText("Onnex Test");
    expect(text.className).toContain("whitespace-nowrap");
    expect(text.className).toContain("text-ink");
    expect(text.textContent).not.toContain("\n");
  });
});

describe("registro del estudiante", () => {
  it("muestra errores y no avanza con datos inválidos", async () => {
    const loc = renderAt("/registro", <Register />);
    await userEvent.click(screen.getByRole("button", { name: /comenzar test/i }));
    expect(screen.getAllByRole("alert").length).toBe(5);
    expect(screen.getByText("Escribe tu código de acceso.")).toBeInTheDocument();
    await userEvent.type(screen.getByLabelText("Correo electrónico"), "ana@");
    await userEvent.type(screen.getByLabelText("Edad"), "9");
    await userEvent.click(screen.getByRole("button", { name: /comenzar test/i }));
    expect(screen.getByText(/correo electrónico válido/)).toBeInTheDocument();
    expect(screen.getByText(/edad debe estar entre/)).toBeInTheDocument();
    expect(loc.history).toEqual(["/registro"]);
  });

  it("no avanza si el código ya fue usado", async () => {
    checkAccessCode.mockResolvedValue({ ok: false, message: "Ese código ya fue usado. Cada código sirve para un solo test." });
    const loc = renderAt("/registro", <Register />);
    await userEvent.type(screen.getByLabelText(/Código de acceso/), "onx-ab3d-7kpq");
    await userEvent.type(screen.getByLabelText("Nombre completo"), "Ana Sofía Ramírez");
    await userEvent.type(screen.getByLabelText("Edad"), "17");
    await userEvent.type(screen.getByLabelText("Escuela"), "Prepa Tampico");
    await userEvent.type(screen.getByLabelText("Correo electrónico"), "ana@example.com");
    await userEvent.click(screen.getByRole("button", { name: /comenzar test/i }));
    expect(await screen.findByText(/ya fue usado/)).toBeInTheDocument();
    expect(loc.history).toEqual(["/registro"]);
  });

  it("guarda los datos en la sesión y pasa al cuestionario", async () => {
    checkAccessCode.mockResolvedValue({ ok: true, code: "ONX-AB3D-7KPQ" });
    const loc = renderAt("/registro", <Register />);
    await userEvent.type(screen.getByLabelText(/Código de acceso/), "onx-ab3d-7kpq");
    await userEvent.type(screen.getByLabelText("Nombre completo"), "Ana Sofía Ramírez");
    await userEvent.type(screen.getByLabelText("Edad"), "17");
    await userEvent.type(screen.getByLabelText("Escuela"), "Prepa Tampico");
    await userEvent.type(screen.getByLabelText("Correo electrónico"), "ana@example.com");
    await userEvent.click(screen.getByRole("button", { name: /comenzar test/i }));
    await vi.waitFor(() => expect(loc.history.at(-1)).toBe("/test"));
    expect(checkAccessCode).toHaveBeenCalledWith("ONX-AB3D-7KPQ");
    expect(session.getAccessCode()).toBe("ONX-AB3D-7KPQ");
    expect(session.getStudent()).toMatchObject({ fullName: "Ana Sofía Ramírez", age: 17, email: "ana@example.com" });
  });
});

describe("confirmación", () => {
  it("muestra solo el mensaje de confirmación, sin resultados", () => {
    session.markDone();
    renderAt("/listo", <Done />);
    expect(screen.getByTestId("confirmation")).toHaveTextContent(CONFIRMATION_MESSAGE);
    expect(CONFIRMATION_MESSAGE).toBe(STUDENT_CONFIRMATION);
    expect(document.body.textContent).not.toMatch(/carrera recomendada|puntuación|compatibilidad/i);
  });

  it("sin haber terminado el test, regresa al inicio", () => {
    const loc = renderAt("/listo", <Done />);
    expect(loc.history.at(-1)).toBe("/");
  });
});
