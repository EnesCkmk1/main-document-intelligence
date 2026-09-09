import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import cases from "../evals/cases.json";
import { scoreAnalysis } from "../lib/evaluate";

const input = process.argv[2];
if (!input) throw new Error("Usage: npm run eval -- path/to/predictions.json (object keyed by case ID)");
const predictions = JSON.parse(readFileSync(input, "utf8"));
if (!predictions || typeof predictions !== "object" || Array.isArray(predictions)) {
  throw new Error("Predictions must be an object keyed by case ID");
}
const results = cases.map(item => scoreAnalysis(item, predictions[item.id]));
const report = { mode: "offline-predictions", cases: results.length,
  passed: results.filter(r => r.passed).length, results };
mkdirSync("reports", { recursive: true });
writeFileSync("reports/evaluation.json", JSON.stringify(report, null, 2) + "\n");
console.log(JSON.stringify(report, null, 2));
if (results.some(r => !r.passed)) process.exitCode = 1;
