import { useEffect } from "react";
import { useAppLocation } from "@/card-security/lib/router";
import { AlertTriangle, Building2, CheckCircle, Download, FileText, Info, Printer, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { browserDateTime, downloadAuthorizationPdf } from "@/card-security/lib/browser-document";
import { useAuthorizationSession } from "@/card-security/lib/authorization-session";

export default function Confirmation() {
  const [, setLocation] = useAppLocation();
  const { completed, clear } = useAuthorizationSession();

  useEffect(() => {
    document.title = completed ? "Completed authorization document" : "Authorization session ended";
  }, [completed]);

  const startNew = () => {
    clear();
    setLocation("/");
  };

  if (!completed) {
    return (
      <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-[#f4f3ee] p-4">
        <div className="max-w-md w-full border-2 border-[#17364a]/25 bg-[#f8f7f2] p-8 rounded shadow-sm text-center">
          <AlertTriangle className="h-12 w-12 mx-auto text-[#17364a]mber-600 mb-4" />
          <h1 className="text-[#17364a]xl font-bold text-[#102f43] mb-2">Browser session ended</h1>
          <p className="text-[#4e6666] text-sm font-medium mb-8 leading-relaxed">
            This document existed only in the previous browser session. A refresh, closed tab, or new session clears it. No server record can restore it.
          </p>
          <Button onClick={startNew} className="bg-[#17364a] hover:bg-[#17364a]/90 text-white font-bold h-12 px-6 rounded shadow-sm w-full">
            <RotateCcw className="mr-2 h-4 w-4" /> Start a new document
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#f4f3ee] font-sans selection:bg-[#17364a] selection:text-white">
      <div className="no-print bg-[#17364a] text-white py-1.5 px-4 text-xs font-medium border-b-4 border-[#c39b4a]">
        <div className="max-w-4xl mx-auto flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-[#17364a]merald-300" />
          <span>Document completed in this browser. Nothing was submitted.</span>
        </div>
      </div>
      <header className="no-print bg-[#f8f7f2] border-b border-[#17364a]/25 py-4 px-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <div className="w-8 h-8 bg-[#17364a] text-white flex items-center justify-center font-bold rounded-sm shadow-sm text-sm">
            <Building2 className="w-4 h-4" />
          </div>
          <span className="font-bold text-lg text-[#102f43] tracking-tight">{completed.businessName}</span>
        </div>
      </header>

      <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-8">
        <div className="no-print mb-8">
          <div className="flex items-center gap-3 mb-4 text-[#17364a] font-bold tracking-tight uppercase text-sm">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <span className="text-green-700">Document complete</span>
          </div>
          <h1 className="text-3xl font-bold text-[#102f43] mb-2">Your authorization document is ready</h1>
          <p className="text-lg text-slate-700 font-medium">
            Download the PDF or print it now. Keep a copy for your records.
          </p>
        </div>

        <article id="print-document" className="bg-[#f8f7f2] border-2 border-[#17364a]/25 rounded shadow-sm print:border-0 print:shadow-none">
          <div className="border-b-2 border-[#17364a]/25 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <span className="font-bold text-[#102f43] flex items-center gap-2">
              <FileText className="w-5 h-5 text-[#17364a] print:hidden" /> Completed authorization document
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
                  This is a standalone authorization document, not a chargeable payment method. The PDF and printout contain only masked card details. Nothing was sent to a server, saved to a vault, or emailed.
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
                <SummaryField label="Brand" value={completed.card.cardBrand} />
                <SummaryField label="Card details" value={`**** ${completed.card.cardLast4}`} />
              </dl>
              <p className="text-xs text-[#4e6666] mt-4">
                Full card number, expiry date, and security code are not retained or included.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-bold text-[#102f43] border-b border-[#17364a]/15 pb-2 mb-4">Agreement and signature</h2>
              <dl className="grid sm:grid-cols-2 gap-x-8 gap-y-3 text-sm mb-5">
                <SummaryField label="Agreement version" value={completed.agreement.termsVersion} />
                <SummaryField label="Accepted" value="Yes" />
                <SummaryField label="Typed signature" value={completed.signatureName} />
                <SummaryField label="Browser time (not server verified)" value={browserDateTime(completed.completedAt)} />
              </dl>
              <div className="border border-[#17364a]/15 rounded bg-[#f4f3ee] p-5">
                <h3 className="font-bold text-[#102f43] mb-3">Exact agreement accepted</h3>
                <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{completed.agreement.termsText}</p>
              </div>
            </section>

            <p className="text-xs text-[#4e6666] border-t border-[#17364a]/15 pt-4">
              This document was generated locally by your browser. The reference is random and does not indicate server registration, verification, or storage.
            </p>
          </div>
        </article>

        <div className="no-print mt-6 flex flex-col sm:flex-row gap-4">
          <Button
            onClick={() => downloadAuthorizationPdf(completed)}
            className="flex-1 bg-[#17364a] hover:bg-[#17364a]/90 text-white font-bold h-12 rounded shadow-sm flex items-center justify-center"
          >
            <Download className="mr-2 h-5 w-5" /> Download PDF
          </Button>
          <Button
            onClick={() => window.print()}
            className="flex-1 bg-[#f8f7f2] hover:bg-slate-100 text-[#17364a] border-2 border-[#c39b4a] font-bold h-12 rounded flex items-center justify-center shadow-sm"
          >
            <Printer className="mr-2 h-5 w-5" /> Print
          </Button>
        </div>
        <div className="no-print mt-8 text-center">
          <Button variant="link" className="text-[#17364a] font-bold" onClick={startNew}>
            <RotateCcw className="mr-2 h-4 w-4" /> Start a new document
          </Button>
        </div>
      </main>
    </div>
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