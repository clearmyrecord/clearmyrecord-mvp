const sealingRules = {
  ohio: {
    felony3: {
      waitingPeriodYears: 3,
      requiresPaidFines: true,
      violentDisallowed: true,
      messageEligible:
        "You may be eligible to seal this Ohio third-degree felony.",
      messageWait:
        "You may need to wait longer before this Ohio third-degree felony can be sealed."
    },
    felony4: {
      waitingPeriodYears: 1,
      requiresPaidFines: true,
      violentDisallowed: true,
      messageEligible:
        "You may be eligible to seal this Ohio fourth-degree felony.",
      messageWait:
        "You may need to wait longer before this Ohio fourth-degree felony can be sealed."
    },
    felony5: {
      waitingPeriodYears: 1,
      requiresPaidFines: true,
      violentDisallowed: true,
      messageEligible:
        "You may be eligible to seal this Ohio fifth-degree felony.",
      messageWait:
        "You may need to wait longer before this Ohio fifth-degree felony can be sealed."
    }
  },
  nevada: {
    felony3: {
      waitingPeriodYears: 5,
      requiresPaidFines: true,
      violentDisallowed: true,
      messageEligible:
        "You may be eligible to seal this Nevada felony.",
      messageWait:
        "You may need to wait longer before this Nevada felony can be sealed."
    }
  }
};
