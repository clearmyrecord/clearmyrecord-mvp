export function mapCaseToTemplateFields(caseFile) {
  const charge = caseFile.charges?.[0] || {};

  return {
    full_name: caseFile.person.fullName || "",
    address_1: caseFile.person.address1 || "",
    address_2: caseFile.person.address2 || "",
    city: caseFile.person.city || "",
    state: caseFile.person.state || "",
    zip: caseFile.person.zip || "",
    county: caseFile.county || "",
    court_name: caseFile.court || "",
    case_number: caseFile.caseNumber || "",
    charge_1_name: charge.chargeName || "",
    charge_1_statute: charge.statute || "",
    charge_1_level: charge.level || "",
    charge_1_disposition: charge.disposition || "",
    conviction_date: charge.convictionDate || "",
    sentence_completed_date:
      charge.probationCompletedDate || charge.jailCompletedDate || ""
  };
}
