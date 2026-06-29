import { jsPDF } from "jspdf";

const PAGE_WIDTH = 190;
const LINE_HEIGHT = 7;
const TOP_MARGIN = 10;
const BOTTOM_MARGIN = 280;

export const generatePDF = (journalEntry) => {
  const doc = new jsPDF();
  const lines = doc.splitTextToSize(journalEntry, PAGE_WIDTH);

  let y = TOP_MARGIN;
  lines.forEach((line) => {
    if (y > BOTTOM_MARGIN) {
      doc.addPage();
      y = TOP_MARGIN;
    }
    doc.text(line, 10, y);
    y += LINE_HEIGHT;
  });

  doc.save('shadow-works-journal-entry.pdf');
};
