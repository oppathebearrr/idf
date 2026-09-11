import { type ReactNode } from "react";

const HOME_URL = import.meta.env.BASE_URL;

export function SharedLayout({ children }: { children: ReactNode }) {
  return (
    <div className="inspect-page min-h-[100dvh] flex flex-col text-[#20253c]">
      <div className="gov-utility no-print">
        <div className="inspect-container flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
          <span>Public web assurance / security inspection</span>
          <span>Local-first browser tooling · Chromium</span>
        </div>
      </div>
      <header className="relative z-20 border-b border-[#17364a]/15 bg-[#f4f3ee]/95 backdrop-blur-md no-print">
        <div className="inspect-container flex min-h-[82px] items-center justify-between gap-6">
          <a href={HOME_URL} className="outline-focus flex items-center gap-3">
            <span className="brand-mark grid h-12 w-12 place-items-center overflow-hidden rounded-full border border-[#c39b4a] bg-[#f4f3ee]">
              <img
                src={`${HOME_URL}security-inspection-seal.png`}
                alt=""
                className="h-full w-full object-contain"
                aria-hidden="true"
              />
            </span>
            <span>
              <span className="display-font block text-lg font-bold tracking-[-0.04em] text-[#102f43]">Cyber Safety</span>
              <span className="mono-label block text-[9px] text-[#5f726f]">Secure America Online</span>
              <span className="mono-label block text-[9px] text-[#5f726f]">A public web review tool</span>
            </span>
          </a>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-[#17364a] md:flex" aria-label="Main navigation">
            <a href={HOME_URL} className="outline-focus transition-colors hover:text-[#9a6f20]">Inspection Tool</a>
            <a href={`${HOME_URL}card-security`} className="outline-focus transition-colors hover:text-[#9a6f20]">Card Security</a>
            <a href={`${HOME_URL}report-fraud`} className="outline-focus transition-colors text-[#9a6f20] border-b-2 border-[#9a6f20] pb-1">Report Fraud</a>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex flex-col w-full relative z-10">
        {children}
      </main>

      <footer className="border-t border-[#20253c]/15 py-10 no-print mt-auto bg-[#f4f3ee]">
        <div className="inspect-container flex flex-col justify-between gap-5 text-sm text-[#4e6666] sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <span className="brand-mark grid h-9 w-9 place-items-center overflow-hidden rounded-full border border-[#c39b4a] bg-[#f4f3ee]">
                <img src={`${HOME_URL}security-inspection-seal.png`} alt="" className="h-full w-full object-contain" aria-hidden="true" />
              </span>
              <span>Security Inspection is open source software for a more accountable web.</span>
          </div>
           <span className="font-mono text-xs text-[#17364a]">Security Inspection / local-first toolkit</span>
        </div>
      </footer>
    </div>
  );
}
