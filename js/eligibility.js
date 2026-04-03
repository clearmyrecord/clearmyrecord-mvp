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

function levelRank(level) {
  const ranks = {
    F1: 5,
    F2: 4,
    F3: 3,
    F4: 2,
    F5: 1,
    M1: 5,
    M2: 4,
    M3: 3,
    M4: 2,
    MM: 1
  };

  return ranks[level] || 0;
}

function summarizeOhioConvictions(offenses, applyClumping) {
  const convictions = offenses.filter((offense) => offense.outcome === "conviction");

  const totalConvictionsRaw = convictions.length;
  const misdemeanorConvictionsRaw = convictions.filter((o) => o.category === "misdemeanor").length;
  const felonyConvictionsRaw = convictions.filter((o) => o.category === "felony").length;
  const f3ConvictionsRaw = convictions.filter((o) => o.level === "F3").length;

  let totalConvictions = totalConvictionsRaw;
  let misdemeanorConvictions = misdemeanorConvictionsRaw;
  let felonyConvictions = felonyConvictionsRaw;
  let f3Convictions = f3ConvictionsRaw;

  if (applyClumping) {
    const clumpedCount = convictions.filter((o) => o.clumpGroup).reduce((map, offense) => {
      map[offense.clumpGroup] = true;
      return map;
    }, {});
    const uniqueClumps = Object.keys(clumpedCount).length;

    if (uniqueClumps > 0) {
      const clumpedOffenses = convictions.filter((o) => o.clumpGroup);
      const nonClumpedOffenses = convictions.filter((o) => !o.clumpGroup);

      totalConvictions = uniqueClumps + nonClumpedOffenses.length;
      misdemeanorConvictions = 0;
      felonyConvictions = 0;
      f3Convictions = 0;

      const seenGroups = new Set();

      for (const offense of convictions) {
        if (offense.clumpGroup) {
          if (seenGroups.has(offense.clumpGroup)) continue;
          seenGroups.add(offense.clumpGroup);

          const groupItems = clumpedOffenses.filter((item) => item.clumpGroup === offense.clumpGroup);
          const highestCategory = groupItems.some((item) => item.category === "felony") ? "felony" : "misdemeanor";
          const highestFelony = groupItems
            .filter((item) => item.category === "felony")
            .sort((a, b) => levelRank(b.level) - levelRank(a.level))[0];

          if (highestCategory === "felony") {
            felonyConvictions++;
            if (highestFelony?.level === "F3") f3Convictions++;
          } else {
            misdemeanorConvictions++;
          }
        } else {
          if (offense.category === "felony") {
            felonyConvictions++;
            if (offense.level === "F3") f3Convictions++;
          } else {
            misdemeanorConvictions++;
          }
        }
      }
    }
  }

  const highestFelonyLevel = convictions
    .filter((o) => o.category === "felony")
    .sort((a, b) => levelRank(b.level) - levelRank(a.level))[0]?.level || null;

  return {
    totalConvictions,
    misdemeanorConvictions,
    felonyConvictions,
    f3Convictions,
    highestFelonyLevel,
    totalConvictionsRaw,
    misdemeanorConvictionsRaw,
    felonyConvictionsRaw,
    f3ConvictionsRaw
  };
}

function getOhioRuleForOffense(offense, remedyType) {
  if (offense.category === "misdemeanor") {
    if (offense.level === "MM") {
      return ohioRules[remedyType].minorMisdemeanorWait;
    }
    return ohioRules[remedyType].misdemeanorWait;
  }

  if (offense.category === "felony") {
    if (offense.level === "F4" || offense.level === "F5") {
      if (remedyType === "sealing" && offense.chargeId === "rc_2921_43") {
        return ohioRules.sealing.rc292143Wait;
      }
      return ohioRules[remedyType].felony45Wait;
    }

    if (offense.level === "F3") {
      return ohioRules[remedyType].felony3Wait;
    }
  }

  return null;
}

function checkOhioOffenseExclusions(offense) {
  if (offense.outcome !== "conviction") {
    return { ok: true, reason: "" };
  }

  const sealingExcluded = isOhioChargeExcluded(offense.chargeId, "sealing", offense.level);
  const expungementExcluded = isOhioChargeExcluded(offense.chargeId, "expungement", offense.level);

  return {
    ok: !(sealingExcluded.excluded && expungementExcluded.excluded),
    sealingExcluded,
    expungementExcluded
  };
}

