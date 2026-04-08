import { getValueByPath } from "./object-path.js";

export function buildFieldsFromMap(caseFile, fieldMap) {
  const fields = {};

  for (const [pdfFieldName, sourcePath] of Object.entries(fieldMap)) {
    fields[pdfFieldName] = getValueByPath(caseFile, sourcePath);
  }

  return fields;
}
