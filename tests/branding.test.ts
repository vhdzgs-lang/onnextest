import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const SCAN = ["client", "server", "shared", "marketing", "scripts", "README.md", "mobile"];
const SKIP = new Set(["node_modules", "dist", "output", ".expo"]);
// Se construyen por partes para que este archivo no se detecte a sí mismo.
const FORBIDDEN = [["Voca", "Test"], ["Instituto ", "Gasca"], ["Decisiones que definen ", "tu futuro"]].map((p) => p.join(""));

function files(p: string): string[] {
  if (!fs.existsSync(p)) return [];
  const stat = fs.statSync(p);
  if (stat.isFile()) return [p];
  return fs.readdirSync(p).filter((n) => !SKIP.has(n)).flatMap((n) => files(path.join(p, n)));
}

describe("branding", () => {
  it("no quedan referencias a la marca anterior", () => {
    const hits: string[] = [];
    for (const file of SCAN.flatMap((s) => files(path.join(root, s)))) {
      if (/\.(png|jpg|ico|webp)$/.test(file)) continue;
      const content = fs.readFileSync(file, "utf8");
      for (const word of FORBIDDEN) if (content.toLowerCase().includes(word.toLowerCase())) hits.push(`${path.relative(root, file)}: ${word}`);
    }
    expect(hits).toEqual([]);
  });

  it("el título de la página usa Onnex Test", () => {
    const html = fs.readFileSync(path.join(root, "client/index.html"), "utf8");
    expect(html).toMatch(/<title>Onnex Test/);
  });
});
