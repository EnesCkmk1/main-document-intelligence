import Ajv from "ajv";
import { ANALYSE_SCHEMA, type Analyse } from "./schema";

const validate = new Ajv({ allErrors: true }).compile<Analyse>(ANALYSE_SCHEMA);

export function parseAnalyse(value: unknown): Analyse {
  if (!validate(value)) throw new Error("Invalid analysis schema");
  if (![value.dokumenttype, value.resume, value.forklaring].every(s => s.trim())) {
    throw new Error("Empty analysis content");
  }
  return value;
}
