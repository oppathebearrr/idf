import type { FraudReportCompleted } from "./fraud-session";

function safePdfText(value: string) {
  return value
    .replace(/\r/g, "")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[—–]/g, "-")
    .replace(/☐/g, "[ ]")
    .replace(/[^\x20-\x7e\n\t]/g, "?");
}

function escapePdfText(value: string) {
  return safePdfText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrapText(value: string, width = 92) {
  const lines: string[] = [];
  for (const paragraph of safePdfText(value).split("\n")) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }
    const words = paragraph.split(/\s+/);
    let line = "";
    for (const word of words) {
      if (!line) {
        line = word;
      } else if (`${line} ${word}`.length <= width) {
        line += ` ${word}`;
      } else {
        lines.push(line);
        line = word;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}

function contentStream(lines: Array<{ text: string; size?: number }>) {
  let y = 742;
  const commands = ["BT"];
  for (const line of lines) {
    const size = line.size ?? 10;
    commands.push(`/F1 ${size} Tf 1 0 0 1 54 ${y} Tm (${escapePdfText(line.text)}) Tj`);
    y -= size >= 16 ? 25 : 14;
  }
  commands.push("ET");
  return commands.join("\n");
}

function createPdfBytes(pages: Array<Array<{ text: string; size?: number }>>) {
  const objects: string[] = [];
  objects.push("<< /Type /Catalog /Pages 2 0 R >>");
  objects.push("");
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  const pageRefs: string[] = [];
  pages.forEach((lines, index) => {
    const pageObjectNumber = 4 + index * 2;
    const contentObjectNumber = pageObjectNumber + 1;
    pageRefs.push(`${pageObjectNumber} 0 R`);
    const stream = contentStream(lines);
    const streamLength = new TextEncoder().encode(stream).length;
    objects.push(
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`,
    );
    objects.push(`<< /Length ${streamLength} >>\nstream\n${stream}\nendstream`);
  });
  objects[1] = `<< /Type /Pages /Kids [${pageRefs.join(" ")}] /Count ${pages.length} >>`;

  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(new TextEncoder().encode(pdf).length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = new TextEncoder().encode(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let index = 1; index < offsets.length; index += 1) {
    pdf += `${String(offsets[index]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  return new TextEncoder().encode(pdf);
}

export function browserDateTime(isoDate: string) {
  return new Date(isoDate).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function downloadFraudReportPdf(report: FraudReportCompleted) {
  const { incident, narrative, financial, evidence, reporter } = report;
  const pageOne: Array<{ text: string; size?: number }> = [
    { text: "FRAUD INCIDENT SUMMARY", size: 18 },
    { text: "Security Inspection - Local Document", size: 12 },
    { text: "NOT AN OFFICIAL GOVERNMENT REPORT", size: 10 },
    { text: "" },
    { text: `Reference ID: ${report.referenceId}` },
    { text: `Browser completion time: ${browserDateTime(report.completedAt)}` },
    { text: "Time is shown from this browser and is not server verified." },
    { text: "" },
    { text: "Incident details", size: 13 },
    { text: `Date of incident: ${incident.incidentDate}` },
    { text: `Type of fraud: ${incident.incidentType}` },
    { text: `Method of contact: ${incident.contactChannel}` },
    { text: "" },
    { text: "Financial impact", size: 13 },
    { text: `Amount lost: ${financial.amountLost || "None / Not specified"}` },
    { text: `Payment method: ${financial.paymentMethod || "N/A"}` },
    { text: `Affected institutions: ${financial.affectedAccounts || "None"}` },
    { text: "" },
    { text: "Evidence collected", size: 13 },
    { text: `Has screenshots: ${evidence.hasScreenshots ? 'Yes' : 'No'}` },
    { text: `Has emails: ${evidence.hasEmails ? 'Yes' : 'No'}` },
    { text: `Has receipts: ${evidence.hasReceipts ? 'Yes' : 'No'}` },
    { text: `Additional notes: ${evidence.additionalNotes || 'None'}` },
    { text: "" },
    { text: "Reporter contact", size: 13 },
    { text: `Name: ${reporter.firstName} ${reporter.lastName}` },
    { text: `Email: ${reporter.email}` },
    { text: `Phone: ${reporter.phone}` },
    { text: `Address: ${[
      reporter.addressLine1,
      reporter.addressLine2,
      `${reporter.city}, ${reporter.state} ${reporter.postalCode}`,
    ].filter(Boolean).join(", ")}` },
    { text: "" },
    { text: "This document was generated in this browser only. It was not submitted to a server or agency." },
  ];

  const termLines = wrapText(narrative.description || "No narrative provided.");
  const pageSize = 47;
  const pages: Array<Array<{ text: string; size?: number }>> = [pageOne];
  for (let index = 0; index < termLines.length; index += pageSize) {
    pages.push([
      { text: "INCIDENT NARRATIVE", size: 15 },
      { text: `Suspect Name/Alias: ${narrative.suspectName}` },
      { text: `Suspect Contact Info: ${narrative.suspectContact}` },
      { text: "" },
      ...termLines.slice(index, index + pageSize).map((text) => ({ text })),
    ]);
  }

  const bytes = createPdfBytes(pages);
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `Fraud_Incident_Summary_${report.referenceId}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}