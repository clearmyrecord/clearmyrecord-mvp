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

function setStatus(message, type = "") {
  const box = document.getElementById("statusBox");
  if (!box) return;

  box.className = "status";
  if (type) {
    box.classList.add(type);
  }
  box.textContent = message;
}

function populateOffenseTypeOptions() {
  const select = document.getElementById("offenseType");
  if (!select || !window.chargeLibrary) return;

  const sortedCharges = [...chargeLibrary].sort((a, b) =>
    a.label.localeCompare(b.label)
  );

  select.innerHTML = '<option value="">Select offense type</option>';

  sortedCharges.forEach((charge) => {
    const option = document.createElement("option");
    option.value = charge.id;
    option.textContent = charge.label;
    select.appendChild(option);
  });
}

function prefillApplicantProfile() {
  const profile = getApplicantProfile();

  const fullName = document.getElementById("fullName");
  const email = document.getElementById("email");
  const mailingAddress = document.getElementById("mailingAddress");
  const state = document.getElementById("state");
  const offenseType = document.getElementById("offenseType");

  if (fullName) fullName.value = profile.fullName || "";
  if (email) email.value = profile.email || "";
  if (mailingAddress) mailingAddress.value = profile.mailingAddress || "";
  if (state) state.value = profile.state || "ohio";
  if (offenseType) offenseType.value = profile.intakeOffenseType || "";
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
  const profile = {
    fullName: document.getElementById("fullName")?.value.trim() || "",
    email: document.getElementById("email")?.value.trim() || "",
    mailingAddress: document.getElementById("mailingAddress")?.value.trim() || "",
    state: document.getElementById("state")?.value || "ohio",
    intakeOffenseType: document.getElementById("offenseType")?.value || ""
  };

  const validationError = validateIntake(profile);
  if (validationError) {
    setStatus(validationError, "error");
    return;
  }

  saveApplicantProfile(profile);
  setStatus("Saved. Moving to record details...", "success");

  window.location.href = "record-details.html";
}

document.addEventListener("DOMContentLoaded", () => {
  populateOffenseTypeOptions();
  prefillApplicantProfile();

  const nextBtn = document.getElementById("nextBtn");
  if (nextBtn) {
    nextBtn.addEventListener("click", handleNextStep);
  }
});
