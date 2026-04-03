const courtConfigs = {
  ohio: {
    wood: {
      courtName: "Wood County Court of Common Pleas",
      courtAddress: "One Courthouse Square, Bowling Green, OH 43402",
      filingType: "Application for Sealing of Record of Conviction",
      filingFee: "$100 filing fee may apply",
      instructions: [
        "Confirm the exact case number before filing.",
        "File in the same court that handled the conviction.",
        "Attach any required supporting statement or rehabilitation letter.",
        "Bring or mail the application to the clerk of courts.",
        "Keep a stamped copy for your records."
      ],
      applicationTemplate: {
        title: "Application for Sealing of Record of Conviction",
        fields: [
          "Applicant Name",
          "Current Address",
          "Case Number",
          "Offense",
          "Date of Final Discharge",
          "County",
          "Court Name"
        ]
      },
      letterIntro:
        "I respectfully submit this application and request that the Court seal the record at issue in Wood County, Ohio."
    }
  },

  nevada: {
    clark: {
      courtName: "Eighth Judicial District Court / Clark County Sealing Workflow",
      courtAddress: "Clark County, Nevada",
      filingType: "Petition / Record Sealing Packet Draft",
      filingFee: "Fees may vary depending on the court and filing path",
      instructions: [
        "Confirm which court handled the original matter.",
        "Obtain the full criminal history and disposition details if required.",
        "Prepare the petition, affidavit, and proposed order if applicable.",
        "Serve any required agencies or prosecutors.",
        "Retain copies of everything submitted."
      ],
      applicationTemplate: {
        title: "Draft Petition for Record Sealing",
        fields: [
          "Petitioner Name",
          "Current Address",
          "Arresting / Filing Court",
          "Offense",
          "Disposition Date",
          "County",
          "Court Name"
        ]
      },
      letterIntro:
        "I respectfully submit this draft record sealing packet for review regarding the matter entered in Clark County, Nevada."
    }
  }
};

function normalizeCountyName(county) {
  if (!county) return "";
  return county
    .toLowerCase()
    .replace("county", "")
    .trim();
}

function getCourtConfig(state, county) {
  const normalizedState = (state || "").toLowerCase();
  const normalizedCounty = normalizeCountyName(county);

  if (
    courtConfigs[normalizedState] &&
    courtConfigs[normalizedState][normalizedCounty]
  ) {
    return courtConfigs[normalizedState][normalizedCounty];
  }

  return {
    courtName: "Court not yet mapped in MVP",
    courtAddress: "Please confirm the exact court manually.",
    filingType: "Draft record sealing application",
    filingFee: "Check with the clerk for current fees",
    instructions: [
      "Confirm the exact court and case number.",
      "Review local filing rules.",
      "Verify that all supporting materials are complete.",
      "Print and review before filing."
    ],
    applicationTemplate: {
      title: "Draft Record Sealing Application",
      fields: [
        "Applicant Name",
        "Current Address",
        "Case Number",
        "Offense",
        "Date of Final Discharge",
        "County",
        "Court Name"
      ]
    },
    letterIntro:
      "I respectfully submit this draft filing packet and request review of my record sealing application."
  };
}
