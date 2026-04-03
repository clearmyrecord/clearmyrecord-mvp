function getSealingRule(offense) {
  return sealingRules?.[offense.state]?.[offense.outcome]?.[offense.category]?.[offense.level] || null;
}

function addWaitToDate(baseDate, wait, unit) {
  const result = new Date(baseDate);

  if (unit === "years") {
    result.setFullYear(result.getFullYear() + wait);
  } else if (unit === "months") {
    result.setMonth(result.getMonth() + wait);
  } else if (unit === "days") {
    result.setDate(result.getDate() + wait);
  }

  return result;
}

function formatDate(date) {
  return date.toISOString().split("T")[0];
}

function evaluateAllOffenses(offenses) {
  if (!offenses.length) {
    return {
      eligible: false,
      reason: "No offenses entered.",
      offenseResults: []
    };
  }

  let latestEligibilityDate = null;
  const today = new Date();
  const offenseResults = [];

  for (const offense of offenses) {
    if (!offense.category) {
      return {
        eligible: false,
        reason: "Every offense must include an offense category.",
        offenseResults
      };
    }

    if (!offense.level) {
      return {
        eligible: false,
        reason: "Every offense must include an offense level.",
        offenseResults
      };
    }

    if (!offense.outcome) {
      return {
        eligible: false,
        reason: "Every offense must include a case outcome.",
        offenseResults
      };
    }

    if (!offense.date) {
      return {
        eligible: false,
        reason: "Every offense must include a final disposition date.",
        offenseResults
      };
    }

    if (offense.outcome === "conviction" && offense.openCases) {
      return {
        eligible: false,
        reason: "Open cases must be resolved before sealing a conviction.",
        offenseResults
      };
    }

    if (offense.outcome === "conviction" && !offense.finesPaid) {
      return {
        eligible: false,
        reason: "Fines must be paid before sealing a conviction.",
        offenseResults
      };
    }

    const rule = getSealingRule(offense);

    if (!rule) {
      return {
        eligible: false,
        reason: `No rule found for ${offense.outcome} ${offense.category} ${offense.level}.`,
        offenseResults
      };
    }

    if (!rule.eligible) {
      return {
        eligible: false,
        reason: `${rule.label || "This offense"} is not eligible under the current rules.`,
        offenseResults
      };
    }

    const baseDate = new Date(offense.date);
    const eligibilityDate = addWaitToDate(baseDate, rule.wait || 0, rule.unit || "days");
    const offenseEligibleNow = eligibilityDate <= today;

    offenseResults.push({
      ...offense,
      label: rule.label || `${offense.outcome} ${offense.category} ${offense.level}`,
      eligibilityDate: formatDate(eligibilityDate),
      eligibleNow: offenseEligibleNow
    });

    if (!latestEligibilityDate || eligibilityDate > latestEligibilityDate) {
      latestEligibilityDate = eligibilityDate;
    }
  }

  return {
    eligible: latestEligibilityDate <= today,
    eligibilityDate: formatDate(latestEligibilityDate),
    offenseResults
  };
}
