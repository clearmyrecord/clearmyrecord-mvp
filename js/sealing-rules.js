const ohioRules = {
  sealing: {
    minorMisdemeanorWait: { wait: 6, unit: "months" },
    misdemeanorWait: { wait: 1, unit: "years" },
    felony45Wait: { wait: 1, unit: "years" },
    felony3Wait: { wait: 3, unit: "years" },
    chapter2950Wait: { wait: 5, unit: "years" },
    rc292143Wait: { wait: 7, unit: "years" }
  },

  expungement: {
    minorMisdemeanorWait: { wait: 6, unit: "months" },
    misdemeanorWait: { wait: 1, unit: "years" },
    felony45Wait: { wait: 11, unit: "years" },
    felony3Wait: { wait: 13, unit: "years" }
  }
};
