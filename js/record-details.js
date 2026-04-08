(function () {
  const offenseList = document.getElementById("offenseList");
  const addOffenseBtn = document.getElementById("addOffenseBtn");
  const continueBtn = document.getElementById("continueBtn");
  const emptyState = document.getElementById("emptyState");
  const recordStatus = document.getElementById("recordStatus");

  const fallbackCharges = [
    "DUI",
    "OVI",
    "Assault",
    "Domestic Violence",
    "Drug Possession",
    "Disorderly Conduct",
    "Petty Theft",
    "Theft",
    "Burglary",
    "Criminal Trespass",
    "Receiving Stolen Property",
    "Resisting Arrest",
    "Menacing",
    "Driving Under Suspension"
  ];

  const dispositionOptions = [
    "Dismissed",
    "Not Guilty",
    "Guilty",
    "No Contest",
    "Deferred",
    "Reduced",
    "Vacated",
    "Sealed",
    "Expunged"
  ];

  const levelOptions = [
    "Misdemeanor",
    "Felony",
    "Infraction",
    "Traffic",
    "Minor Misdemeanor",
    "Citation"
  ];

  const caseTypeOptions = [
    "Criminal",
    "Traffic",
    "Misdemeanor",
    "Felony",
    "Municipal",
    "County",
    "Common Pleas"
  ];

  const courtOptions = [
    "Municipal Court",
    "County Court",
    "Common Pleas Court",
    "District Court",
    "Justice Court"
  ];

  const countyOptions = [
    "Allen County",
    "Clark County",
    "Cuyahoga County",
    "Franklin County",
    "Hamilton County",
    "Lucas County",
    "Montgomery County",
    "Summit County",
    "Wood County"
  ];

  let offenseCounter = 0;
  let openBox = null;

  function normalizeChargeLibrary() {
    try {
      if (!Array.isArray(window.CHARGES)) return fallbackCharges.slice();

      const values = window.CHARGES
        .map((item) => {
          if (typeof item === "string") return item.trim();
          if (item && typeof item.name === "string") return item.name.trim();
          if (item && typeof item.charge === "string") return item.charge.trim();
          if (item && typeof item.title === "string") return item.title.trim();
          return "";
        })
        .filter(Boolean);

      return values.length ? unique(values) : fallbackCharges.slice();
    } catch (error) {
      console.error("Unable to load charges library:", error);
      return fallbackCharges.slice();
    }
  }

  function unique(list) {
    return Array.from(new Set(list));
  }

  const chargeLibrary = normalizeChargeLibrary();

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function closeSuggestions() {
    if (openBox) {
      openBox.style.display = "none";
      openBox.innerHTML = "";
      openBox = null;
    }
  }

  function updateStatus() {
    const count = offenseList.querySelectorAll(".rd-offense").length;
    emptyState.hidden = count !== 0;

    if (count === 0) {
      recordStatus.textContent = "No offenses added";
    } else if (count === 1) {
      recordStatus.textContent = "1 offense added";
    } else {
      recordStatus.textContent = `${count} offenses added`;
    }
  }

  function renumberOffenses() {
    const cards = offenseList.querySelectorAll(".rd-offense");
    cards.forEach((card, index) => {
      const title = card.querySelector(".rd-offense-head h2");
      if (title) title.textContent = `Offense ${index + 1}`;
    });
  }

  function bindSuggestions(input, box, list) {
    let activeIndex = -1;
    let matches = [];

    function render(nextMatches) {
      matches = nextMatches;
      activeIndex = -1;

      if (!matches.length) {
        box.style.display = "none";
        box.innerHTML = "";
        if (openBox === box) openBox = null;
        return;
      }

      box.innerHTML = matches
        .map((item) => `<div class="rd-suggestion">${escapeHtml(item)}</div>`)
        .join("");

      box.style.display = "block";
      openBox = box;

      const items = box.querySelectorAll(".rd-suggestion");
      items.forEach((item, index) => {
        item.addEventListener("mousedown", function (event) {
          event.preventDefault();
          choose(index);
        });
      });
    }

    function choose(index) {
      if (index < 0 || index >= matches.length) return;
      input.value = matches[index];
      box.style.display = "none";
      box.innerHTML = "";
      if (openBox === box) openBox = null;
    }

    function filter(value) {
      const query = value.trim().toLowerCase();

      if (!query) {
        render([]);
        return;
      }

      const startsWith = [];
      const includes = [];

      list.forEach((item) => {
        const text = String(item);
        const lower = text.toLowerCase();

        if (lower.startsWith(query)) {
          startsWith.push(text);
        } else if (lower.includes(query)) {
          includes.push(text);
        }
      });

      render([...startsWith, ...includes].slice(0, 8));
    }

    input.addEventListener("input", function () {
      filter(input.value);
    });

    input.addEventListener("focus", function () {
      if (input.value.trim()) filter(input.value);
    });

    input.addEventListener("keydown", function (event) {
      const items = Array.from(box.querySelectorAll(".rd-suggestion"));
      if (!items.length) return;

      if (event.key === "ArrowDown") {
        event.preventDefault();
        activeIndex = (activeIndex + 1) % items.length;
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        activeIndex = activeIndex <= 0 ? items.length - 1 : activeIndex - 1;
      } else if (event.key === "Enter") {
        if (activeIndex >= 0) {
          event.preventDefault();
          choose(activeIndex);
        }
        return;
      } else if (event.key === "Escape") {
        box.style.display = "none";
        box.innerHTML = "";
        if (openBox === box) openBox = null;
        return;
      } else {
        return;
      }

      items.forEach((item, index) => {
        item.classList.toggle("active", index === activeIndex);
      });
    });

    input.addEventListener("blur", function () {
      setTimeout(function () {
        box.style.display = "none";
        box.innerHTML = "";
        if (openBox === box) openBox = null;
      }, 140);
    });
  }

  function makeTextField(config) {
    const wrapper = document.createElement("div");
    wrapper.className = `rd-field${config.full ? " rd-field-full" : ""}`;

    const inputId = `${config.name}-${Math.random().toString(36).slice(2, 9)}`;

    wrapper.innerHTML = `
      <label for="${inputId}">${escapeHtml(config.label)}</label>
      <input
        id="${inputId}"
        name="${escapeHtml(config.name)}"
        type="${escapeHtml(config.type || "text")}"
        placeholder="${escapeHtml(config.placeholder || "")}"
        autocomplete="off"
      />
      ${config.suggestions ? '<div class="rd-suggestions"></div>' : ""}
      ${config.helper ? `<div class="rd-helper">${escapeHtml(config.helper)}</div>` : ""}
    `;

    if (config.suggestions) {
      const input = wrapper.querySelector("input");
      const box = wrapper.querySelector(".rd-suggestions");
      bindSuggestions(input, box, config.suggestions);
    }

    return wrapper;
  }

  function makeTextareaField(config) {
    const wrapper = document.createElement("div");
    wrapper.className = `rd-field${config.full ? " rd-field-full" : ""}`;

    const inputId = `${config.name}-${Math.random().toString(36).slice(2, 9)}`;

    wrapper.innerHTML = `
      <label for="${inputId}">${escapeHtml(config.label)}</label>
      <textarea
        id="${inputId}"
        name="${escapeHtml(config.name)}"
        placeholder="${escapeHtml(config.placeholder || "")}"
      ></textarea>
    `;

    return wrapper;
  }

  function buildOffenseCard(index) {
    const card = document.createElement("section");
    card.className = "rd-offense";

    const head = document.createElement("div");
    head.className = "rd-offense-head";
    head.innerHTML = `
      <h2>Offense ${index + 1}</h2>
      <button type="button" class="rd-btn rd-btn-secondary remove-offense-btn">Remove</button>
    `;

    const grid = document.createElement("div");
    grid.className = "rd-grid";

    grid.appendChild(
      makeTextField({
        label: "Charge Name",
        name: `charge_name_${index}`,
        placeholder: "Start typing a charge",
        suggestions: chargeLibrary,
        helper: "Suggestions are pulled from your charge library."
      })
    );

    grid.appendChild(
      makeTextField({
        label: "Disposition / Outcome",
        name: `disposition_${index}`,
        placeholder: "Start typing a disposition",
        suggestions: dispositionOptions
      })
    );

    grid.appendChild(
      makeTextField({
        label: "Charge Level",
        name: `charge_level_${index}`,
        placeholder: "Start typing a level",
        suggestions: levelOptions
      })
    );

    grid.appendChild(
      makeTextField({
        label: "Case Type",
        name: `case_type_${index}`,
        placeholder: "Start typing a case type",
        suggestions: caseTypeOptions
      })
    );

    grid.appendChild(
      makeTextField({
        label: "Court",
        name: `court_${index}`,
        placeholder: "Start typing a court",
        suggestions: courtOptions
      })
    );

    grid.appendChild(
      makeTextField({
        label: "County",
        name: `county_${index}`,
        placeholder: "Start typing a county",
        suggestions: countyOptions
      })
    );

    grid.appendChild(
      makeTextField({
        label: "Arrest Date",
        name: `arrest_date_${index}`,
        type: "date"
      })
    );

    grid.appendChild(
      makeTextField({
        label: "Case Number",
        name: `case_number_${index}`,
        placeholder: "Optional"
      })
    );

    grid.appendChild(
      makeTextareaField({
        label: "Notes",
        name: `notes_${index}`,
        placeholder: "Anything else about this offense...",
        full: true
      })
    );

    card.appendChild(head);
    card.appendChild(grid);

    const removeBtn = card.querySelector(".remove-offense-btn");
    removeBtn.addEventListener("click", function () {
      card.remove();
      renumberOffenses();
      updateStatus();
    });

    return card;
  }

  function addOffense() {
    const card = buildOffenseCard(offenseCounter);
    offenseCounter += 1;
    offenseList.appendChild(card);
    updateStatus();

    const firstInput = card.querySelector("input, textarea");
    if (firstInput) firstInput.focus();
  }

  function collectData() {
    const cards = Array.from(offenseList.querySelectorAll(".rd-offense"));

    return cards.map((card) => {
      const data = {};
      const fields = card.querySelectorAll("input, textarea");

      fields.forEach((field) => {
        data[field.name] = field.value.trim();
      });

      return data;
    });
  }

  addOffenseBtn.addEventListener("click", addOffense);

  continueBtn.addEventListener("click", function () {
    const data = collectData();

    try {
      sessionStorage.setItem("recordPath_recordDetails", JSON.stringify(data));
    } catch (error) {
      console.warn("Could not save record details.", error);
    }

    window.location.href = "packet.html";
  });

  document.addEventListener("click", function (event) {
    if (!event.target.closest(".rd-field")) {
      closeSuggestions();
    }
  });

  addOffense();
  updateStatus();
})();
