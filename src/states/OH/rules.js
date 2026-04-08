import { validateCommonCase } from "../../core/validation.js";

export function validateCase(caseFile) {
  const base = validateCommonCase(caseFile);
  const errors = [...base.errors];

  if (caseFile.state !== "OH") {
    errors.push("Ohio validator received a non-Ohio case.");
  }

  if (!caseFile.county) {
    errors.push("Ohio county is required.");
  }

  if (!caseFile.court) {
    errors.push("Ohio court is required.");
  }

  if (!caseFile.filingType) {
    errors.push("Ohio filing type is required.");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
