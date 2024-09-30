import { jsPDF } from "jspdf";

export const generatePDF = (journalEntry) => {
  const doc = new jsPDF();
  doc.text(journalEntry, 10, 10);
  doc.save('shadow-works-journal-entry.pdf');
};
