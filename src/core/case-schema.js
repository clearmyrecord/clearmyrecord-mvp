export const emptyCharge = () => ({
  id: crypto.randomUUID(),
  chargeName: "",
  statute: "",
  level: "",
  disposition: "",
  arrestDate: "",
  convictionDate: "",
  sentencingDate: "",
  probationCompletedDate: "",
  jailCompletedDate: "",
  finePaid: null,
  restitutionPaid: null,
  victimInvolved: null,
  dismissed: false,
  sealedBefore: false
});

export const emptyCaseFile = () => ({
  id: crypto.randomUUID(),
  state: "",
  county: "",
  court: "",
  caseNumber: "",
  filingType: "sealing",

  person: {
    firstName: "",
    lastName: "",
    fullName: "",
    email: "",
    phone: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    zip: "",
    dob: ""
  },

  charges: [emptyCharge()],

  workflow: {
    status: "draft",
    eligibilityStatus: "unknown",
    eligibilityReason: "",
    reviewMode: "automatic",
    estimatedEligibleDate: "",
    packetReady: false
  },

  packet: {
    templateId: "",
    templatePath: "",
    outputFileName: "",
    signatureMode: "typed"
  },

  meta: {
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    source: "manual"
  }
});

export function createNewCase(selectedState = "") {
  const caseFile = emptyCaseFile();
  caseFile.state = selectedState;
  return caseFile;
}

export function touchCase(caseFile) {
  return {
    ...caseFile,
    meta: {
      ...caseFile.meta,
      updatedAt: new Date().toISOString()
    }
  };
}
