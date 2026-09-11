import type { CompletedAuthorization } from "./authorization-session";

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

export function downloadAuthorizationPdf(authorization: CompletedAuthorization) {
  const { customer, card, agreement } = authorization;
  const pageOne: Array<{ text: string; size?: number }> = [
    { text: authorization.businessName, size: 18 },
    { text: "Debt non-authorization declaration", size: 12 },
    { text: "Not a chargeable payment method", size: 10 },
    { text: "" },
    { text: "COMPLETED DEBT NON-AUTHORIZATION DECLARATION", size: 15 },
    { text: `Reference ID: ${authorization.referenceId}` },
    { text: `Browser completion time: ${browserDateTime(authorization.completedAt)}` },
    { text: "Time is shown from this browser and is not server verified." },
    { text: "" },
    { text: "Customer information", size: 13 },
    { text: `Name: ${customer.firstName} ${customer.lastName}` },
    ...(customer.company ? [{ text: `Company: ${customer.company}` }] : []),
    { text: `Email: ${customer.email}` },
    { text: `Phone: ${customer.phone}` },
    ...(customer.personalStatement ? [{ text: "Personal statement" }, { text: customer.personalStatement }] : []),
    { text: `Address: ${customer.address}, ${customer.city}, ${customer.state} ${customer.zip}` },
    { text: "" },
    { text: "Card identification", size: 13 },
    { text: `Cardholder: ${card.cardholderName}` },
    { text: `Brand: ${card.cardBrand}` },
    { text: `Card details: **** ${card.cardLast4}` },
    { text: "Only the card brand and last four digits are included. Full card details are not included." },
    { text: "" },
    { text: "Declaration and signature", size: 13 },
    { text: `Declaration version: ${agreement.termsVersion}` },
    { text: "Accepted: Yes" },
    { text: `Typed signature: ${authorization.signatureName}` },
    { text: `Accepted in browser at: ${browserDateTime(agreement.acceptedAt)}` },
    { text: "" },
    { text: "This document was completed in this browser only. It was not submitted to a server, saved to a vault, or sent by email." },
  ];

  const termLines = wrapText(agreement.termsText);
  const pageSize = 47;
  const pages: Array<Array<{ text: string; size?: number }>> = [pageOne];
  for (let index = 0; index < termLines.length; index += pageSize) {
    pages.push([
      { text: "DEBT NON-AUTHORIZATION DECLARATION ACCEPTED", size: 15 },
      { text: `Declaration version: ${agreement.termsVersion}` },
      { text: "" },
      ...termLines.slice(index, index + pageSize).map((text) => ({ text })),
    ]);
  }

  const bytes = createPdfBytes(pages);
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `Debt_Non_Authorization_${authorization.referenceId}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}