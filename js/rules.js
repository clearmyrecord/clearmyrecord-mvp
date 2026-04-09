(function () {
  const YEAR_MS = 365.25 * 24 * 60 * 60 * 1000;
  const MONTH_MS = YEAR_MS / 12;

  function toDate(value) {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  }

  function elapsedSince(dateValue) {
    const date = toDate(dateValue);
    if (!date) return { years: 0, months: 0, ms: 0 };
    const ms = Date.now() - date.getTime();
    return {
      years: ms / YEAR_MS,
      months: ms / MONTH_MS,
      ms
    };
  }

  function addReason(list, message) {
    list.push(message);
  }

  function buildResult({
    eligible,
    status,
    state,
    reliefType,
    reasons = [],
    waitingPeriod = null,
    earliestEligibleDate = null,
    manualReview = false
  }) {
    return {
      eligible,
      status,
      state,
      reliefType,
      reasons,
      waitingPeriod,
      earliestEligibleDate,
      manualReview
    };
  }

  function formatDateISO(date) {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null;
    return date.toISOString().split("T")[0];
  }

  function futureDateFromDischarge(dischargeDate, years = 0, months = 0) {
    const d = toDate(dischargeDate);
    if (!d) return null;
    const copy = new Date(d.getTime());
    copy.setFullYear(copy.getFullYear() + years);
    copy.setMonth(copy.getMonth() + months);
    return formatDateISO(copy);
  }

  function normalizeOutcome(value) {
    return (value || "").trim().toLowerCase();
  }

  function normalizeDegree(value) {
    return (value || "").trim().toUpperCase();
  }

  function isOhioNonConviction(outcome) {
    return [
      "dismissed",
      "dismissal",
      "not guilty",
      "acquitted",
      "no bill",
      "pardon",
      "intervention in lieu"
    ].includes(normalizeOutcome(outcome));
  }

  function isNevadaNonConviction(outcome) {
    return [
      "dismissed",
      "dismissal",
      "not guilty",
      "acquitted",
      "decriminalized"
    ].includes(normalizeOutcome(outcome));
  }

  function evaluateOhio(record) {
    const reasons = [];
    const outcome = normalizeOutcome(record.outcome);
    const degree = normalizeDegree(record.degree);
    const dischargeElapsed = elapsedSince(record.dischargeDate);

    if (record.pendingCharges) {
      addReason(reasons, "Ohio blocks sealing/expungement while any criminal charge is still pending.");
      return buildResult({
        eligible: false,
        status: "not_eligible_yet",
        state: "OH",
        reliefType: "unknown",
        reasons
      });
    }

    if (outcome === "no bill") {
      const waitYears = 2;
      const eligible = dischargeElapsed.years >= waitYears;
      addReason(
        reasons,
        eligible
          ? "Ohio no-bill waiting period appears satisfied."
          : "Ohio no-bill cases generally require a 2-year wait before filing."
      );

      return buildResult({
        eligible,
        status: eligible ? "likely_eligible" : "not_eligible_yet",
        state: "OH",
        reliefType: "seal_or_expunge_non_conviction",
        reasons,
        waitingPeriod: "2 years from no-bill date",
        earliestEligibleDate: eligible ? formatDateISO(new Date()) : futureDateFromDischarge(record.dischargeDate, 2)
      });
    }

    if (["dismissed", "dismissal", "not guilty", "acquitted", "pardon", "intervention in lieu"].includes(outcome)) {
      addReason(reasons, "Ohio non-conviction path appears available now, subject to court-specific review and exclusions.");
      return buildResult({
        eligible: true,
        status: "likely_eligible",
        state: "OH",
        reliefType: "seal_or_expunge_non_conviction",
        reasons
      });
    }

    if (outcome !== "convicted" && outcome !== "guilty") {
      addReason(reasons, "Outcome not recognized. Manual review needed.");
      return buildResult({
        eligible: false,
        status: "needs_review",
        state: "OH",
        reliefType: "unknown",
        reasons,
        manualReview: true
      });
    }

    if (record.isTraffic) {
      addReason(reasons, "Ohio traffic convictions are excluded from standard sealing/expungement.");
      return buildResult({
        eligible: false,
        status: "ineligible",
        state: "OH",
        reliefType: "conviction",
        reasons
      });
    }

    if (record.isTheftInOffice) {
      addReason(reasons, "Ohio theft-in-office convictions are excluded from standard sealing/expungement.");
      return buildResult({
        eligible: false,
        status: "ineligible",
        state: "OH",
        reliefType: "conviction",
        reasons
      });
    }

    if (record.isFirstOrSecondDegreeFelony) {
      addReason(reasons, "Ohio 1st- and 2nd-degree felonies are excluded from standard sealing/expungement.");
      return buildResult({
        eligible: false,
        status: "ineligible",
        state: "OH",
        reliefType: "conviction",
        reasons
      });
    }

    if (record.isSexOffenseRegistry) {
      addReason(reasons, "Ohio registry-related sexually oriented offenses are excluded from standard sealing/expungement.");
      return buildResult({
        eligible: false,
        status: "ineligible",
        state: "OH",
        reliefType: "conviction",
        reasons
      });
    }

    if (record.victimUnder13) {
      addReason(reasons, "Ohio offenses with a victim under 13 are generally excluded.");
      return buildResult({
        eligible: false,
        status: "ineligible",
        state: "OH",
        reliefType: "conviction",
        reasons
      });
    }

    if (record.isFelonyViolenceNonSex) {
      addReason(reasons, "Ohio felony offenses of violence that are not sexually oriented offenses are generally excluded.");
      return buildResult({
        eligible: false,
        status: "ineligible",
        state: "OH",
        reliefType: "conviction",
        reasons
      });
    }

    if (record.isDomesticViolenceConviction && !record.dvMisdemeanorSealable) {
      addReason(reasons, "Ohio domestic violence convictions are generally excluded except limited lower-level sealing situations.");
      return buildResult({
        eligible: false,
        status: "ineligible",
        state: "OH",
        reliefType: "conviction",
        reasons
      });
    }

    let waitYears = 0;
    let waitMonths = 0;
    let waitingPeriodLabel = "";

    if (degree === "MM") {
      waitMonths = 6;
      waitingPeriodLabel = "6 months after discharge";
    } else if (degree === "M") {
      waitYears = 1;
      waitingPeriodLabel = "1 year after discharge";
    } else if (degree === "F4" || degree === "F5") {
      waitYears = record.isTheftInOffice ? 7 : 1;
      waitingPeriodLabel = record.isTheftInOffice ? "7 years after discharge" : "1 year after discharge";
    } else if (degree === "F3") {
      if (record.totalFelonies > 2) {
        addReason(reasons, "Ohio third-degree felony count appears to exceed standard eligibility.");
        return buildResult({
          eligible: false,
          status: "ineligible",
          state: "OH",
          reliefType: "conviction",
          reasons
        });
      }

      waitYears = 3;
      waitingPeriodLabel = "3 years after discharge";

      if (record.totalF3 >= 1) {
        addReason(reasons, "Ohio third-degree felony cases may require clumping analysis or manual review.");
      }
    } else {
      addReason(reasons, "Degree not mapped for Ohio conviction analysis.");
      return buildResult({
        eligible: false,
        status: "needs_review",
        state: "OH",
        reliefType: "conviction",
        reasons,
        manualReview: true
      });
    }

    const requiredMs = waitYears * YEAR_MS + waitMonths * MONTH_MS;
    const eligible = dischargeElapsed.ms >= requiredMs;

    addReason(
      reasons,
      eligible
        ? `Ohio waiting period appears satisfied (${waitingPeriodLabel}).`
        : `Ohio waiting period not yet satisfied (${waitingPeriodLabel}).`
    );

    return buildResult({
      eligible,
      status: eligible ? "likely_eligible" : "not_eligible_yet",
      state: "OH",
      reliefType: "conviction",
      reasons,
      waitingPeriod: waitingPeriodLabel,
      earliestEligibleDate: eligible
        ? formatDateISO(new Date())
        : futureDateFromDischarge(record.dischargeDate, waitYears, waitMonths),
      manualReview: degree === "F3"
    });
  }

  function evaluateNevada(record) {
    const reasons = [];
    const outcome = normalizeOutcome(record.outcome);
    const dischargeElapsed = elapsedSince(record.dischargeDate);

    if (isNevadaNonConviction(outcome)) {
      addReason(reasons, "Nevada non-conviction matters are generally immediately sealable.");
      return buildResult({
        eligible: true,
        status: "likely_eligible",
        state: "NV",
        reliefType: "seal_non_conviction",
        reasons
      });
    }

    if (outcome !== "convicted" && outcome !== "guilty") {
      addReason(reasons, "Outcome not recognized. Manual review needed.");
      return buildResult({
        eligible: false,
        status: "needs_review",
        state: "NV",
        reliefType: "unknown",
        reasons,
        manualReview: true
      });
    }

    if (record.isCrimeAgainstChild || record.isSexOffense || record.isFelonyDUI || record.isHomeInvasionDeadlyWeapon) {
      addReason(reasons, "This Nevada offense appears permanently excluded from sealing.");
      return buildResult({
        eligible: false,
        status: "ineligible",
        state: "NV",
        reliefType: "conviction",
        reasons
      });
    }

    let waitYears = 0;
    let waitingPeriodLabel = "";

    if (record.nvCategory === "standard_misdemeanor") {
      waitYears = 1;
      waitingPeriodLabel = "1 year after case closes";
    } else if (record.nvCategory === "listed_misdemeanor") {
      waitYears = 2;
      waitingPeriodLabel = "2 years after case closes";
    } else if (record.nvCategory === "dui_or_dv") {
      waitYears = 7;
      waitingPeriodLabel = "7 years after case closes";
    } else if (record.nvCategory === "felony") {
      waitYears = 5;
      waitingPeriodLabel = "5 years after case closes";
    } else if (record.nvCategory === "violent_or_category_a") {
      waitYears = 10;
      waitingPeriodLabel = "10 years after case closes";
    } else {
      addReason(reasons, "Nevada category not mapped. Manual review needed.");
      return buildResult({
        eligible: false,
        status: "needs_review",
        state: "NV",
        reliefType: "conviction",
        reasons,
        manualReview: true
      });
    }

    const eligible = dischargeElapsed.years >= waitYears;

    addReason(
      reasons,
      eligible
        ? `Nevada waiting period appears satisfied (${waitingPeriodLabel}).`
        : `Nevada waiting period not yet satisfied (${waitingPeriodLabel}).`
    );

    return buildResult({
      eligible,
      status: eligible ? "likely_eligible" : "not_eligible_yet",
      state: "NV",
      reliefType: "conviction",
      reasons,
      waitingPeriod: waitingPeriodLabel,
      earliestEligibleDate: eligible ? formatDateISO(new Date()) : futureDateFromDischarge(record.dischargeDate, waitYears)
    });
  }

  function evaluateRecordEligibility(record) {
    const state = (record.caseState || "").trim().toUpperCase();

    if (!state) {
      return buildResult({
        eligible: false,
        status: "needs_review",
        state: "",
        reliefType: "unknown",
        reasons: ["Case state is missing. Eligibility must be based on where the case was filed, not where the user lives."],
        manualReview: true
      });
    }

    if (state === "OH") return evaluateOhio(record);
    if (state === "NV") return evaluateNevada(record);

    return buildResult({
      eligible: false,
      status: "needs_review",
      state,
      reliefType: "unknown",
      reasons: [`No rules engine loaded yet for ${state}.`],
      manualReview: true
    });
  }

  window.CMRRules = {
    evaluateRecordEligibility
  };
})();
