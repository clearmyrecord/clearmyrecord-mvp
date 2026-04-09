(function () {
  const STORAGE_KEY = "cmr_app_state_v2";

  const defaultState = {
    user: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address1: "",
      address2: "",
      city: "",
      residenceState: "",
      zip: ""
    },
    records: [],
    currentRecordId: null
  };

  function uid() {
    return "rec_" + Math.random().toString(36).slice(2, 10);
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(defaultState);
      return { ...structuredClone(defaultState), ...JSON.parse(raw) };
    } catch (err) {
      console.error("Failed to load app state", err);
      return structuredClone(defaultState);
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
  }

  function getCurrentRecord() {
    if (!appState.currentRecordId) return null;
    return appState.records.find(r => r.id === appState.currentRecordId) || null;
  }

  function upsertCurrentRecord(partial) {
    let record = getCurrentRecord();

    if (!record) {
      record = {
        id: uid(),
        caseState: "",
        filingCourtName: "",
        filingCounty: "",
        caseNumber: "",
        chargeName: "",
        statute: "",
        degree: "",
        outcome: "",
        offenseDate: "",
        dispositionDate: "",
        dischargeDate: "",
        pendingCharges: false,

        // Ohio flags
        isTraffic: false,
        isTheftInOffice: false,
        isFirstOrSecondDegreeFelony: false,
        isSexOffenseRegistry: false,
        victimUnder13: false,
        isFelonyViolenceNonSex: false,
        isDomesticViolenceConviction: false,
        dvMisdemeanorSealable: false,
        totalFelonies: 0,
        totalF3: 0,

        // Nevada flags
        nvCategory: "",
        isCrimeAgainstChild: false,
        isSexOffense: false,
        isFelonyDUI: false,
        isHomeInvasionDeadlyWeapon: false,

        eligibility: null
      };

      appState.records.push(record);
      appState.currentRecordId = record.id;
    }

    Object.assign(record, partial);
    saveState();
    return record;
  }

  function evaluateCurrentRecord() {
    const record = getCurrentRecord();
    if (!record || !window.CMRRules) return null;

    const result = window.CMRRules.evaluateRecordEligibility(record);
    record.eligibility = result;
    saveState();
    return result;
  }

  function boolFromFormValue(form, name) {
    const el = form.querySelector(`[name="${name}"]`);
    return !!(el && el.checked);
  }

  function val(form, name) {
    const el = form.querySelector(`[name="${name}"]`);
    return el ? el.value.trim() : "";
  }

  function num(form, name) {
    const raw = val(form, name);
    return raw === "" ? 0 : Number(raw);
  }

  function bindEligibilityForm() {
    const form = document.querySelector("#eligibility-form");
    if (!form) return;

    const current = getCurrentRecord();
    if (current) {
      populateEligibilityForm(form, current);
      renderEligibilityResult(current.eligibility);
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const record = upsertCurrentRecord({
        caseState: val(form, "caseState").toUpperCase(),
        filingCourtName: val(form, "filingCourtName"),
        filingCounty: val(form, "filingCounty"),
        caseNumber: val(form, "caseNumber"),
        chargeName: val(form, "chargeName"),
        statute: val(form, "statute"),
        degree: val(form, "degree").toUpperCase(),
        outcome: val(form, "outcome"),
        dischargeDate: val(form, "dischargeDate"),
        pendingCharges: boolFromFormValue(form, "pendingCharges"),

        isTraffic: boolFromFormValue(form, "isTraffic"),
        isTheftInOffice: boolFromFormValue(form, "isTheftInOffice"),
        isFirstOrSecondDegreeFelony: boolFromFormValue(form, "isFirstOrSecondDegreeFelony"),
        isSexOffenseRegistry: boolFromFormValue(form, "isSexOffenseRegistry"),
        victimUnder13: boolFromFormValue(form, "victimUnder13"),
        isFelonyViolenceNonSex: boolFromFormValue(form, "isFelonyViolenceNonSex"),
        isDomesticViolenceConviction: boolFromFormValue(form, "isDomesticViolenceConviction"),
        dvMisdemeanorSealable: boolFromFormValue(form, "dvMisdemeanorSealable"),
        totalFelonies: num(form, "totalFelonies"),
        totalF3: num(form, "totalF3"),

        nvCategory: val(form, "nvCategory"),
        isCrimeAgainstChild: boolFromFormValue(form, "isCrimeAgainstChild"),
        isSexOffense: boolFromFormValue(form, "isSexOffense"),
        isFelonyDUI: boolFromFormValue(form, "isFelonyDUI"),
        isHomeInvasionDeadlyWeapon: boolFromFormValue(form, "isHomeInvasionDeadlyWeapon")
      });

      const result = evaluateCurrentRecord();
      renderEligibilityResult(result);

      console.log("Saved record", record);
    });

    const continueBtn = document.querySelector("#eligibility-continue");
    if (continueBtn) {
      continueBtn.addEventListener("click", function () {
        const result = evaluateCurrentRecord();
        renderEligibilityResult(result);
        window.location.href = "record-details.html";
      });
    }
  }

  function populateEligibilityForm(form, record) {
    [
      "caseState",
      "filingCourtName",
      "filingCounty",
      "caseNumber",
      "chargeName",
      "statute",
      "degree",
      "outcome",
      "dischargeDate",
      "nvCategory"
    ].forEach(name => {
      const el = form.querySelector(`[name="${name}"]`);
      if (el) el.value = record[name] || "";
    });

    [
      "pendingCharges",
      "isTraffic",
      "isTheftInOffice",
      "isFirstOrSecondDegreeFelony",
      "isSexOffenseRegistry",
      "victimUnder13",
      "isFelonyViolenceNonSex",
      "isDomesticViolenceConviction",
      "dvMisdemeanorSealable",
      "isCrimeAgainstChild",
      "isSexOffense",
      "isFelonyDUI",
      "isHomeInvasionDeadlyWeapon"
    ].forEach(name => {
      const el = form.querySelector(`[name="${name}"]`);
      if (el) el.checked = !!record[name];
    });

    ["totalFelonies", "totalF3"].forEach(name => {
      const el = form.querySelector(`[name="${name}"]`);
      if (el) el.value = record[name] ?? 0;
    });
  }

  function renderEligibilityResult(result) {
    const box = document.querySelector("#eligibility-result");
    if (!box) return;

    if (!result) {
      box.innerHTML = `<p>No eligibility result yet.</p>`;
      return;
    }

    const reasonsHtml = (result.reasons || [])
      .map(reason => `<li>${escapeHtml(reason)}</li>`)
      .join("");

    box.innerHTML = `
      <div class="result-card status-${escapeHtml(result.status)}">
        <h3>Eligibility Result</h3>
        <p><strong>Case state:</strong> ${escapeHtml(result.state || "Unknown")}</p>
        <p><strong>Status:</strong> ${escapeHtml(result.status)}</p>
        <p><strong>Likely eligible:</strong> ${result.eligible ? "Yes" : "No"}</p>
        <p><strong>Waiting period:</strong> ${escapeHtml(result.waitingPeriod || "N/A")}</p>
        <p><strong>Earliest date:</strong> ${escapeHtml(result.earliestEligibleDate || "N/A")}</p>
        <ul>${reasonsHtml}</ul>
      </div>
    `;
  }

  function bindPacketPage() {
    const packetBox = document.querySelector("#packet-summary");
    if (!packetBox) return;

    const record = getCurrentRecord();

    if (!record) {
      packetBox.innerHTML = `<p>No record found.</p>`;
      return;
    }

    packetBox.innerHTML = `
      <div class="packet-card">
        <h2>Packet Review</h2>

        <p><strong>Residence state:</strong> ${escapeHtml(appState.user.residenceState || "Not entered")}</p>
        <p><strong>Case state:</strong> ${escapeHtml(record.caseState || "Not entered")}</p>
        <p><strong>Filing court:</strong> ${escapeHtml(record.filingCourtName || "Not entered")}</p>
        <p><strong>County:</strong> ${escapeHtml(record.filingCounty || "Not entered")}</p>
        <p><strong>Case number:</strong> ${escapeHtml(record.caseNumber || "Not entered")}</p>
        <p><strong>Charge:</strong> ${escapeHtml(record.chargeName || "Not entered")}</p>
        <p><strong>Outcome:</strong> ${escapeHtml(record.outcome || "Not entered")}</p>

        <hr />

        <h3>Eligibility</h3>
        <p><strong>Evaluated under:</strong> ${escapeHtml(record.eligibility?.state || record.caseState || "Unknown")}</p>
        <p><strong>Status:</strong> ${escapeHtml(record.eligibility?.status || "Not evaluated")}</p>
        <p><strong>Likely eligible:</strong> ${record.eligibility?.eligible ? "Yes" : "No"}</p>
        <p><strong>Waiting period:</strong> ${escapeHtml(record.eligibility?.waitingPeriod || "N/A")}</p>

        <h3>Important Fix</h3>
        <p>This packet is now tied to the <strong>case state</strong>, not the user’s home address.</p>
      </div>
    `;
  }

  function bindUserProfileForm() {
    const form = document.querySelector("#user-profile-form");
    if (!form) return;

    Object.entries(appState.user).forEach(([key, value]) => {
      const el = form.querySelector(`[name="${key}"]`);
      if (el) el.value = value || "";
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      appState.user = {
        firstName: val(form, "firstName"),
        lastName: val(form, "lastName"),
        email: val(form, "email"),
        phone: val(form, "phone"),
        address1: val(form, "address1"),
        address2: val(form, "address2"),
        city: val(form, "city"),
        residenceState: val(form, "residenceState").toUpperCase(),
        zip: val(form, "zip")
      };

      saveState();
      alert("Saved.");
    });
  }

  function escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  const appState = loadState();

  document.addEventListener("DOMContentLoaded", function () {
    bindUserProfileForm();
    bindEligibilityForm();
    bindPacketPage();
  });

  window.CMRApp = {
    state: appState,
    getCurrentRecord,
    upsertCurrentRecord,
    evaluateCurrentRecord
  };
})();
