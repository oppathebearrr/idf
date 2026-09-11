import { useAppLocation } from "@/card-security/lib/router";
import { ArrowRight, ShieldCheck, FileText, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthorizationSession } from "@/card-security/lib/authorization-session";
import { SharedLayout } from "../components/Layout";

export default function Landing() {
  const [, setLocation] = useAppLocation();
  const { clear } = useAuthorizationSession();

  return (
    <SharedLayout>
      <div className="inspect-container py-12 sm:py-20 flex-1">
        
        {/* Breadcrumb equivalent */}
        <nav className="text-sm font-medium text-[#4e6666] mb-8 flex items-center gap-2">
          <a href={import.meta.env.BASE_URL} className="text-[#102f43] hover:text-[#9a6f20] transition-colors">Security Inspection</a>
          <span className="text-[#17364a]/30">›</span>
          <span className="text-[#17364a]">Card Security</span>
        </nav>

        <div className="grid md:grid-cols-[1fr_320px] gap-12 items-start">
          <div className="space-y-8 animate-fade-in">
            <div>
              <h1 className="display-font text-3xl sm:text-5xl font-bold text-[#102f43] mb-6 tracking-[-0.04em]">
                Enable 2FA & Block Fraudulent Transfers
              </h1>
              <p className="text-lg text-[#4e6666] leading-relaxed font-normal mb-8 max-w-[600px]">
                Complete a secure, browser-based setup to enable two-factor authentication, strengthen your account security, and help block unauthorized or fraudulent transfers.
              </p>
              
              <div className="bg-[#dce7de] border-l-4 border-[#c39b4a] p-5 text-[#102f43] mb-8 flex gap-4 shadow-sm">
                <Info className="w-6 h-6 text-[#9a6f20] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-base mb-1">What you need to know</h3>
                  <p className="text-sm leading-relaxed text-[#4e6666]">
                    You’ll complete a secure verification process to enable 2FA and strengthen your account protection. No payment will be made, and no funds will be transferred. Only the information required for security verification is requested, and sensitive information is handled securely.
                  </p>
                </div>
              </div>

              <div className="bg-[#f8f7f2] border-2 border-[#17364a] p-5 text-[#102f43] mb-8 shadow-[4px_4px_0_#17364a]">
                <h3 className="font-bold text-base mb-1 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#17364a]" />
                  Suspecting fraud or a scam?
                </h3>
                <p className="text-sm leading-relaxed text-[#4e6666] mb-3">
                  If you believe your account or payment information may have been compromised, take action immediately. Use our dedicated fraud reporting tool to report suspicious activity and get guidance on protecting your account.
                </p>
                <a href={`${import.meta.env.BASE_URL}report-fraud`} className="text-sm font-bold text-[#17364a] hover:text-[#9a6f20] inline-flex items-center gap-1 transition-colors">
                  Go to Report a Fraud <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              <div className="space-y-4 mb-10">
                <h2 className="display-font text-2xl font-bold text-[#102f43] border-b border-[#17364a]/15 pb-3">
                  Steps to Complete
                </h2>
                <ol className="list-decimal list-outside ml-5 space-y-4 text-[#4e6666] font-medium pt-2">
                  <li><strong className="text-[#102f43]">Verify your account:</strong> Confirm the basic information needed to secure your account.</li>
                  <li><strong className="text-[#102f43]">Enable 2FA:</strong> Set up two-factor authentication for an additional layer of protection.</li>
                  <li><strong className="text-[#102f43]">Agreement:</strong> Review and accept the exact terms.</li>
                  <li><strong className="text-[#102f43]">Signature:</strong> Type your name, then download or print the completed document.</li>
                </ol>
              </div>

              <Button 
                onClick={() => {
                  clear();
                  setLocation("/authorize");
                }}
                className="bg-[#17364a] hover:bg-[#102f43] text-[#e4bd62] font-bold text-lg h-14 px-8 rounded-md flex items-center shadow-[5px_5px_0_#c39b4a] w-full sm:w-auto justify-center uppercase tracking-[.05em] transition-transform active:translate-y-1 active:translate-x-1 active:shadow-[2px_2px_0_#c39b4a]"
              >
                Begin document <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Sidebar / Additional Info */}
          <aside className="bg-[#f8f7f2] border border-[#17364a]/15 p-6 rounded shadow-[8px_8px_0_rgba(23,54,74,0.05)] sticky top-6">
            <h3 className="font-bold text-lg text-[#102f43] mb-4 border-b border-[#17364a]/15 pb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#d6b45d]" />
              Security Notice
            </h3>
            <div className="space-y-4 text-sm text-[#4e6666]">
              <p>
                This is a private, browser-based workflow for creating a standalone authorization document. No payment is processed, and no payment method is added to your account.
              </p>
              <div className="bg-[#eef1eb] border border-[#17364a]/10 p-4 rounded">
                <strong className="block text-[#102f43] mb-1 font-mono text-[10px] tracking-widest uppercase">Browser-only privacy</strong>
                <p>Your information remains in your browser’s temporary memory while you complete the workflow. Your full card number, expiration date, and security code are discarded before the process is completed. The downloaded or printed document contains only the masked last four digits of the card.</p>
              </div>
              <div className="flex items-center gap-2 pt-2 text-[#17364a] font-semibold text-xs uppercase tracking-wider">
                <FileText className="w-4 h-4 text-[#9a6f20]" />
                <span>PDF Generation</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </SharedLayout>
  );
}