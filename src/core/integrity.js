export function detectStateFromCourtName(courtName = "") {
  const value = String(courtName).toLowerCase();

  if (
    value.includes("common pleas") ||
    value.includes("municipal court") ||
    value.includes("county court") ||
    value.includes("ohio")
  ) {
    return "OH";
  }

  if (
    value.includes("justice court") ||
    value.includes("district court") ||
    value.includes("las vegas") ||
    value.includes("henderson") ||
    value.includes("reno") ||
    value.includes("nevada")
  ) {
    return "NV";
  }

  return "";
}

export function detectStateFromTemplatePath(path = "") {
  const value = String(path).toLowerCase();

  if (value.includes("/oh/")) return "OH";
  if (value.includes("/nv/")) return "NV";

  return "";
}

export function assertCaseIntegrity(caseFile, template = null) {
  const errors = [];

  const courtState = detectStateFromCourtName(caseFile.court);
  if (courtState && courtState !== caseFile.state) {
    errors.push(
      `Court appears to belong to ${courtState}, but case state is ${caseFile.state}.`
    );
  }

  if (template?.path) {
    const templateState = detectStateFromTemplatePath(template.path);
    if (templateState && templateState !== caseFile.state) {
      errors.push(
        `Template appears to belong to ${templateState}, but case state is ${caseFile.state}.`
      );
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
