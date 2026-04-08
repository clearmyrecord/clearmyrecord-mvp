import { getStateModule } from "./state-registry.js";
import { assertCaseIntegrity } from "./integrity.js";

export function processCase(caseFile) {
  const stateModule = getStateModule(caseFile.state);

  const validation = stateModule.validateCase(caseFile);
  if (!validation.valid) {
    return {
      ok: false,
      stage: "validation",
      errors: validation.errors
    };
  }

  const eligibility = stateModule.calculateEligibility(caseFile);
  const template = stateModule.resolveTemplate(caseFile);
  const integrity = assertCaseIntegrity(caseFile, template);

  if (!integrity.valid) {
    return {
      ok: false,
      stage: "integrity",
      errors: integrity.errors,
      validation,
      eligibility,
      template
    };
  }

  return {
    ok: true,
    validation,
    eligibility,
    template
  };
}
