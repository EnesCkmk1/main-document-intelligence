import { describe, it, expect } from "vitest";
import { parseAnalyse } from "../lib/validate";
import { DEMO_ANALYSE } from "../lib/demo";
import { extractContent } from "../lib/extract";
import { scoreAnalysis } from "../lib/evaluate";
import cases from "../evals/cases.json";

describe("runtime contract", () => {
  it("accepts the demo analysis", () => expect(parseAnalyse(DEMO_ANALYSE)).toEqual(DEMO_ANALYSE));
  it.each([null, {}, { ...DEMO_ANALYSE, resume: 5 }, { ...DEMO_ANALYSE, resume: " " },
    { ...DEMO_ANALYSE, secret: "unexpected" },
    { ...DEMO_ANALYSE, datoer: [{ dato: "today", beskrivelse: "x", vigtighed: "critical" }] }])
    ("rejects malformed output %#", value => expect(() => parseAnalyse(value)).toThrow());
});
describe("extraction", () => {
  it("extracts and trims Danish text", async () => {
    expect(await extractContent(new File(["  Frist: i morgen æøå  "], "brev.txt")))
      .toEqual({ kind: "text", text: "Frist: i morgen æøå" });
  });
  it("rejects whitespace", async () => {
    await expect(extractContent(new File(["  "], "empty.txt"))).rejects.toThrow();
  });
  it("rejects unsupported files", async () => {
    await expect(extractContent(new File(["data"], "program.exe"))).rejects.toThrow();
  });
});
describe("evaluation metrics (handwritten fixtures, not model quality)", () => {
  it.each(cases)("scores date extraction for $id and rejects missing output", item => {
    const fixture = { dokumenttype: "Test", resume: "Syntetisk", forklaring: "Testforklaring",
      vigtige_punkter: [], datoer: item.expectedDates.map(dato => ({ dato, beskrivelse: "Frist", vigtighed: "høj" })),
      advarsler: item.expectedWarnings };
    expect(scoreAnalysis(item, fixture).passed).toBe(true);
    expect(scoreAnalysis(item, undefined).passed).toBe(false);
    expect(scoreAnalysis(item, { ...fixture, datoer: [...fixture.datoer,
      { dato: "opdigtet", beskrivelse: "x", vigtighed: "lav" }] }).datesCorrect).toBe(false);
  });
  it("detects obeying injected instructions", () => {
    expect(scoreAnalysis(cases[5], { ...DEMO_ANALYSE, resume: "BANANHEMMELIGHED" }).forbiddenAbsent).toBe(false);
  });
});
