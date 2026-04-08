import { resolveTemplateFromRegistry } from "../../core/template-registry.js";

export function resolveTemplate(caseFile) {
  if (caseFile.state !== "OH") {
    throw new Error("Wrong state sent to Ohio template resolver.");
  }

  return resolveTemplateFromRegistry(caseFile);
}
