function normalize(value) {
  return String(value || "").trim().toLowerCase();
}

function matchesAll(template, caseFile) {
  return (
    normalize(template.state) === normalize(caseFile.state) &&
    normalize(template.filingType) === normalize(caseFile.filingType) &&
    normalize(template.county) === normalize(caseFile.county) &&
    (!template.court || normalize(template.court) === normalize(caseFile.court))
  );
}

function matchesStateFiling(template, caseFile) {
  return (
    normalize(template.state) === normalize(caseFile.state) &&
    normalize(template.filingType) === normalize(caseFile.filingType)
  );
}

function templateMatches(template, caseFile) {
  if (!template.active) return false;

  switch (template.matchMode) {
    case "all":
      return matchesAll(template, caseFile);
    case "state_filing":
      return matchesStateFiling(template, caseFile);
    default:
      return false;
  }
}

export function findBestTemplate(caseFile, templates = []) {
  const matches = templates
    .filter((template) => templateMatches(template, caseFile))
    .sort((a, b) => (b.priority || 0) - (a.priority || 0));

  if (!matches.length) {
    return null;
  }

  return matches[0];
}
