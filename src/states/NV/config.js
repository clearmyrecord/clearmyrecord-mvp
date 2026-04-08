import { validateCase } from "./rules.js";
import { calculateEligibility } from "./eligibility.js";
import { resolveTemplate } from "./templates.js";
import { mapCaseToTemplateFields } from "./mappers.js";
import { listCounties, listCourts } from "./counties.js";
import { getChargeOptions } from "./forms.js";

export const NV_MODULE = {
  code: "NV",
  name: "Nevada",
  supportedFilingTypes: ["sealing"],
  validateCase,
  calculateEligibility,
  resolveTemplate,
  mapCaseToTemplateFields,
  listCounties,
  listCourts,
  getChargeOptions
};
