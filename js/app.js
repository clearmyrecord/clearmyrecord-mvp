let offenseCount = 0;

const offenseLevels = {
  misdemeanor: [
    { value: "MM", label: "Minor Misdemeanor" },
    { value: "M4", label: "4th Degree Misdemeanor" },
    { value: "M3", label: "3rd Degree Misdemeanor" },
    { value: "M2", label: "2nd Degree Misdemeanor" },
    { value: "M1", label: "1st Degree Misdemeanor" }
  ],
  felony: [
    { value: "F5", label: "5th Degree Felony" },
    { value: "F4", label: "4th Degree Felony" },
    { value: "F3", label: "3rd Degree Felony" },
    { value: "F2", label: "2nd Degree Felony" },
    { value: "F1", label: "1st Degree Felony" }
  ]
};

function addOffense() {
  const container = document.getElementById("offenses");
  const id = offenseCount++;

  const wrapper = document.createElement("div");
  wrapper.className = "offense";
  wrapper.id = `offense-${id}`;

  wrapper.innerHTML = `
    <div class="offense-header">
      <div class="offense-title">Offense ${id + 1}</div>
      <button type="button" class="secondary" onclick="removeOffense(${id})">Remove</button>
    </div>

    <div class="form-grid">
      <div class="form-field">
        <label for="charge-${id}">Charge</label>
        <select id="charge-${id}" onchange="applyChargeDefaults(${id})">
          <option value="">Select charge</option>
          ${chargeLibrary.map((charge) => `<option value="${charge.id}">${charge.label}</option>`).join("")}
        </select>
      </div>

      <div class="form-field">
        <label for="outcome-${id}">Outcome</label>
        <select id="outcome-${id}">
          <option value="">Select outcome</option>
          <option value="conviction">Conviction</option>
          <option value="dismissed">Dismissed</option>
          <option value="not_guilty">Not Guilty</option>
          <option value="no_billed">No Billed</option>
        </select>
      </div>

      <div class="form-field">
        <label for="category-${id}">Category</label>
        <select id="category-${id}" onchange="updateLevels(${id})">
          <option value="">Select category</option>
          <option value="misdemeanor">Misdemeanor</option>
          <option value="felony">Felony</option>
        </select>
      </div>

      <div class="form-field">
        <label for="level-${id}">Level</label>
        <select id="level-${id}">
          <option value="">Select level</option>
        </select>
      </div>

      <div class="form-field">
        <label for="dischargeDate-${id}">Discharge / Final Disposition Date</label>
        <input type="date" id="dischargeDate-${id}" />
      </div>

      <div class="form-field">
        <label for="clumpGroup-${id}">Clump Group (optional)</label>
        <input type="text" id="clumpGroup-${id}" placeholder="Example: A, B, case-set-1" />
      </div>

      <div class="form-field">
        <div class="checkbox-row">
          <input type="checkbox" id="sentencePaid-${id}" checked />
          <label for="sentencePaid-${id}" style="margin:0;">Sentence fines/fees paid</label>
        </div>
      </div>

      <div class="form-field">
        <div class="checkbox-row">
          <input type="checkbox" id="pendingCharges-${id}" />
          <label for="pendingCharges-${id}" style="margin:0;">Has pending criminal charges</label>
        </div>
      </div>

      <div class="form-field">
        <div class="checkbox-row">
          <input type="checkbox" id="chapter2950-${id}" />
          <label for="chapter2950-${id}" style="margin:0;">Subject to Chapter 2950 registry requirements</label>
        </div>
      </div>

      <div class="form-field">
        <div class="checkbox-row">
          <input type="checkbox" id="victimUnder13-${id}" />
          <label for="victimUnder13-${id}" style="margin:0;">Victim was under 13</label>
        </div>
      </div>

      <div class="form-field full">
        <label for="notes-${id}">Notes (optional)</label>
        <input type="text" id="notes-${id}" placeholder="Optional internal notes" />
      </div>
    </div>
  `;

  container.appendChild(wrapper);
}

function applyChargeDefaults(id) {
  const chargeId = document.getElementById(`charge-${id}`).value;
  const charge = getChargeById(chargeId);
  if (!charge) return;

  const categorySelect = document.getElementById(`category-${id}`);
  const levelSelect = document.getElementById(`level-${id}`);

  categorySelect.value = charge.category;
  levelSelect.innerHTML = '<option value="">Select level</option>';

  const options = offenseLevels[charge.category] || [];
  options.forEach((level) => {
    const option = document.createElement("option");
    option.value = level.value;
    option.textContent = level.label;
    if (level.value === charge.defaultLevel) {
      option.selected = true;
    }
    levelSelect.appendChild(option);
  });
}

function updateLevels(id) {
  const category = document.getElementById(`category-${id}`).value;
  const levelSelect = document.getElementById(`level-${id}`);

  levelSelect.innerHTML = '<option value="">Select level</option>';

  const options = offenseLevels[category] || [];
  options.forEach((level) => {
    const option = document.createElement("option");
    option.value = level.value;
    option.textContent = level.label;
    levelSelect.appendChild(option);
  });
}

