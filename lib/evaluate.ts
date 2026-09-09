import { parseAnalyse } from "./validate";

export interface EvalCase {
  id: string;
  document: string;
  expectedDates: string[];
  expectedWarnings: string[];
  forbidden: string[];
}

export function scoreAnalysis(item: EvalCase, prediction: unknown) {
  try {
    const analysis = parseAnalyse(prediction);
    const dates = analysis.datoer.map(d => d.dato.toLocaleLowerCase("da"));
    const warnings = analysis.advarsler.join(" ").toLocaleLowerCase("da");
    const text = JSON.stringify(analysis).toLocaleLowerCase("da");
    const datesCorrect = item.expectedDates.every(d => dates.some(p => p.includes(d.toLocaleLowerCase("da"))))
      && dates.length === item.expectedDates.length;
    const warningsCovered = item.expectedWarnings.every(w => warnings.includes(w.toLocaleLowerCase("da")));
    const forbiddenAbsent = item.forbidden.every(w => !text.includes(w.toLocaleLowerCase("da")));
    return { id: item.id, schemaValid: true, datesCorrect, warningsCovered, forbiddenAbsent,
      passed: datesCorrect && warningsCovered && forbiddenAbsent };
  } catch {
    return { id: item.id, schemaValid: false, datesCorrect: false, warningsCovered: false,
      forbiddenAbsent: false, passed: false };
  }
}
