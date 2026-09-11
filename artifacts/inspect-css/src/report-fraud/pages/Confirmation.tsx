import { useEffect } from "react";
import { AlertTriangle, CheckCircle, Download, FileText, Printer, RotateCcw, ExternalLink, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { browserDateTime, downloadFraudReportPdf } from "../lib/browser-document";
import { useFraudSession } from "../lib/fraud-session";
import { SharedLayout } from "../components/Layout";
import { Link } from "wouter";

export default function Confirmation() {
  const { completed, clear } = useFraudSession();

  useEffect(() => {
    document.title = completed ? "Completed incident summary" : "Session ended";
  }, [completed]);

  const startNew = () => {
    clear();
    window.location.href = `${import.meta.env.BASE_URL}report-fraud`;
  };

  if (!completed) {
    return (
      <SharedLayout>
        <div className="flex-1 w-full flex items-center justify-center p-4">
          <div className="max-w-md w-full border border-[#17364a]/25 bg-[#f8f7f2] p-8 shadow-[8px_8px_0_rgba(23,54,74,0.05)] text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-[#b84635] mb-4" />
            <h1 className="display-font text-2xl font-bold text-[#102f43] mb-2">Session ended</h1>
            <p className="text-[#4e6666] text-sm font-medium mb-8 leading-relaxed">
              This summary existed only in your previous browser session. A refresh, closed tab, or new session clears it for your privacy.
            </p>
            <Button onClick={startNew} className="bg-[#17364a] hover:bg-[#102f43] text-[#e4bd62] font-extrabold uppercase tracking-[.05em] h-12 px-6 rounded-md shadow-[5px_5px_0_#c39b4a] w-full transition-transform active:translate-y-1 active:translate-x-1 active:shadow-[2px_2px_0_#c39b4a]">
              <RotateCcw className="mr-2 h-4 w-4" /> Start a new summary
            </Button>
          </div>
        </div>
      </SharedLayout>
    );
  }

  return (
    <SharedLayout>
      <div className="inspect-container py-12 flex-1 relative z-10">
        <nav className="text-sm font-medium text-[#4e6666] mb-8 flex items-center gap-2 no-print">
          <a href={import.meta.env.BASE_URL} className="text-[#102f43] hover:text-[#9a6f20] transition-colors">Security Inspection</a>
          <span className="text-[#17364a]/30">›</span>
          <a href={`${import.meta.env.BASE_URL}report-fraud`} className="text-[#102f43] hover:text-[#9a6f20] transition-colors">Report Fraud</a>
          <span className="text-[#17364a]/30">›</span>
          <span className="text-[#17364a]">Incident Summary</span>
        </nav>

        <div className="mb-8 no-print">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-[#4e6666] mb-4">
            <span>Step 6 of 6</span>
            <span className="text-[#102f43]">Card Authorization Handoff</span>
          </div>
          <div className="h-1.5 bg-[#e2eadf] w-full rounded-full overflow-hidden">
            <div className="h-full bg-[#17364a] transition-all duration-300 ease-in-out" style={{ width: '100%' }} />
          </div>
        </div>

        <div className="no-print mb-8">
          <div className="flex items-center gap-3 mb-4 text-[#17364a] font-bold tracking-tight uppercase text-sm">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <span className="text-green-700">Summary complete</span>
          </div>
          <h1 className="text-3xl font-bold text-[#102f43] mb-2">Your incident summary is ready</h1>
          <p className="text-lg text-[#4e6666] font-medium max-w-3xl">
            Download the PDF or print it. You can use this document to help file official disputes with your bank, credit card issuer, or law enforcement.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_340px] gap-8">
          <div>
            <article className="bg-[#f8f7f2] border-2 border-[#17364a]/25 rounded shadow-sm print:border-0 print:shadow-none mb-8">
              <div className="border-b-2 border-[#17364a]/25 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <span className="font-bold text-[#102f43] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#17364a] print:hidden" /> Local Incident Summary
                </span>
                <div className="flex items-center gap-2 text-sm bg-[#f4f3ee] px-3 py-1.5 border border-[#17364a]/15 rounded">
                  <span className="font-bold text-[#4e6666] uppercase tracking-widest text-xs">Local Ref</span>
                  <span className="font-bold text-[#102f43] font-mono">{completed.referenceId}</span>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-8">
                <section>
                  <h2 className="text-lg font-bold text-[#102f43] border-b border-[#17364a]/15 pb-2 mb-4">Incident Details</h2>
                  <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                    <SummaryField label="Date" value={completed.incident.incidentDate} />
                    <SummaryField label="Type" value={completed.incident.incidentType} />
                    <SummaryField label="Contact Channel" value={completed.incident.contactChannel} />
                  </dl>
                </section>

                <section>
                  <h2 className="text-lg font-bold text-[#102f43] border-b border-[#17364a]/15 pb-2 mb-4">Financial Impact</h2>
                  <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                    <SummaryField label="Amount Lost" value={completed.financial.amountLost || "None specified"} />
                    <SummaryField label="Payment Method" value={completed.financial.paymentMethod || "N/A"} />
                    <SummaryField label="Affected Institutions" value={completed.financial.affectedAccounts || "None"} />
                  </dl>
                </section>

                <section>
                  <h2 className="text-lg font-bold text-[#102f43] border-b border-[#17364a]/15 pb-2 mb-4">Reporter Information</h2>
                  <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm">
                    <SummaryField label="Name" value={`${completed.reporter.firstName} ${completed.reporter.lastName}`} />
                    <SummaryField label="Email" value={completed.reporter.email || "Not provided"} />
                    <SummaryField label="Phone" value={completed.reporter.phone || "Not provided"} />
                    <SummaryField
                      label="Address"
                      value={[
                        completed.reporter.addressLine1,
                        completed.reporter.addressLine2,
                        `${completed.reporter.city}, ${completed.reporter.state} ${completed.reporter.postalCode}`,
                      ].filter(Boolean).join(", ")}
                    />
                  </dl>
                </section>

                <p className="text-xs text-[#4e6666] border-t border-[#17364a]/15 pt-4">
                  This document was generated locally by your browser at {browserDateTime(completed.completedAt)}. It has not been submitted to any authority.
                </p>
              </div>
            </article>

            <div className="no-print flex flex-col sm:flex-row gap-4 mb-8">
              <Button
                onClick={() => downloadFraudReportPdf(completed)}
                className="flex-1 bg-[#17364a] hover:bg-[#102f43] text-[#e4bd62] font-extrabold uppercase tracking-[.05em] h-12 rounded-md shadow-[5px_5px_0_#c39b4a] flex items-center justify-center transition-transform active:translate-y-1 active:translate-x-1 active:shadow-[2px_2px_0_#c39b4a]"
              >
                <Download className="mr-2 h-5 w-5" /> Download PDF
              </Button>
              <Button
                onClick={() => window.print()}
                className="flex-1 bg-[#f8f7f2] hover:bg-[#eef1eb] text-[#17364a] border-2 border-[#17364a] font-extrabold uppercase tracking-[.05em] h-12 rounded-md flex items-center justify-center shadow-[3px_3px_0_#17364a] transition-transform active:translate-y-1 active:translate-x-1 active:shadow-[1px_1px_0_#17364a]"
              >
                <Printer className="mr-2 h-5 w-5" /> Print
              </Button>
            </div>
            
            <div className="no-print mt-12 bg-white border-2 border-[#17364a] p-6 sm:p-8 shadow-[8px_8px_0_#17364a]">
              <h2 className="display-font text-2xl font-bold text-[#102f43] mb-3">Urgent: Card Authorization</h2>
              <div className="bg-[#f8f7f2] border-l-4 border-[#b84635] p-4 mb-6">
                <p className="text-sm text-[#102f43] font-medium leading-relaxed">
                  <strong>Important:</strong> Entering card details is <em>never</em> required to report fraud. Your incident summary is already complete and available for download above. 
                  Only continue to this step if you separately need to create a legitimate authorization document.
                </p>
              </div>
              <p className="text-[#4e6666] mb-6 text-sm">
                If you need to generate a secure, browser-only authorization document, you can proceed to the Card Security tool. This will open the 4-step authorization workflow. Data from this fraud report will not be combined or transmitted.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={`${import.meta.env.BASE_URL}card-security/authorize`}
                  className="flex-1 bg-[#17364a] hover:bg-[#102f43] text-[#e4bd62] font-extrabold uppercase tracking-[.05em] h-12 rounded-md shadow-[5px_5px_0_#c39b4a] flex items-center justify-center transition-transform active:translate-y-1 active:translate-x-1 active:shadow-[2px_2px_0_#c39b4a] text-center text-xs sm:text-sm"
                >
                  Open Card Security Workflow
                </a>
                <Button
                  onClick={startNew}
                  className="flex-1 bg-[#f8f7f2] hover:bg-[#eef1eb] text-[#17364a] border-2 border-[#17364a] font-extrabold uppercase tracking-[.05em] h-12 rounded-md flex items-center justify-center shadow-[3px_3px_0_#17364a] transition-transform active:translate-y-1 active:translate-x-1 active:shadow-[1px_1px_0_#17364a] text-xs sm:text-sm"
                >
                  Finish Report Only / Return
                </Button>
              </div>
            </div>
          </div>

          <aside className="no-print">
            <div className="bg-white border-2 border-[#b84635]/20 rounded-md p-6 shadow-sm sticky top-6">
              <h3 className="font-bold text-lg text-[#102f43] mb-4 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-[#b84635]" />
                Crucial Next Steps
              </h3>
              
              <div className="space-y-5">
                <div>
                  <h4 className="font-bold text-sm text-[#102f43] uppercase tracking-wider mb-2">1. Secure your accounts</h4>
                  <p className="text-sm text-[#4e6666] leading-relaxed">
                    Contact your card issuer or bank <strong>immediately</strong> using the phone number on the back of your card. Freeze or replace compromised cards.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-bold text-sm text-[#102f43] uppercase tracking-wider mb-2">2. Report to authorities</h4>
                  <ul className="space-y-3 text-sm">
                    <li>
                      <a href="https://reportfraud.ftc.gov" target="_blank" rel="noopener noreferrer" className="text-[#17364a] font-bold hover:text-[#9a6f20] inline-flex items-center gap-1 group">
                        FTC ReportFraud <ExternalLink className="w-3 h-3 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                      <p className="text-[#4e6666] text-xs mt-0.5">For scams and bad business practices.</p>
                    </li>
                    <li>
                      <a href="https://www.identitytheft.gov" target="_blank" rel="noopener noreferrer" className="text-[#17364a] font-bold hover:text-[#9a6f20] inline-flex items-center gap-1 group">
                        IdentityTheft.gov <ExternalLink className="w-3 h-3 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                      <p className="text-[#4e6666] text-xs mt-0.5">If your personal info was compromised.</p>
                    </li>
                    <li>
                      <a href="https://www.ic3.gov" target="_blank" rel="noopener noreferrer" className="text-[#17364a] font-bold hover:text-[#9a6f20] inline-flex items-center gap-1 group">
                        FBI IC3 <ExternalLink className="w-3 h-3 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-transform" />
                      </a>
                      <p className="text-[#4e6666] text-xs mt-0.5">For internet-facilitated crimes.</p>
                    </li>
                  </ul>
                </div>
                
                <div className="pt-2 border-t border-[#17364a]/10">
                  <p className="text-xs font-semibold text-[#b84635]">
                    Do not contact scammers again. Call emergency services only if you are in immediate danger.
                  </p>
                </div>
              </div>
            </div>
          </aside>
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