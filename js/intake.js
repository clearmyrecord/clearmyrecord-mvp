function getApplicantProfile() {
  try {
    return JSON.parse(localStorage.getItem("cmrApplicantProfile")) || {};
  } catch (error) {
    return {};
  }
}

function saveApplicantProfile(profile) {
  localStorage.setItem("cmrApplicantProfile", JSON.stringify(profile));
}

function setStatus(message, type) {
  var box = document.getElementById("statusBox");
  if (!box) return;

  box.className = "status";
  if (type) {
    box.classList.add(type);
  }
  box.textContent = message;
}

function getAvailableCharges() {
  if (window.chargeLibrary && Array.isArray(window.chargeLibrary) && window.chargeLibrary.length) {
    return window.chargeLibrary;
  }

  if (window.cmrFallbackCharges && Array.isArray(window.cmrFallbackCharges) && window.cmrFallbackCharges.length) {
    return window.cmrFallbackCharges;
  }

  return [];
}

function populateOffenseTypeOptions() {
  var select = document.getElementById("offenseType");
  if (!select) return;

  var charges = getAvailableCharges();

  if (!charges.length) {
    select.innerHTML = '<option value="">No charges available</option>';
    setStatus("No charges are available. The charge file or fallback list did not load.", "error");
    return;
  }

  var sortedCharges = charges.slice().sort(function (a, b) {
    return a.label.localeCompare(b.label);
  });

  select.innerHTML = '<option value="">Select offense type</option>';

  sortedCharges.forEach(function (charge) {
    var option = document.createElement("option");
    option.value = charge.id;
    option.textContent = charge.label;
    select.appendChild(option);
  });

  if (!(window.chargeLibrary && Array.isArray(window.chargeLibrary) && window.chargeLibrary.length)) {
    setStatus("Using built-in fallback charge list for Step 1.", "success");
  }
}

function prefillApplicantProfile() {
  var profile = getApplicantProfile();

  var fullName = document.getElementById("fullName");
  var email = document.getElementById("email");
  var mailingAddress = document.getElementById("mailingAddress");
  var state = document.getElementById("state");
  var offenseType = document.getElementById("offenseType");

  if (fullName) fullName.value = profile.fullName || "";
  if (email) email.value = profile.email || "";
  if (mailingAddress) mailingAddress.value = profile.mailingAddress || "";
  if (state) state.value = profile.state || "ohio";
  if (offenseType && profile.intakeOffenseType) {
    offenseType.value = profile.intakeOffenseType;
  }
}

function validateIntake(profile) {
  if (!profile.fullName.trim()) {
    return "Please enter your full name.";
  }

  if (!profile.email.trim()) {
    return "Please enter your email.";
  }

  if (!profile.mailingAddress.trim()) {
    return "Please enter your mailing address.";
  }

  if (!profile.state.trim()) {
    return "Please select a state.";
  }

  if (!profile.intakeOffenseType.trim()) {
    return "Please select an offense type.";
  }

  return "";
}

function handleNextStep() {
  var profile = {
    fullName: document.getElementById("fullName").value.trim(),
    email: document.getElementById("email").value.trim(),
    mailingAddress: document.getElementById("mailingAddress").value.trim(),
    state: document.getElementById("state").value,
    intakeOffenseType: document.getElementById("offenseType").value
  };

  var validationError = validateIntake(profile);
  if (validationError) {
    setStatus(validationError, "error");
    return;
  }

  saveApplicantProfile(profile);
  setStatus("Saved. Moving to record details...", "success");
  window.location.href = "record-details.html";
}

document.addEventListener("DOMContentLoaded", function () {
  populateOffenseTypeOptions();
  prefillApplicantProfile();

  var nextBtn = document.getElementById("nextBtn");
  if (nextBtn) {
    nextBtn.addEventListener("click", handleNextStep);
  }
});
