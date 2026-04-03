const sealingRules = {
  ohio: {
    conviction: {
      misdemeanor: {
        MM: {
          eligible: true,
          wait: 6,
          unit: "months",
          label: "Minor Misdemeanor Conviction"
        },
        M4: {
          eligible: true,
          wait: 1,
          unit: "years",
          label: "4th Degree Misdemeanor Conviction"
        },
        M3: {
          eligible: true,
          wait: 1,
          unit: "years",
          label: "3rd Degree Misdemeanor Conviction"
        },
        M2: {
          eligible: true,
          wait: 1,
          unit: "years",
          label: "2nd Degree Misdemeanor Conviction"
        },
        M1: {
          eligible: true,
          wait: 1,
          unit: "years",
          label: "1st Degree Misdemeanor Conviction"
        }
      },
      felony: {
        F5: {
          eligible: true,
          wait: 1,
          unit: "years",
          label: "5th Degree Felony Conviction"
        },
        F4: {
          eligible: true,
          wait: 1,
          unit: "years",
          label: "4th Degree Felony Conviction"
        },
        F3: {
          eligible: true,
          wait: 1,
          unit: "years",
          label: "3rd Degree Felony Conviction"
        },
        F2: {
          eligible: false,
          wait: null,
          unit: null,
          label: "2nd Degree Felony Conviction"
        },
        F1: {
          eligible: false,
          wait: null,
          unit: null,
          label: "1st Degree Felony Conviction"
        }
      }
    },

    dismissed: {
      misdemeanor: {
        MM: {
          eligible: true,
          wait: 0,
          unit: "days",
          label: "Minor Misdemeanor Dismissed"
        },
        M4: {
          eligible: true,
          wait: 0,
          unit: "days",
          label: "4th Degree Misdemeanor Dismissed"
        },
        M3: {
          eligible: true,
          wait: 0,
          unit: "days",
          label: "3rd Degree Misdemeanor Dismissed"
        },
        M2: {
          eligible: true,
          wait: 0,
          unit: "days",
          label: "2nd Degree Misdemeanor Dismissed"
        },
        M1: {
          eligible: true,
          wait: 0,
          unit: "days",
          label: "1st Degree Misdemeanor Dismissed"
        }
      },
      felony: {
        F5: {
          eligible: true,
          wait: 0,
          unit: "days",
          label: "5th Degree Felony Dismissed"
        },
        F4: {
          eligible: true,
          wait: 0,
          unit: "days",
          label: "4th Degree Felony Dismissed"
        },
        F3: {
          eligible: true,
          wait: 0,
          unit: "days",
          label: "3rd Degree Felony Dismissed"
        },
        F2: {
          eligible: true,
          wait: 0,
          unit: "days",
          label: "2nd Degree Felony Dismissed"
        },
        F1: {
          eligible: true,
          wait: 0,
          unit: "days",
          label: "1st Degree Felony Dismissed"
        }
      }
    },

    not_guilty: {
      misdemeanor: {
        MM: { eligible: true, wait: 0, unit: "days", label: "Minor Misdemeanor Not Guilty" },
        M4: { eligible: true, wait: 0, unit: "days", label: "4th Degree Misdemeanor Not Guilty" },
        M3: { eligible: true, wait: 0, unit: "days", label: "3rd Degree Misdemeanor Not Guilty" },
        M2: { eligible: true, wait: 0, unit: "days", label: "2nd Degree Misdemeanor Not Guilty" },
        M1: { eligible: true, wait: 0, unit: "days", label: "1st Degree Misdemeanor Not Guilty" }
      },
      felony: {
        F5: { eligible: true, wait: 0, unit: "days", label: "5th Degree Felony Not Guilty" },
        F4: { eligible: true, wait: 0, unit: "days", label: "4th Degree Felony Not Guilty" },
        F3: { eligible: true, wait: 0, unit: "days", label: "3rd Degree Felony Not Guilty" },
        F2: { eligible: true, wait: 0, unit: "days", label: "2nd Degree Felony Not Guilty" },
        F1: { eligible: true, wait: 0, unit: "days", label: "1st Degree Felony Not Guilty" }
      }
    },

    no_billed: {
      misdemeanor: {
        MM: { eligible: true, wait: 0, unit: "days", label: "Minor Misdemeanor No Billed" },
        M4: { eligible: true, wait: 0, unit: "days", label: "4th Degree Misdemeanor No Billed" },
        M3: { eligible: true, wait: 0, unit: "days", label: "3rd Degree Misdemeanor No Billed" },
        M2: { eligible: true, wait: 0, unit: "days", label: "2nd Degree Misdemeanor No Billed" },
        M1: { eligible: true, wait: 0, unit: "days", label: "1st Degree Misdemeanor No Billed" }
      },
      felony: {
        F5: { eligible: true, wait: 0, unit: "days", label: "5th Degree Felony No Billed" },
        F4: { eligible: true, wait: 0, unit: "days", label: "4th Degree Felony No Billed" },
        F3: { eligible: true, wait: 0, unit: "days", label: "3rd Degree Felony No Billed" },
        F2: { eligible: true, wait: 0, unit: "days", label: "2nd Degree Felony No Billed" },
        F1: { eligible: true, wait: 0, unit: "days", label: "1st Degree Felony No Billed" }
      }
    }
  }
};