function getOhioRemedyAvailability(offenses) {
  const convictions = offenses.filter((offense) => offense.outcome === "conviction");
  const summaryNoClump = summarizeOhioConvictions(convictions, false);
  const summaryClump = summarizeOhioConvictions(convictions, true);

  const pendingCharges = offenses.some((offense) => offense.pendingCharges === true);
  if (pendingCharges) {
    return {
      sealingAvailable: false,
      expungementAvailable: false,
      reason: "Pending criminal charges block both sealing and expungement.",
      summary: summaryClump
    };
  }

  const hasUnpaidFinesOrFees = convictions.some((offense) => offense.sentencePaid === false);
  if (hasUnpaidFinesOrFees) {
    return {
      sealingAvailable: false,
      expungementAvailable: false,
      reason: "Discharge is not complete because fines or fees that were part of sentence are not paid.",
      summary: summaryClump
    };
  }

  const hasF1OrF2 = convictions.some((offense) => offense.level === "F1" || offense.level === "F2");
  if (hasF1OrF2) {
    return {
      sealingAvailable: false,
      expungementAvailable: false,
      reason: "1st and 2nd degree felony convictions are excluded.",
      summary: summaryClump
    };
  }

  const excludedCharge = convictions.find((offense) => {
    const exclusion = checkOhioOffenseExclusions(offense);
    return !exclusion.ok;
  });

  if (excludedCharge) {
    const exclusion = checkOhioOffenseExclusions(excludedCharge);
    const charge = getChargeById(excludedCharge.chargeId);
    const reason =
      exclusion.sealingExcluded.excluded && exclusion.expungementExcluded.excluded
        ? exclusion.sealingExcluded.reason || exclusion.expungementExcluded.reason
        : `The charge ${charge?.label || excludedCharge.chargeId} limits one or more remedies.`;

    return {
      sealingAvailable: !exclusion.sealingExcluded.excluded,
      expungementAvailable: !exclusion.expungementExcluded.excluded,
      reason,
      summary: summaryClump
    };
  }

  const f3Count = summaryClump.f3Convictions;
  const felonyCount = summaryClump.felonyConvictions;
  const misdemeanorCount = summaryClump.misdemeanorConvictions;
  const totalCount = summaryClump.totalConvictions;

  if (f3Count > 0) {
    if (felonyCount >= 2 && f3Count >= 1 && convictions.some((o) => o.level === "F3") && felonyCount > 1) {
      return {
        sealingAvailable: false,
        expungementAvailable: false,
        reason: "A 3rd degree felony is not eligible if the applicant has two or more felony convictions of any degree.",
        summary: summaryClump
      };
    }

    if (f3Count === 2 && misdemeanorCount === 2 && totalCount > 4) {
      return {
        sealingAvailable: false,
        expungementAvailable: false,
        reason: "Exactly two F3 convictions plus two misdemeanors plus any other conviction is excluded.",
        summary: summaryClump
      };
    }

    if (f3Count > 2) {
      return {
        sealingAvailable: false,
        expungementAvailable: false,
        reason: "Only one or two 3rd degree felonies are covered by the handout’s waiting-period rules.",
        summary: summaryClump
      };
    }
  }

  return {
    sealingAvailable: true,
    expungementAvailable: true,
    reason: "",
    summary: summaryClump
  };
}

function calculateOhioRemedyDates(offenses) {
  const convictions = offenses.filter((offense) => offense.outcome === "conviction");
  const today = new Date();

  let latestSealingDate = null;
  let latestExpungementDate = null;
  const offenseResults = [];

  for (const offense of offenses) {
    if (!offense.chargeId) {
      return { error: "Every offense must include a charge.", offenseResults };
    }

    if (!offense.category) {
      return { error: "Every offense must include an offense category.", offenseResults };
    }

    if (!offense.level) {
      return { error: "Every offense must include an offense level.", offenseResults };
    }

    if (!offense.outcome) {
      return { error: "Every offense must include a case outcome.", offenseResults };
    }

    if (!offense.dischargeDate) {
      return { error: "Every offense must include a discharge or final disposition date.", offenseResults };
    }

    const baseDate = new Date(offense.dischargeDate);
    const charge = getChargeById(offense.chargeId);

    let sealingDate = baseDate;
    let expungementDate = baseDate;

    if (offense.outcome === "conviction") {
      const sealingRule = getOhioRuleForOffense(offense, "sealing");
      const expungementRule = getOhioRuleForOffense(offense, "expungement");

      if (!sealingRule || !expungementRule) {
        return {
          error: `No Ohio waiting-period rule found for ${offense.level}.`,
          offenseResults
        };
      }

      if (offense.chapter2950 && offense.remedyTarget !== "expungement") {
        sealingDate = addWaitToDate(baseDate, ohioRules.sealing.chapter2950Wait.wait, ohioRules.sealing.chapter2950Wait.unit);
      } else {
        sealingDate = addWaitToDate(baseDate, sealingRule.wait, sealingRule.unit);
      }

      expungementDate = addWaitToDate(baseDate, expungementRule.wait, expungementRule.unit);
    }

    offenseResults.push({
      ...offense,
      chargeLabel: charge?.label || offense.chargeId,
      sealingDate: formatDate(sealingDate),
      expungementDate: formatDate(expungementDate),
      sealingEligibleNow: sealingDate <= today,
      expungementEligibleNow: expungementDate <= today
    });

    if (!latestSealingDate || sealingDate > latestSealingDate) {
      latestSealingDate = sealingDate;
    }

    if (!latestExpungementDate || expungementDate > latestExpungementDate) {
      latestExpungementDate = expungementDate;
    }
  }

  if (!latestSealingDate) latestSealingDate = today;
  if (!latestExpungementDate) latestExpungementDate = today;

  return {
    latestSealingDate: formatDate(latestSealingDate),
    latestExpungementDate: formatDate(latestExpungementDate),
    offenseResults
  };
}

