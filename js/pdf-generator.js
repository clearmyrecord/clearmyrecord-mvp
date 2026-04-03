async function loadPdfLib() {
  if (window.PDFLib) return;

  await new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://unpkg.com/pdf-lib/dist/pdf-lib.min.js";
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function getStoredResults() {
  try {
    return JSON.parse(localStorage.getItem("cmrResults")) || null;
  } catch (error) {
    return null;
  }
}

function getStoredApplicantProfile() {
  try {
    return JSON.parse(localStorage.getItem("cmrApplicantProfile")) || {};
  } catch (error) {
    return {};
  }
}

function buildCourtFormData() {
  const results = getStoredResults();
  const profile = getStoredApplicantProfile();

  if (!results) {
    throw new Error("No saved result found. Run the calculator first.");
  }

  const offenseResults = results.offenseResults || [];
  const caseNumbers = offenseResults
    .map((offense) => offense.caseNumber)
    .filter(Boolean)
    .join(", ");

  const latestDischarge = offenseResults
    .map((offense) => offense.dischargeDate)
    .filter(Boolean)
    .sort()
    .slice(-1)[0] || "";

  let filingRequest = "";
  if (results.sealingAvailable && results.expungementAvailable) {
    filingRequest = "Sealing and Expungement";
  } else if (results.sealingAvailable) {
    filingRequest = "Sealing";
  } else if (results.expungementAvailable) {
    filingRequest = "Expungement";
  } else {
    filingRequest = "No relief path currently identified";
  }

  return {
    applicantName: profile.fullName || "Applicant Name",
    courtName: profile.courtName || "Court Name",
    caseNumbers: caseNumbers || "Case Number(s)",
    dischargeDate: latestDischarge || "",
    filingRequest
  };
}

async function downloadPdfBytes(pdfBytes, filename) {
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

async function generateOverlayPdf(configId) {
  await loadPdfLib();

  const config = courtFormConfigs[configId];
  if (!config) {
    throw new Error("Court form configuration not found.");
  }

  const data = buildCourtFormData();

  const existingPdfBytes = await fetch(config.pdfUrl).then((res) => {
    if (!res.ok) {
      throw new Error(`Could not load template: ${config.pdfUrl}`);
    }
    return res.arrayBuffer();
  });

  const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();

  config.fields.forEach((field) => {
    const page = pages[field.page];
    if (!page) return;

    const value = data[field.key] || "";

    page.drawText(String(value), {
      x: field.x,
      y: field.y,
      size: field.size || 11
    });
  });

  const pdfBytes = await pdfDoc.save();
  await downloadPdfBytes(pdfBytes, config.filename);
}

async function generateFillablePdf(configId) {
  await loadPdfLib();

  const config = courtFormConfigs[configId];
  if (!config) {
    throw new Error("Court form configuration not found.");
  }

  const data = buildCourtFormData();

  const existingPdfBytes = await fetch(config.pdfUrl).then((res) => {
    if (!res.ok) {
      throw new Error(`Could not load template: ${config.pdfUrl}`);
    }
    return res.arrayBuffer();
  });

  const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
  const form = pdfDoc.getForm();

  (config.fields || []).forEach((field) => {
    try {
      const textField = form.getTextField(field.pdfFieldName);
      textField.setText(String(data[field.key] || ""));
    } catch (error) {
      console.warn("Missing field:", field.pdfFieldName);
    }
  });

  form.flatten();

  const pdfBytes = await pdfDoc.save();
  await downloadPdfBytes(pdfBytes, config.filename);
}

async function generateCourtReadyPdf(configId) {
  const config = courtFormConfigs[configId];
  if (!config) {
    alert("Court form configuration not found.");
    return;
  }

  try {
    if (config.mode === "fillable") {
      await generateFillablePdf(configId);
    } else {
      await generateOverlayPdf(configId);
    }
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}
