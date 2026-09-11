import { AlertTriangle, GlobeLock, Layers3, Lock, Search, ShieldCheck } from 'lucide-react';
import './_group.css';

const mission = [
  [ShieldCheck, '01', 'Identify Scams', 'Tools to inspect unsafe websites and recognize phishing.'],
  [AlertTriangle, '02', 'Document Fraud', 'Organize incident details safely before disputing charges.'],
  [Lock, '03', 'Protect Data', 'Generate secure local documents with zero data transmission.'],
  [GlobeLock, '04', 'Track Sources', 'Look up suspicious IPs and networks with our partner tool.'],
] as const;
const extension = [
  [Search, 'A / 01', 'Surface review', 'Identify suspicious site structure, invisible attributes, and hidden elements.'],
  [Layers3, 'A / 02', 'Asset trace', 'Review embedded images, fonts, and external page resources safely.'],
  [Lock, 'A / 03', 'Local-first control', 'No account, no telemetry, and no remote dashboard. Review stays in your browser.'],
] as const;

export function FieldManual() {
  return <main className="safety-mockup">
    <section className="redesign-hero"><div className="mock-shell">
      <div className="redesign-intro"><div><span className="mock-kicker">A practical safety field guide</span><h1 className="mock-heading">Four ways to keep your next step clear.</h1></div><p className="mock-copy">Quiet, useful tools for checking what is in front of you, recording what happened, and keeping sensitive details where they belong.</p></div>
      <div className="mission-list">{mission.map(([Icon, number, title, text]) => <article className="mission-item" key={title}><span className="mission-icon"><Icon size={21} strokeWidth={1.7} /></span><span className="mission-index">{number} / SAFETY ACTION</span><h3>{title}</h3><p>{text}</p></article>)}</div>
    </div></section>
    <section className="redesign-extension"><div className="mock-shell extension-layout">
      <div className="extension-intro"><span className="mock-kicker">Website inspection tool</span><h2 className="mock-heading">See the parts a page does not show you.</h2><p className="mock-copy">The browser extension turns a site into a legible record without sending your review anywhere else.</p><span className="privacy-stamp"><Lock size={13} /> Browser-only inspection</span></div>
      <div className="inspection-ledger">{extension.map(([Icon, number, title, text]) => <article className="inspection-row" key={title}><span className="inspection-number">{number}</span><span className="ledger-icon"><Icon size={21} strokeWidth={1.7} /></span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
    </div></section>
  </main>;
}