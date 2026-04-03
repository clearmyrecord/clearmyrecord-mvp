let offenseCount = 0;

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
        <label>Charge</label>
        <select id="charge-${id}" onchange="applyChargeDefaults(${id})">
          <option value="">Select charge</option>
          ${chargeLibrary.map(c => `<option value="${c.id}">${c.label}</option>`).join("")}
        </select>
      </div>

      <div class="form-field">
        <label>Outcome</label>
        <select id="outcome-${id}">
          <option value="conviction">Conviction</option>
          <option value="dismissed">Dismissed</option>
          <option value="not_guilty">Not Guilty</option>
          <option value="no_billed">No Billed</option>
        </select>
      </div>

      <div class="form-field">
        <label>Category</label>
        <select id="category-${id}">
          <option value="misdemeanor">Misdemeanor</option>
          <option value="felony">Felony</option>
        </select>
      </div>

      <div class="form-field">
        <label>Level</label>
        <select id="level-${id}">
          <option value="">Select</option>
        </select>
      </div>

      <div class="form-field">
        <label>Date</label>
        <input type="date" id="date-${id}" />
      </div>
    </div>
  `;

  container.appendChild(wrapper);
}

function applyChargeDefaults(id) {
  const chargeId = document.getElementById(`charge-${id}`).value;
  const charge = getChargeById(chargeId);

  if (!charge) return;

  document.getElementById(`category-${id}`).value = charge.category;

  const levelSelect = document.getElementById(`level-${id}`);
  levelSelect.innerHTML = `<option value="${charge.defaultLevel}">${charge.defaultLevel}</option>`;
}

function removeOffense(id) {
  document.getElementById(`offense-${id}`)?.remove();
}

function collectOffenses() {
  const offenses = [];

  for (let i = 0; i < offenseCount; i++) {
    if (!document.getElementById(`charge-${i}`)) continue;

    offenses.push({
      state: "ohio",
      chargeId: document.getElementById(`charge-${i}`).value,
      outcome: document.getElementById(`outcome-${i}`).value,
      category: document.getElementById(`category-${i}`).value,
      level: document.getElementById(`level-${i}`).value,
      date: document.getElementById(`date-${i}`).value
    });
  }

  return offenses;
}

function checkAllEligibility() {
  const offenses = collectOffenses();
  const result = evaluateAllOffenses(offenses);

  document.getElementById("result").innerHTML = `
    <strong>${result.eligible ? "Eligible" : "Not Eligible"}</strong><br>
    ${result.reason || ""}
    <br><br>
    Likelihood: ${result.confidence?.score || 0}%
  `;
}

document.addEventListener("DOMContentLoaded", () => {
  addOffense();
});
