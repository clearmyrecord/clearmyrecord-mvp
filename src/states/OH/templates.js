export function resolveTemplate(caseFile) {
  if (caseFile.state !== "OH") {
    throw new Error("Wrong state sent to Ohio template resolver.");
  }

  const county = String(caseFile.county || "").trim().toLowerCase();
  const filingType = String(caseFile.filingType || "sealing").trim().toLowerCase();

  if (county === "wood" && filingType === "sealing") {
    return {
      id: "oh-wood-sealing",
      path: "/assets/oh/wood/sealing-conviction.pdf",
      version: "1.0"
    };
  }

  return {
    id: "oh-generic-sealing",
    path: "/assets/oh/generic/sealing.pdf",
    version: "1.0"
  };
}