function calculateSealabilityConfidence(offenses, evaluationResult) {
  let score = 100;
  const reasons = [];

  if (!offenses.length) {
    return {
      score: 0,
      label: "Insufficient information",
      reasons: ["No offenses entered."]
    };
  }

  for (const offense of offenses) {
    if (!offense.chargeId) {
      score -= 12;
      reasons.push("Missing charge selection.");
    }
    if (!offense.outcome) {
      score -= 12;
      reasons.push("Missing case outcome.");
    }
    if (!offense.level) {
      score -= 12;
      reasons.push("Missing offense level.");
    }
    if (!offense.dischargeDate) {
      score -= 20;
      reasons.push("Missing discharge or final disposition date.");
    }
    if (offense.pendingCharges) {
      score -= 35;
      reasons.push("Pending charges block relief.");
    }
    if (offense.outcome === "conviction" && !offense.sentencePaid) {
      score -= 25;
      reasons.push("Sentence fines or fees are not fully paid.");
    }
    if (offense.chapter2950) {
      score -= 15;
      reasons.push("Chapter 2950 status adds limits and longer waits.");
    }
    if (offense.victimUnder13) {
      score -= 30;
      reasons.push("Victim-under-13 cases are often excluded.");
    }
  }

  if (evaluationResult && !evaluationResult.sealingAvailable && !evaluationResult.expungementAvailable) {
    score -= 30;
    reasons.push("Current Ohio rules do not clearly support relief based on the entered record.");
  }

  score = Math.max(0, Math.min(100, score));

  let label = "High likelihood";
  if (score < 50) {
    label = "Low likelihood";
  } else if (score < 75) {
    label = "Moderate likelihood";
  } else if (score < 90) {
    label = "Likely eligible";
  }

  return {
    score,
    label,
    reasons: [...new Set(reasons)]
  };
}

function evaluateAllOffenses(offenses) {
  if (!offenses.length) {
    const result = {
      eligible: false,
      reason: "No offenses entered.",
      offenseResults: []
    };
    return { ...result, confidence: calculateSealabilityConfidence(offenses, result) };
  }

  const availability = getOhioRemedyAvailability(offenses);
  const dateResult = calculateOhioRemedyDates(offenses);

  if (dateResult.error) {
    const result = {
      eligible: false,
      reason: dateResult.error,
      offenseResults: dateResult.offenseResults || [],
      summary: availability.summary || null
    };
    return { ...result, confidence: calculateSealabilityConfidence(offenses, result) };
  }

  const today = new Date();
  const sealingNow = availability.sealingAvailable && new Date(dateResult.latestSealingDate) <= today;
  const expungementNow = availability.expungementAvailable && new Date(dateResult.latestExpungementDate) <= today;

  let statusText = "Not eligible";
  if (sealingNow && expungementNow) {
    statusText = "Eligible now for sealing and expungement";
  } else if (sealingNow) {
    statusText = "Eligible now for sealing";
  } else if (expungementNow) {
    statusText = "Eligible now for expungement";
  } else if (availability.sealingAvailable || availability.expungementAvailable) {
    statusText = "Not yet eligible";
  }

  const result = {
    eligible: sealingNow || expungementNow,
    statusText,
    sealingAvailable: availability.sealingAvailable,
    expungementAvailable: availability.expungementAvailable,
    sealingEligibilityDate: availability.sealingAvailable ? dateResult.latestSealingDate : null,
    expungementEligibilityDate: availability.expungementAvailable ? dateResult.latestExpungementDate : null,
    reason: availability.reason || "",
    offenseResults: dateResult.offenseResults,
    summary: availability.summary || null
  };

  return {
    ...result,
    confidence: calculateSealabilityConfidence(offenses, result)
  };
}
