import { AlertTriangle, GlobeLock, Layers3, Lock, Search, ShieldCheck } from 'lucide-react';
import './_group.css';

const mission = [
  [ShieldCheck, 'Identify Scams', 'Tools to inspect unsafe websites and recognize phishing.'],
  [AlertTriangle, 'Document Fraud', 'Organize incident details safely before disputing charges.'],
  [Lock, 'Protect Data', 'Generate secure local documents with zero data transmission.'],
  [GlobeLock, 'Track Sources', 'Look up suspicious IPs and networks with our partner tool.'],
] as const;
const extension = [
  [Search, 'Surface review', 'Identify suspicious site structure, invisible attributes, and hidden elements.'],
  [Layers3, 'Asset trace', 'Review embedded images, fonts, and external page resources safely.'],
  [Lock, 'Local-first control', 'No account, no telemetry, and no remote dashboard. Review stays in your browser.'],
] as const;

export function Current() {
  return <main className="safety-mockup">
    <section className="current-hero"><div className="mock-shell">
      <span className="mock-kicker">Online safety & protection platform</span>
      <h1 className="mock-heading">Protection tools for the open web.</h1>
      <p className="mock-copy">Security Inspection provides public-service tools to help you identify scams, verify suspicious websites, and secure your personal information.</p>
      <div className="current-grid">{mission.map(([Icon, title, text]) => <article className="current-card" key={title}><span className="current-icon"><Icon size={20} /></span><h3>{title}</h3><p>{text}</p></article>)}</div>
    </div></section>
    <section className="current-extension"><div className="mock-shell current-extension-inner">
      <div><span className="mock-kicker">Website inspection tool</span><h2 className="mock-heading">Uncover hidden risks on the web.</h2><p className="mock-copy">A local-first toolkit designed to help you review a live website’s structure, styling, and assets.</p></div>
      <div className="current-list">{extension.map(([Icon, title, text]) => <article className="current-row" key={title}><span className="current-icon"><Icon size={21} /></span><div><h3>{title}</h3><p>{text}</p></div></article>)}</div>
    </div></section>
  </main>;
}