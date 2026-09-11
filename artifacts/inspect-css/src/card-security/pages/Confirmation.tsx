import { useEffect } from "react";
import { AlertTriangle, CheckCircle, Download, FileText, Info, Printer, RotateCcw, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { browserDateOnly, browserDateTime, downloadAuthorizationPdf } from "@/card-security/lib/browser-document";
import { useAuthorizationSession } from "@/card-security/lib/authorization-session";
import { SharedLayout } from "../components/Layout";

export default function Confirmation() {
  const { completed, clear } = useAuthorizationSession();

  useEffect(() => {
    document.title = completed ? "Completed debt non-authorization declaration" : "Declaration session ended";
  }, [completed]);

  const startNew = () => {
    clear();
    window.location.href = `${import.meta.env.BASE_URL}card-security`;
  };

  if (!completed) {
    return (
      <SharedLayout>
        <div className="flex-1 w-full flex items-center justify-center p-4">
          <div className="max-w-md w-full border border-[#17364a]/25 bg-[#f8f7f2] p-8 shadow-[8px_8px_0_rgba(23,54,74,0.05)] text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-[#b84635] mb-4" />
            <h1 className="display-font text-2xl font-bold text-[#102f43] mb-2">Browser session ended</h1>
            <p className="text-[#4e6666] text-sm font-medium mb-8 leading-relaxed">
              This document existed only in the previous browser session. A refresh, closed tab, or new session clears it. No server record can restore it.
            </p>
            <Button onClick={startNew} className="bg-[#17364a] hover:bg-[#102f43] text-[#e4bd62] font-extrabold uppercase tracking-[.05em] h-12 px-6 rounded-md shadow-[5px_5px_0_#c39b4a] w-full transition-transform active:translate-y-1 active:translate-x-1 active:shadow-[2px_2px_0_#c39b4a]">
              <RotateCcw className="mr-2 h-4 w-4" /> Start a new document
            </Button>
          </div>
        </div>
      </SharedLayout>
    );
  }

  const declarationBody = completed.agreement.termsText
    .split("\n")
    .filter(
      (line) =>
        !/^(Electronic Signature|Date|Disputed Company\/Transaction|Card Brand|Last Four Digits):/.test(
          line.trim(),
        ),
    )
    .join("\n")
    .trim();
  const displayedCardBrand =
    completed.binLookup.status === "available" && completed.binLookup.scheme
      ? completed.binLookup.scheme
      : completed.card.cardBrand;

  return (
    <SharedLayout>
      <div className="inspect-container py-12 flex-1 relative z-10">
        {/* Breadcrumbs */}
        <nav className="text-sm font-medium text-[#4e6666] mb-8 flex items-center gap-2 no-print">
          <a href={import.meta.env.BASE_URL} className="text-[#102f43] hover:text-[#9a6f20] transition-colors">Security Inspection</a>
          <span className="text-[#17364a]/30">›</span>
          <a href={`${import.meta.env.BASE_URL}card-security`} className="text-[#102f43] hover:text-[#9a6f20] transition-colors">Card Security</a>
          <span className="text-[#17364a]/30">›</span>
          <span className="text-[#17364a]">Create Document</span>
        </nav>

        <div className="no-print mb-8">
          <div className="flex items-center gap-3 mb-4 text-[#17364a] font-bold tracking-tight uppercase text-sm">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <span className="text-green-700">Document complete</span>
          </div>
          <h1 className="text-3xl font-bold text-[#102f43] mb-2">Your debt non-authorization declaration is ready</h1>
          <p className="text-lg text-[#4e6666] font-medium">
            Download the PDF or print it now. Keep a copy for your records.
          </p>
        </div>

        <article id="print-document" className="bg-[#f8f7f2] border-2 border-[#17364a]/25 rounded shadow-sm print:border-0 print:shadow-none">
          <div className="border-b-2 border-[#17364a]/25 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <span className="font-bold text-[#102f43] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#17364a] print:hidden" /> Completed debt non-authorization declaration
            </span>
            <div className="flex items-center gap-2 text-sm bg-[#f4f3ee] px-3 py-1.5 border border-[#17364a]/15 rounded">
              <span className="font-bold text-[#4e6666] uppercase tracking-widest text-xs">Local reference</span>
              <span className="font-bold text-[#102f43] font-mono">{completed.referenceId}</span>
            </div>
          </div>

          <div className="p-6 sm:p-8 space-y-8">
            <div className="no-print bg-[#dce7de] border-l-4 border-[#c39b4a] p-4 text-[#102f43] flex items-start gap-3">
              <Info className="w-5 h-5 text-[#17364a] shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold block mb-1">Keep this document</strong>
                <p className="text-sm font-medium leading-relaxed">
                  This is a standalone authorization document, not a payment method and cannot be used to make a charge. The PDF and printed copy contain only masked card details. Only the first six digits were transmitted for the BIN issuer lookup; the full card number, expiry date, and security code were not transmitted, stored in a vault, or sent by email.
                </p>
                <p className="mt-3 text-sm font-medium leading-relaxed">
                  Keep this document as supporting evidence if you need to dispute a debt or transaction that you did not authorize or make. It may help document your position when communicating with the creditor or debt collector.
                </p>
              </div>
            </div>

            <section>
              <h2 className="text-lg font-bold text-[#102f43] border-b border-[#17364a]/15 pb-2 mb-4">Customer and billing information</h2>
              <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                <SummaryField label="Name" value={`${completed.customer.firstName} ${completed.customer.lastName}`} />
                {completed.customer.company && <SummaryField label="Company" value={completed.customer.company} />}
                <SummaryField label="Email" value={completed.customer.email} />
                <SummaryField label="Phone" value={completed.customer.phone} />
                <SummaryField
                  label="Billing address"
                  value={`${completed.customer.address}, ${completed.customer.city}, ${completed.customer.state} ${completed.customer.zip}`}
                />
              </dl>
            </section>

            {completed.customer.personalStatement && (
              <section>
                <h2 className="text-lg font-bold text-[#102f43] border-b border-[#17364a]/15 pb-2 mb-4">Personal statement</h2>
                <p className="whitespace-pre-wrap break-words text-sm">{completed.customer.personalStatement}</p>
              </section>
            )}
            <section>
              <h2 className="text-lg font-bold text-[#102f43] border-b border-[#17364a]/15 pb-2 mb-4">Card identification</h2>
              <dl className="grid sm:grid-cols-3 gap-x-8 gap-y-3 text-sm">
                <SummaryField label="Cardholder" value={completed.card.cardholderName} />
                <SummaryField label="Brand" value={displayedCardBrand} />
                <SummaryField label="Card details" value={`**** ${completed.card.cardLast4}`} />
              </dl>
              <p className="text-xs text-[#4e6666] mt-4">
                Full card number, expiry date, and security code are not retained or included.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#102f43] border-b border-[#17364a]/15 pb-2 mb-4">Declaration and signature</h2>
              <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm mb-5">
                <SummaryField label="Declaration version" value={completed.agreement.termsVersion} />
                <SummaryField label="Accepted" value="Yes" />
                <SummaryField label="Typed signature" value={completed.signatureName} />
                <SummaryField label="Browser time (not server verified)" value={browserDateTime(completed.completedAt)} />
              </dl>
              <div className="border border-[#17364a]/15 rounded bg-[#f4f3ee] p-5">
                <h3 className="font-bold text-[#102f43] mb-3">Debt non-authorization declaration accepted</h3>
                <p className="text-sm text-[#102f43] leading-relaxed whitespace-pre-wrap">{declarationBody}</p>
                <dl className="mt-6 grid gap-x-8 gap-y-4 border-t border-[#17364a]/15 pt-5 sm:grid-cols-2">
                  <SummaryField label="Electronic Signature" value={completed.signatureName} />
                  <SummaryField label="Date" value={browserDateOnly(completed.completedAt)} />
                  <SummaryField label="Disputed Company/Transaction" value={completed.disputedAccountReference} />
                  <SummaryField label="Card Brand" value={displayedCardBrand} />
                  <SummaryField label="Last Four Digits" value={completed.card.cardLast4} />
                </dl>
              </div>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#102f43] border-b border-[#17364a]/15 pb-2 mb-4">Compromised card information</h2>
              {completed.binLookup.status === "available" ? (
                <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                  <SummaryField label="Card scheme" value={completed.binLookup.scheme || completed.card.cardBrand} />
                  <SummaryField label="Data source" value={completed.binLookup.source || "Rotating free BIN lookup"} />
                  <SummaryField label="Card type" value={completed.binLookup.type || "Not available"} />
                  <SummaryField label="Card category" value={completed.binLookup.category || "Not available"} />
                  <SummaryField label="Issuing institution" value={completed.binLookup.bankName || "Not available"} />
                  <SummaryField label="Issuer country" value={completed.binLookup.bankCountry || "Not available"} />
                  <SummaryField label="Issuer phone" value={completed.binLookup.bankPhone || "Not available"} />
                  <SummaryField label="Issuer website" value={completed.binLookup.bankUrl || "Not available"} />
                </dl>
              ) : completed.binLookup.status === "pending" ? (
                <p className="text-sm text-[#4e6666]">
                  Issuer lookup is in progress. These results will update automatically.
                </p>
              ) : (
                <p className="text-sm text-[#4e6666]">
                  {completed.binLookup.message || "Issuer information was not available for this card."}
                </p>
              )}
              <p className="text-xs text-[#4e6666] mt-4">
                This lookup used only the first six card digits. The full card number was not transmitted.
              </p>
            </section>

          </div>
        </article>

        <div className="no-print mt-6 flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => downloadAuthorizationPdf(completed)}
            disabled={completed.binLookup.status === "pending"}
            className="flex-1 bg-[#17364a] hover:bg-[#102f43] text-[#e4bd62] font-extrabold uppercase tracking-[.05em] h-12 rounded-md shadow-[5px_5px_0_#c39b4a] flex items-center justify-center transition-transform active:translate-y-1 active:translate-x-1 active:shadow-[2px_2px_0_#c39b4a]"
          >
            <Download className="mr-2 h-5 w-5" /> {completed.binLookup.status === "pending" ? "Preparing issuer details…" : "Download PDF"}
          </Button>
          <Button
            onClick={() => window.print()}
            disabled={completed.binLookup.status === "pending"}
            className="flex-1 bg-[#f8f7f2] hover:bg-[#eef1eb] text-[#17364a] border-2 border-[#17364a] font-extrabold uppercase tracking-[.05em] h-12 rounded-md flex items-center justify-center shadow-[3px_3px_0_#17364a] transition-transform active:translate-y-1 active:translate-x-1 active:shadow-[1px_1px_0_#17364a]"
          >
            <Printer className="mr-2 h-5 w-5" /> {completed.binLookup.status === "pending" ? "Preparing issuer details…" : "Print"}
          </Button>
        </div>

        <div className="no-print mt-6 bg-[#f8f7f2] border border-[#17364a]/25 p-5 text-center text-sm text-[#4e6666] shadow-sm rounded">
          <p className="mb-2">Documenting a disputed charge or potential scam?</p>
          <a href={`${import.meta.env.BASE_URL}report-fraud`} className="text-[#17364a] font-bold hover:text-[#9a6f20] inline-flex items-center justify-center transition-colors">
            Use the Report a Fraud tool to organize your incident details <ArrowRight className="ml-1 w-4 h-4" />
          </a>
        </div>

        <div className="no-print mt-8 text-center">
          <Button variant="link" className="text-[#17364a] font-bold" onClick={startNew}>
            <RotateCcw className="mr-2 h-4 w-4" /> Start a new document
          </Button>
        </div>
      </div>
    </SharedLayout>
  );
}

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold text-[#4e6666] uppercase tracking-widest mb-1">{label}</dt>
      <dd className="font-medium text-[#102f43]">{value}</dd>
    </div>
  );
}