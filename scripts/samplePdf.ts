/** Genera un PDF de ejemplo en output/ para revisar el diseño: npm run sample-pdf */
import fs from "node:fs";
import { evaluate } from "@shared/evaluation";
import { QUESTIONS } from "@shared/questions";
import { buildPdfFilename, generatePdf } from "../server/pdfGenerator";

const profile = process.argv[2] ?? "tec";
const high: Record<string, number[]> = {
  tec: [9, 10, 11, 12, 33, 34, 39, 40, 31, 32, 43, 44, 49, 7],
  salud: [1, 2, 3, 5, 6, 7, 8, 47, 41, 42, 37, 39],
  arte: [13, 14, 15, 16, 31, 32, 35, 36, 45, 49, 22],
};
const answers = QUESTIONS.map((q) => ({
  questionId: q.id,
  value: high[profile]?.includes(q.id) ? 5 : ((q.id * 7) % 3) + 2,
}));
const report = evaluate(
  { fullName: "María José Hernández López", age: 17, school: "Preparatoria Federal Lázaro Cárdenas", email: "mariajose@example.com" },
  answers,
);
const pdf = await generatePdf(report);
fs.mkdirSync("output", { recursive: true });
const file = `output/${buildPdfFilename(report.student.fullName)}`;
fs.writeFileSync(file, pdf);
fs.writeFileSync("output/sample.html", (await import("../server/reportTemplate")).renderReportHtml(report));
console.log(file, pdf.length, report.careers.map((c) => `${c.career.name} ${c.match}`));