function removeOffense(id) {
  const element = document.getElementById(`offense-${id}`);
  if (element) {
    element.remove();
  }
}

function collectOffenses() {
  const offenses = [];

  for (let i = 0; i < offenseCount; i++) {
    const chargeEl = document.getElementById(`charge-${i}`);
    if (!chargeEl) continue;

    offenses.push({
      state: "ohio",
      chargeId: chargeEl.value,
      outcome: document.getElementById(`outcome-${i}`).value,
      category: document.getElementById(`category-${i}`).value,
      level: document.getElementById(`level-${i}`).value,
      dischargeDate: document.getElementById(`dischargeDate-${i}`).value,
      sentencePaid: document.getElementById(`sentencePaid-${i}`).checked,
      pendingCharges: document.getElementById(`pendingCharges-${i}`).checked,
      chapter2950: document.getElementById(`chapter2950-${i}`).checked,
      victimUnder13: document.getElementById(`victimUnder13-${i}`).checked,
      clumpGroup: document.getElementById(`clumpGroup-${i}`).value.trim(),
      notes: document.getElementById(`notes-${i}`).value.trim()
    });
  }

  return offenses;
}

function renderSummary(summary) {
  if (!summary) return "";

  return `
    <div style="margin-top:12px;">
      <strong>Conviction summary</strong><br>
      Count after clumping: ${summary.totalConvictions}<br>
      Raw conviction count: ${summary.totalConvictionsRaw}<br>
      Misdemeanor convictions: ${summary.misdemeanorConvictions}<br>
      Felony convictions: ${summary.felonyConvictions}<br>
      Third-degree felony convictions: ${summary.f3Convictions}<br>
      Highest felony level: ${summary.highestFelonyLevel || "None"}
    </div>
  `;
}

function renderOffenseSummary(offenseResults) {
  if (!offenseResults.length) return "";

  const items = offenseResults.map((offense, index) => `
    <li>
      <strong>Offense ${index + 1}:</strong>
      ${offense.chargeLabel} —
      sealing date: ${offense.sealingDate} —
      expungement date: ${offense.expungementDate}
    </li>
  `).join("");

  return `<ul class="offense-summary">${items}</ul>`;
}

function renderConfidence(confidence) {
  if (!confidence) return "";

  let badgeClass = "red";
  let badgeText = "Low likelihood";

  if (confidence.score >= 75) {
    badgeClass = "green";
    badgeText = "High likelihood";
  } else if (confidence.score >= 50) {
    badgeClass = "yellow";
    badgeText = "Moderate likelihood";
  }

  const reasons = confidence.reasons?.length
    ? `<ul class="offense-summary">${confidence.reasons.map((reason) => `<li>${reason}</li>`).join("")}</ul>`
    : "";

  return `
    <div class="confidence-box">
      <div class="confidence-badge ${badgeClass}">${badgeText}</div>
      <div class="confidence-score">Likelihood based on current information: ${confidence.score}%</div>

      <div class="confidence-bar">
        <div class="confidence-bar-fill ${badgeClass}" style="width: ${confidence.score}%;"></div>
      </div>

      <div>${confidence.label}</div>
      ${reasons}

      <div class="confidence-note">
        This percentage is a confidence estimate based on the information entered and current Ohio rule matching. It is not legal advice or a guaranteed outcome.
      </div>
    </div>
  `;
}

function checkAllEligibility() {
  const resultBox = document.getElementById("result");
  const offenses = collectOffenses();
  const result = evaluateAllOffenses(offenses);

  if (!result.eligible) {
    resultBox.className = "result-bad";
    resultBox.innerHTML = `
      <strong>${result.statusText || "Not Eligible"}</strong><br>
      ${result.reason || "The record is not currently eligible."}
      ${renderConfidence(result.confidence)}
      ${result.sealingAvailable ? `<div style="margin-top:12px;"><strong>Sealing date:</strong> ${result.sealingEligibilityDate}</div>` : ""}
      ${result.expungementAvailable ? `<div><strong>Expungement date:</strong> ${result.expungementEligibilityDate}</div>` : ""}
      ${renderSummary(result.summary)}
      ${renderOffenseSummary(result.offenseResults || [])}
    `;
    return;
  }

  resultBox.className = "result-good";
  resultBox.innerHTML = `
    <strong>${result.statusText}</strong><br>
    ${result.sealingAvailable ? `<div><strong>Sealing date:</strong> ${result.sealingEligibilityDate}</div>` : ""}
    ${result.expungementAvailable ? `<div><strong>Expungement date:</strong> ${result.expungementEligibilityDate}</div>` : ""}
    ${renderConfidence(result.confidence)}
    ${renderSummary(result.summary)}
    ${renderOffenseSummary(result.offenseResults || [])}
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  addOffense();
});
