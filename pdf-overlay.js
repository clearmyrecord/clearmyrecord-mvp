async function fillFlatCourtForm() {
  const data = {
    fullName: "Matt Tunstall",
    caseNumber: "2006CR0387",
    date: "12/10/2010"
  };

  const existingPdfBytes = await fetch("templates/your-court-form.pdf")
    .then(res => res.arrayBuffer());

  const pdfDoc = await PDFLib.PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();
  const page = pages[0];

  // 🔥 YOU WILL ADJUST THESE COORDINATES
  page.drawText(data.fullName, {
    x: 120,
    y: 680,
    size: 12
  });

  page.drawText(data.caseNumber, {
    x: 120,
    y: 640,
    size: 12
  });

  page.drawText(data.date, {
    x: 120,
    y: 600,
    size: 12
  });

  const pdfBytes = await pdfDoc.save();

  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "completed-form.pdf";
  a.click();

  URL.revokeObjectURL(url);
}
