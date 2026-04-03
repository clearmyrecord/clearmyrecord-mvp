function calculateEligibility(record) {
  const rule = sealingRules?.[record.state]?.[record.category]?.[record.level];

  if (!rule || !rule.eligible) {
    return { eligible: false, reason: "Not eligible under current rules." };
  }

  if (record.openCases === true) {
    return { eligible: false, reason: "Open cases must be resolved first." };
  }

  if (record.finesPaid === false) {
    return { eligible: false, reason: "Fines must be paid first." };
  }

  const baseDate = new Date(record.date);
  const eligibilityDate = new Date(baseDate);

  if (rule.unit === "years") {
    eligibilityDate.setFullYear(eligibilityDate.getFullYear() + rule.wait);
  }

  if (rule.unit === "months") {
    eligibilityDate.setMonth(eligibilityDate.getMonth() + rule.wait);
  }

  const today = new Date();

  return {
    eligible: eligibilityDate <= today,
    eligibilityDate: eligibilityDate.toISOString().split("T")[0]
  };
}
