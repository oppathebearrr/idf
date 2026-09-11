import { useAppLocation } from "@/card-security/lib/router";
import { ArrowRight, ShieldCheck, FileText, Info, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DEFAULT_BUSINESS_CONFIG, useAuthorizationSession } from "@/card-security/lib/authorization-session";

export default function Landing() {
  const [, setLocation] = useAppLocation();
  const { clear } = useAuthorizationSession();

  const config = DEFAULT_BUSINESS_CONFIG;
  const businessName = config.businessName;

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#f4f3ee] font-sans">
      {/* Official Gov-style Banner */}
      <div className="bg-[#17364a] text-white py-1.5 px-4 text-xs font-medium border-b-4 border-[#c39b4a]">
        <div className="max-w-5xl mx-auto flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-white/80" />
          <span>Private document service for {businessName}.</span>
        </div>
      </div>

      {/* Header */}
      <header className="bg-[#f8f7f2] border-b border-[#17364a]/15 py-6 px-4 shadow-sm">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            {config.logoUrl ? (
              <img src={config.logoUrl} alt={businessName} className="h-10 object-contain" />
            ) : (
              <div className="w-10 h-10 bg-[#17364a] text-white flex items-center justify-center font-bold rounded shadow-sm">
                <Building2 className="w-6 h-6" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-bold text-xl text-[#102f43] tracking-tight leading-none mb-1">
                {businessName}
              </span>
              <span className="text-sm text-[#4e6666] font-medium">Authorization Services Portal</span>
            </div>
          </div>
          <a href="/" className="text-sm font-semibold text-[#17364a] hover:text-[#9a6f20] transition-colors">
            ← Back to Security Inspection
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 py-8 sm:py-12 flex flex-col">
        
        {/* Breadcrumb equivalent */}
        <nav className="text-sm font-medium text-[#4e6666] mb-8 flex items-center gap-2">
          <span className="text-[#102f43]">Home</span>
          <span className="text-slate-400">›</span>
          <span className="text-[#17364a]">Create Document</span>
        </nav>

        <div className="grid md:grid-cols-[1fr_320px] gap-12 items-start">
          <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-[#102f43] mb-4">
                Create a client authorization document
              </h1>
              <p className="text-lg text-slate-700 leading-relaxed font-normal mb-6">
                Complete a private, browser-only form to review the agreement, add your signature, and create a document for your own download or print.
              </p>
              
              <div className="bg-[#dce7de] border-l-4 border-[#c39b4a] p-4 text-[#102f43] mb-8 flex gap-3">
                <Info className="w-6 h-6 text-[#17364a] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-base mb-1">What you need to know</h3>
                  <p className="text-sm leading-relaxed">
                    You will enter billing information, full card details, and a signature. Full card details are temporary and cleared before the document is completed. Nothing is submitted to an API or saved in a vault, and this is not a charge.
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <h2 className="text-xl font-bold text-[#102f43] border-b border-[#17364a]/15 pb-2">
                  Steps to Complete
                </h2>
                <ol className="list-decimal list-outside ml-5 space-y-3 text-slate-700 font-medium">
                  <li><strong className="text-[#102f43]">Billing information:</strong> Provide your contact and billing details.</li>
                  <li><strong className="text-[#102f43]">Card details:</strong> Enter full card details in temporary browser memory.</li>
                  <li><strong className="text-[#102f43]">Agreement:</strong> Review and accept the exact terms.</li>
                  <li><strong className="text-[#102f43]">Signature:</strong> Type your name, then download or print the completed document.</li>
                </ol>
              </div>

              <Button 
                onClick={() => {
                  clear();
                  setLocation("/authorize");
                }}
                className="bg-[#17364a] hover:bg-[#17364a]/90 text-white font-bold text-lg h-14 px-8 rounded flex items-center shadow-sm w-full sm:w-auto justify-center"
              >
                Begin document <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Sidebar / Additional Info */}
          <aside className="bg-[#f8f7f2] border-2 border-[#17364a]/15 p-6 rounded shadow-sm sticky top-6">
            <h3 className="font-bold text-lg text-[#102f43] mb-4 border-b border-[#17364a]/15 pb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#17364a]" />
              Security Notice
            </h3>
            <div className="space-y-4 text-sm text-slate-700">
              <p>
                This is a private placeholder-brand workflow for creating a standalone authorization document. It does not charge a card or create a payment method.
              </p>
              <div className="bg-[#f4f3ee] border border-[#17364a]/15 p-3 rounded">
                <strong className="block text-[#102f43] mb-1">Browser-only privacy</strong>
                <p>Information stays in browser memory while you work. Full card number, expiry, and security code are discarded before completion. The downloaded and printed document contains only a masked last four.</p>
              </div>
              <div className="flex items-center gap-2 pt-2 text-[#17364a] font-semibold">
                <FileText className="w-4 h-4" />
                <span>PDF and print generated on this device</span>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <footer className="bg-slate-100 border-t border-[#17364a]/25 py-8 mt-auto">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-[#4e6666]">
          <div className="flex items-center gap-6 font-medium">
            {config.privacyUrl && (
              <a href={config.privacyUrl} target="_blank" rel="noreferrer" className="hover:text-[#17364a] hover:underline">Privacy Policy</a>
            )}
            {config.termsUrl && (
              <a href={config.termsUrl} target="_blank" rel="noreferrer" className="hover:text-[#17364a] hover:underline">Terms of Service</a>
            )}
            {config.refundUrl && (
              <a href={config.refundUrl} target="_blank" rel="noreferrer" className="hover:text-[#17364a] hover:underline">Refund Policy</a>
            )}
          </div>
          <div className="text-[#4e6666]">
            &copy; {new Date().getFullYear()} {businessName}. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
