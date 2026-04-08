export function validateTemplateRecord(record) {
  const errors = [];

  if (!record.id) errors.push("Template id is required.");
  if (!record.state) errors.push("State is required.");
  if (!record.filingType) errors.push("Filing type is required.");
  if (!record.path) errors.push("PDF path is required.");
  if (!record.fieldMapId) errors.push("Field map id is required.");
  if (typeof record.active !== "boolean") errors.push("Active must be true or false.");
  if (typeof record.priority !== "number") errors.push("Priority must be a number.");

  return {
    valid: errors.length === 0,
    errors
  };
}
