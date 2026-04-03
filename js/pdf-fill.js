async function fillCourtForm() {
  const data = getApplicantData();

  const existingPdfBytes = await fetch("templates/ohio-wood-county-seal-form.pdf")
    .then(res => res.arrayBuffer());

  const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
  const form = pdfDoc.getForm();

  // Example field mappings
  // These field names must match the actual PDF field names
  trySetText(form, "FullName", data.fullName);
  trySetText(form, "MailingAddress", data.mailingAddress);
  trySetText(form, "County", data.county);
  trySetText(form, "CaseNumber", data.caseNumber);
  trySetText(form, "CourtName", data.courtName);
  trySetText(form, "FinalDischargeDate", data.finalDischargeDate);

  // Example checkbox / radio values
  trySetCheck(form, "FinesPaidYes", data.finesPaid === "Yes");
  trySetCheck(form, "OpenCasesNo", data.openCases === "No");
  trySetCheck(form, "ViolentOffenseNo", data.violentOffense === "No");

  // Optional: flatten so fields become permanent text
  form.flatten();

  const pdfBytes = await pdfDoc.save();
  downloadPdf(pdfBytes, "completed-court-form.pdf");
}

function trySetText(form, fieldName, value) {
  try {
    const field = form.getTextField(fieldName);
    field.setText(value || "");
  } catch (err) {
    console.warn(`Missing or incompatible text field: ${fieldName}`);
  }
}

function trySetCheck(form, fieldName, shouldCheck) {
  try {
    const field = form.getCheckBox(fieldName);
    if (shouldCheck) {
      field.check();
    } else {
      field.uncheck();
    }
  } catch (err) {
    console.warn(`Missing or incompatible checkbox field: ${fieldName}`);
  }
}

function downloadPdf(pdfBytes, filename) {
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
