import { validateCase } from "./rules.js";
import { calculateEligibility } from "./eligibility.js";
import { resolveTemplate } from "./templates.js";
import { mapCaseToTemplateFields } from "./mappers.js";
import { listCounties, listCourts } from "./counties.js";
import { getChargeOptions } from "./forms.js";

export const OH_MODULE = {
  code: "OH",
  name: "Ohio",
  supportedFilingTypes: ["sealing", "expungement"],
  validateCase,
  calculateEligibility,
  resolveTemplate,
  mapCaseToTemplateFields,
  listCounties,
  listCourts,
  getChargeOptions
};
