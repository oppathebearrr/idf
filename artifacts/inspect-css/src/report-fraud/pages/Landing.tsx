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
                Organize your incident details securely in your browser. Generate a printable summary to help you file official reports with your bank, the FTC, or local authorities.
              </p>
              
              <div className="bg-[#f8f7f2] border-2 border-[#17364a] p-5 text-[#102f43] mb-8 shadow-[4px_4px_0_#17364a]">
                <h3 className="font-bold text-base mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-[#b84635]" />
                  Not an official report
                </h3>
                <p className="text-sm leading-relaxed text-[#4e6666]">
                  This tool helps you organize your thoughts and evidence. It does <strong>not</strong> submit data to law enforcement, government agencies, or financial institutions. You must contact them directly after generating your summary.
                </p>
              </div>

              <div className="bg-[#dce7de] border-l-4 border-[#c39b4a] p-5 text-[#102f43] mb-8 flex gap-4 shadow-sm">
                <Info className="w-6 h-6 text-[#9a6f20] shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-base mb-1">Privacy First</h3>
                  <p className="text-sm leading-relaxed text-[#4e6666]">
                    Do not enter sensitive credentials like passwords, full credit card numbers, or Social Security Numbers. This tool runs entirely in your browser's memory and discards the information when you close the tab.
                  </p>
                </div>
              </div>

              <div className="space-y-4 mb-10">
                <h2 className="display-font text-2xl font-bold text-[#102f43] border-b border-[#17364a]/15 pb-3">
                  How it works
                </h2>
                <ol className="list-decimal list-outside ml-5 space-y-4 text-[#4e6666] font-medium pt-2">
                  <li><strong className="text-[#102f43]">Incident info:</strong> Describe what happened and how you were contacted.</li>
                  <li><strong className="text-[#102f43]">Financial impact:</strong> Note affected institutions and amounts lost.</li>
                  <li><strong className="text-[#102f43]">Evidence checklist:</strong> Keep track of screenshots and emails you've collected.</li>
                  <li><strong className="text-[#102f43]">Generate summary:</strong> Download a local PDF to reference during official disputes.</li>
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
              Security Notice
            </h3>
            <div className="space-y-4 text-sm text-[#4e6666]">
              <p>
                This is a private organizational tool. No information is transmitted over the internet.
              </p>
              <div className="bg-[#eef1eb] border border-[#17364a]/10 p-4 rounded">
                <strong className="block text-[#102f43] mb-1 font-mono text-[10px] tracking-widest uppercase">Browser-only privacy</strong>
                <p>Information stays in browser memory while you work. When you leave the page, the data is gone forever.</p>
              </div>
              <div className="flex items-center gap-2 pt-2 text-[#17364a] font-semibold text-xs uppercase tracking-wider">
                <FileText className="w-4 h-4 text-[#9a6f20]" />
                <span>Local PDF Generation</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </SharedLayout>
  );
}