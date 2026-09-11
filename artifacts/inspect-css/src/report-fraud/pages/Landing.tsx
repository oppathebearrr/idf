import { useAppLocation } from "../lib/router";
import { ArrowRight, ShieldCheck, FileText, Info, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFraudSession } from "../lib/fraud-session";
import { SharedLayout } from "../components/Layout";
import { Link } from "wouter";

export default function Landing() {
  const [, setLocation] = useAppLocation();
  const { clear } = useFraudSession();

  return (
    <SharedLayout>
      <div className="inspect-container py-12 sm:py-20 flex-1">
        
        {/* Breadcrumb equivalent */}
        <nav className="text-sm font-medium text-[#4e6666] mb-8 flex items-center gap-2">
          <a href={import.meta.env.BASE_URL} className="text-[#102f43] hover:text-[#9a6f20] transition-colors">Security Inspection</a>
          <span className="text-[#17364a]/30">›</span>
          <span className="text-[#17364a]">Report Fraud</span>
        </nav>

        <div className="grid md:grid-cols-[1fr_320px] gap-12 items-start">
          <div className="space-y-8 animate-fade-in">
            <div>
              <h1 className="display-font text-3xl sm:text-5xl font-bold text-[#102f43] mb-6 tracking-[-0.04em]">
                Document a fraud incident
              </h1>
              <p className="text-lg text-[#4e6666] leading-relaxed font-normal mb-8 max-w-[600px]">
                Securely organize the details of your suspected fraud or identity-theft incident in your browser and generate a printable summary and submit an official report to your bank, the Federal Trade Commission (FTC), IdentityTheft.gov, and local law enforcement.
              </p>
              
              <div className="bg-[#f8f7f2] border-2 border-[#17364a] p-5 text-[#102f43] mb-8 shadow-[4px_4px_0_#17364a]">
                <h3 className="font-bold text-base mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-[#b84635]" />
                  Important Reporting Notice
                </h3>
                <p className="text-sm leading-relaxed text-[#4e6666]">
                  This summary is a evidence and documentation. Generating a report here does mean, by itself, that you submit a complaint to the FTC, IdentityTheft.gov, your bank, or law enforcement. You must submit your information through the appropriate official evidence.

                  For identity theft, We direct consumers report to IdentityTheft.gov, which can create an FTC Identity Theft Report and provide a personalized recovery plan. For scams, fraud, or bad business practices, the FTC directs consumers to ReportFraud.ftc.gov.
                </p>
              </div>

              <div className="bg-[#dce7de] border-l-4 border-[#c39b4a] p-5 text-[#102f43] mb-8 flex gap-4 shadow-sm">
                <Info className="w-6 h-6 text-[#9a6f20] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-base mb-1">Accuracy and Legal Notice</h3>
                  <p className="text-sm leading-relaxed text-[#4e6666]">
                    Provide only information that is truthful and accurate to the best of your knowledge. Do not knowingly submit false, misleading, or fabricated information to the FTC, law enforcement, a financial institution, creditor, debt collector, or any other authority. Official FTC guidance indicates that an FTC Identity Theft Report is made under penalty of perjury, and false information may carry legal consequences.

                    This document does not establish that a reported transaction or debt is fraudulent by itself. Official agencies, financial institutions, creditors, or other relevant authorities may independently review the information and supporting evidence.
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-10">
                <h2 className="display-font text-2xl font-bold text-[#102f43] border-b border-[#17364a]/15 pb-3">
                  How it works
                </h2>
                <ol className="list-decimal list-outside ml-5 space-y-4 text-[#4e6666] font-medium pt-2">
                  <li><strong className="text-[#102f43]">Incident info:</strong> Describe what happened and how you found it.</li>
                  <li><strong className="text-[#102f43]">Financial impact:</strong> Note affected institutions and amounts lost.</li>
                  <li><strong className="text-[#102f43]">Evidence checklist:</strong> Keep track of screenshots and emails you've collected.</li>
                  <li><strong className="text-[#102f43]">Generate summary:</strong> Submit and Download a PDF to reference during official disputes.</li>
                </ol>
              </div>

              <Button 
                onClick={() => {
                  clear();
                  setLocation("/report");
                }}
                className="bg-[#17364a] hover:bg-[#102f43] text-[#e4bd62] font-bold text-lg h-14 px-8 rounded-md flex items-center shadow-[5px_5px_0_#c39b4a] w-full sm:w-auto justify-center uppercase tracking-[.05em] transition-transform active:translate-y-1 active:translate-x-1 active:shadow-[2px_2px_0_#c39b4a]"
              >
                Begin incident summary <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Sidebar / Additional Info */}
          <aside className="bg-[#f8f7f2] border border-[#17364a]/15 p-6 rounded shadow-[8px_8px_0_rgba(23,54,74,0.05)] sticky top-6">
            <h3 className="font-bold text-lg text-[#102f43] mb-4 border-b border-[#17364a]/15 pb-2 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#d6b45d]" />
              SECURITY & PRIVACY NOTICE
            </h3>
            <div className="space-y-4 text-sm text-[#4e6666]">
              <p>
                This is a secure disput-preparation intended to assist users in organizing information for their personal records and official reporting. Information entered into this form is processed within the user’s browser and is not transmitted to a remote server by this tool.
              </p>
              <div className="bg-[#eef1eb] border border-[#17364a]/10 p-4 rounded">
                <strong className="block text-[#102f43] mb-1 font-mono text-[10px] tracking-widest uppercase">Browser-Based Processing</strong>
                <p>Information entered during this session is maintained in temporary browser memory for the duration of the workflow. When the user leaves the page, the temporary information is cleared and is not retained.</p>
              </div>
              <div className="flex items-center gap-2 pt-2 text-[#17364a] font-semibold text-xs uppercase tracking-wider">
                <FileText className="w-4 h-4 text-[#9a6f20]" />
                <span>IMPORTANT: This secured-gateway is a government website, constitute an official government filing, and does automatically submit information to any government agency.</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </SharedLayout>
  );
}