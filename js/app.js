function goToDetails() {
  const fullName = document.getElementById("fullName").value.trim();
  const email = document.getElementById("email").value.trim();
  const state = document.getElementById("state").value;
  const offense = document.getElementById("offense").value;

  if (!fullName || !email || !state || !offense) {
    alert("Please complete all fields before continuing.");
    return;
  }

  localStorage.setItem("fullName", fullName);
  localStorage.setItem("email", email);
  localStorage.setItem("state", state);
  localStorage.setItem("offense", offense);

  window.location.href = "record-details.html";
}

function checkEligibility() {
  const county = document.getElementById("county").value.trim();
  const felony = document.getElementById("felony").value;
  const violent = document.getElementById("violent").value;
  const years = Number(document.getElementById("years").value);
  const fines = document.getElementById("fines").value;
  const openCases = document.getElementById("openCases").value;
  const convictions = Number(document.getElementById("convictions").value);
  const state = localStorage.getItem("state");

  if (!felony || !violent || Number.isNaN(years) || !fines || !openCases || !convictions) {
    alert("Please complete all required fields before continuing.");
    return;
  }

  localStorage.setItem("county", county);
  localStorage.setItem("felony", felony);
  localStorage.setItem("violent", violent);
  localStorage.setItem("years", String(years));
  localStorage.setItem("fines", fines);
  localStorage.setItem("openCases", openCases);
  localStorage.setItem("convictions", String(convictions));

  const result = evaluateEligibility({
    state,
    felony,
    violent,
    years,
    fines,
    openCases,
    convictions,
    county
  });

  localStorage.setItem("eligibilityResult", JSON.stringify(result));
  window.location.href = "results.html";
}

function evaluateEligibility(data) {
  const stateRules = sealingRules[data.state];

  if (!stateRules) {
    return {
      status: "review",
      title: "Needs More Information",
      message: "This MVP does not yet support that state.",
      nextStep: "Please contact support or check back later for expanded state coverage.",
      courtHint: ""
    };
  }

  const ruleKey = `felony${data.felony}`;
  const rule = stateRules[ruleKey];

  if (!rule) {
    return {
      status: "review",
      title: "Needs More Information",
      message: "This MVP does not yet support that offense level.",
      nextStep: "A manual review may be needed.",
      courtHint: ""
    };
  }

  if (rule.violentDisallowed && data.violent === "yes") {
    return {
      status: "not-eligible",
      title: "Not Eligible Yet",
      message: "Violent offenses are not eligible under this simplified MVP rule set.",
      nextStep: "You may need a more detailed legal review.",
      courtHint: rule.courtHint
    };
  }

  if (rule.openCasesDisallowed && data.openCases === "yes") {
    return {
      status: "review",
      title: "Needs More Information",
      message: "Open criminal cases may block sealing until resolved.",
      nextStep: "Resolve any open cases first, then recheck eligibility.",
      courtHint: rule.courtHint
    };
  }

  if (rule.requiresPaidFines && data.fines !== "yes") {
    return {
      status: "review",
      title: "Needs More Information",
      message: "Outstanding fines may prevent record sealing until they are paid.",
      nextStep: "Pay any required fines, then recheck eligibility.",
      courtHint: rule.courtHint
    };
  }

  if (data.convictions > rule.maxConvictions) {
    return {
      status: "review",
      title: "Needs More Information",
      message: "This simplified MVP supports only limited conviction scenarios.",
      nextStep: "A manual review may be needed for multiple convictions.",
      courtHint: rule.courtHint
    };
  }

  if (data.years >= rule.waitingPeriodYears) {
    return {
      status: "eligible",
      title: "You May Be Eligible",
      message: rule.messageEligible,
      nextStep: "Next, gather your case number, court name, and filing documents.",
      courtHint: rule.courtHint
    };
  }

  const yearsRemaining = rule.waitingPeriodYears - data.years;

  return {
    status: "not-eligible",
    title: "Not Eligible Yet",
    message: `${rule.messageWait} Estimated time remaining: ${yearsRemaining} year(s).`,
    nextStep: "Set a reminder and come back when the waiting period has passed.",
    courtHint: rule.courtHint
  };
}

window.onload = function () {
  const resultBox = document.getElementById("result-box");
  if (!resultBox) return;

  const raw = localStorage.getItem("eligibilityResult");

  if (!raw) {
    resultBox.innerHTML = `
      <div class="result-card review">
        <h3>No result found</h3>
        <p>Please complete the eligibility check first.</p>
      </div>
    `;
    return;
  }

  const result = JSON.parse(raw);
  const fullName = localStorage.getItem("fullName") || "there";
  const state = localStorage.getItem("state") || "";
  const county = localStorage.getItem("county") || "";

  resultBox.innerHTML = `
    <div class="result-card ${result.status}">
      <div class="result-status">${result.title}</div>
      <h3>Hello, ${escapeHtml(fullName)}</h3>
      <p>${escapeHtml(result.message)}</p>

      ${county ? `<p><strong>County entered:</strong> ${escapeHtml(county)}</p>` : ""}
      ${state ? `<p><strong>State:</strong> ${escapeHtml(capitalize(state))}</p>` : ""}
      ${result.courtHint ? `<p><strong>Where to file:</strong> ${escapeHtml(result.courtHint)}</p>` : ""}

      <div class="next-step-box">
        <strong>Suggested next step:</strong>
        <p>${escapeHtml(result.nextStep)}</p>
      </div>

      <div class="form-actions">
        <button class="primary-btn" onclick="alert('Next feature: document generation / attorney review')">
          Continue
        </button>
      </div>
    </div>
  `;
};

function capitalize(value) {
  if (!value) return "";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
