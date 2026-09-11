import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Icon3D } from '@/components/Icon3D';
import {
  Route,
  Switch,
  useLocation,
  Link,
  Router as WouterRouter,
} from 'wouter';
import CardSecurityApp from '@/card-security/CardSecurityApp';
import ReportFraudApp from '@/report-fraud/ReportFraudApp';
import { AccessGate } from '@/components/AccessGate';
import { GovernmentResourcesBanner } from '@/components/GovernmentResourcesBanner';

const queryClient = new QueryClient();
const HOME_URL = import.meta.env.BASE_URL;
const DOWNLOAD_URL = `${HOME_URL}downloads/SecurityInspectv1.zip?patched=3`;

function Home() {
  const [downloadState, setDownloadState] = useState<'idle' | 'checking' | 'missing'>('idle');

  const handleDownload = async () => {
    setDownloadState('checking');
    try {
      const response = await fetch(DOWNLOAD_URL, { method: 'HEAD' });
      if (!response.ok) {
        setDownloadState('missing');
        return;
      }
      const downloadLink = document.createElement('a');
      downloadLink.href = DOWNLOAD_URL;
      downloadLink.download = 'SecurityInspectv1.zip';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      setDownloadState('idle');
    } catch {
      setDownloadState('missing');
    }
  };

  const extensionFeatures = [
    { icon: `${HOME_URL}feature-icons/surface-review-3d.png`, number: 'A / 01', title: 'Surface review', text: 'Identify suspicious site structure, invisible attributes, and hidden elements.' },
    { icon: `${HOME_URL}feature-icons/asset-trace-3d.png`, number: 'A / 02', title: 'Asset trace', text: 'Review embedded images, fonts, and external page resources safely.' },
    { icon: `${HOME_URL}feature-icons/local-first-3d.png`, number: 'A / 03', title: 'Local-first control', text: 'No account, no telemetry, and no remote dashboard. Review stays in your browser.' },
  ];

  return (
    <div className="inspect-page min-h-[100dvh] text-[#20253c] bg-[#f4f3ee]">
      <div className="gov-utility">
        <div className="inspect-container flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
          <span>Public web assurance / security initiative</span>
          <span>Helping protect against fraud, scams, and phishing</span>
        </div>
      </div>
      <header className="relative z-20 border-b border-[#17364a]/15 bg-[#f4f3ee]/95 backdrop-blur-md sticky top-0">
        <div className="inspect-container flex min-h-[82px] items-center justify-between gap-6">
          <a href={HOME_URL} className="outline-focus flex items-center gap-3" data-testid="link-home">
            <span className="brand-mark grid h-12 w-12 place-items-center overflow-hidden rounded-full border border-[#c39b4a] bg-[#f4f3ee]">
              <img
                src={`${HOME_URL}security-inspection-seal.png`}
                alt=""
                className="h-full w-full object-contain"
                aria-hidden="true"
              />
            </span>
            <span>
              <span className="display-font block text-lg font-bold tracking-[-0.04em]"><span style={{ color: '#000000' }}>Identit</span>{' '}<span style={{ color: '#dc2626' }}>Safety</span></span>
              <span className="mono-label block text-[9px] text-[#5f726f]">Secure America Online</span>
            </span>
          </a>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-[#17364a] md:flex" aria-label="Main navigation">
            <a href="#extension" className="outline-focus transition-colors hover:text-[#9a6f20]">Browser Extension</a>
            <Link href="/card-security" className="outline-focus transition-colors hover:text-[#9a6f20]">Card Security</Link>
            <Link href="/report-fraud" className="outline-focus transition-colors hover:text-[#9a6f20]">Report Fraud</Link>
            <a href="https://microsoft--proipscanner.replit.app/" target="_blank" rel="noopener noreferrer" className="outline-focus transition-colors hover:text-[#9a6f20] inline-flex items-center gap-1">
              IP Lookup <Icon3D name="external-link" size={14} />
            </a>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative isolate overflow-hidden border-b border-[#17364a]/15 py-16 sm:py-24 lg:py-32 bg-gradient-to-b from-[#f8f7f2] to-[#f4f3ee]">
          <div className="gov-grid pointer-events-none absolute inset-0 -z-10 opacity-70" />
          <img src={`${HOME_URL}security-inspection-seal.png`} alt="" className="seal-watermark pointer-events-none absolute -right-44 top-10 -z-10 w-[560px] opacity-[0.05] lg:right-[-90px] lg:top-[-80px] lg:w-[700px]" aria-hidden="true" />
          
          <div className="inspect-container relative flex flex-col items-center text-center">
            <div className="hero-reveal gov-kicker mb-7 inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#b38a32]" />
              Online Safety & Protection Platform
            </div>
            <h1 className="display-font hero-reveal hero-reveal-delay max-w-[900px] text-[clamp(2.8rem,6.5vw,5.5rem)] font-bold leading-[1.05] tracking-[-0.05em] text-[#102f43]">
              Protect yourself from <br />
              <span className="text-[#9a6f20]">online threats and fraud.</span>
            </h1>
            <p className="hero-reveal hero-reveal-delay-2 mt-8 max-w-[700px] text-lg leading-8 text-[#4e6666] sm:text-xl">
              Security Inspection provides public-service tools to help you identify scams, verify suspicious websites, and secure your personal information across the internet.
            </p>
            <div className="hero-reveal hero-reveal-delay-3 mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row flex-wrap">
              <a
                href="#extension"
                className="outline-focus inline-flex min-h-14 items-center justify-center gap-3 border-2 border-[#17364a] bg-[#17364a] px-8 text-sm font-extrabold uppercase tracking-[.07em] text-[#e4bd62] shadow-[5px_5px_0_#c39b4a] transition-transform hover:-translate-y-1 active:translate-y-0"
              >
                <Icon3D name="scan-line" size={18} />
                Browser Extension
              </a>
              <Link
                href="/report-fraud"
                className="outline-focus inline-flex min-h-14 items-center justify-center gap-3 border-2 border-[#17364a] bg-[#f8f7f2] px-8 text-sm font-extrabold uppercase tracking-[.07em] text-[#17364a] shadow-[5px_5px_0_#c39b4a] transition-transform hover:-translate-y-1 active:translate-y-0"
              >
                <Icon3D name="warning" size={18} />
                Report a Fraud
              </Link>
              <Link
                href="/card-security"
                className="outline-focus inline-flex min-h-14 items-center justify-center gap-3 border-2 border-[#17364a] bg-[#f8f7f2] px-8 text-sm font-extrabold uppercase tracking-[.07em] text-[#17364a] shadow-[5px_5px_0_#c39b4a] transition-transform hover:-translate-y-1 active:translate-y-0"
              >
                <Icon3D name="credit-card" size={18} />
                Card Security Tool
              </Link>
            </div>
            
            <div className="mission-list hero-reveal hero-reveal-delay-3 mt-16 w-full max-w-[1200px]">
              <article className="mission-item">
                <span className="mission-icon">
                  <img src={`${HOME_URL}feature-icons/identify-scams-3d.png`} alt="" aria-hidden="true" />
                </span>
                <span className="mission-index">01 / SAFETY ACTION</span>
                <h3>Identify Scams</h3>
                <p>Tools to inspect unsafe websites and recognize phishing.</p>
              </article>
              <article className="mission-item">
                <span className="mission-icon">
                  <img src={`${HOME_URL}feature-icons/document-fraud-3d.png`} alt="" aria-hidden="true" />
                </span>
                <span className="mission-index">02 / SAFETY ACTION</span>
                <h3>Document Fraud</h3>
                <p>Organize incident details safely before disputing charges.</p>
              </article>
              <article className="mission-item">
                <span className="mission-icon">
                  <img src={`${HOME_URL}feature-icons/protect-data-3d.png`} alt="" aria-hidden="true" />
                </span>
                <span className="mission-index">03 / SAFETY ACTION</span>
                <h3>Protect Data</h3>
                <p>Generate secure local documents with zero data transmission.</p>
              </article>
              <article className="mission-item">
                <span className="mission-icon">
                  <img src={`${HOME_URL}feature-icons/track-sources-3d.png`} alt="" aria-hidden="true" />
                </span>
                <span className="mission-index">04 / SAFETY ACTION</span>
                <h3>Track Sources</h3>
                <p>Look up suspicious IPs and networks with our partner tool.</p>
              </article>
            </div>
          </div>
        </section>

        <GovernmentResourcesBanner />

        {/* Chrome Extension Section */}
        <section id="extension" className="relative scroll-mt-20 overflow-hidden py-24 sm:py-32 bg-[#f8f7f2]">
          <div className="inspect-container relative">
            <div className="grid gap-12 lg:grid-cols-[.9fr_1.1fr] lg:gap-20 items-center">
              <div>
                <span className="mono-label text-[#9a6f20]">Website Inspection Tool</span>
                <h2 className="display-font mt-5 max-w-[450px] text-4xl font-bold leading-[.98] tracking-[-.06em] text-[#102f43] sm:text-5xl">Uncover hidden risks on the web.</h2>
                <p className="mt-6 leading-7 text-[#4e6666]">
                  The Security Inspection Chrome Extension is a local-first toolkit designed to help you review a live website's structure, styling, and assets. By making the invisible visible, you can spot deceptive formatting, hidden overlays, and suspicious external resources before they compromise your safety.
                </p>
                
                <div className="mt-8">
                  <button
                    type="button"
                    onClick={handleDownload}
                    disabled={downloadState === 'checking'}
                    className="download-button outline-focus inline-flex min-h-14 items-center justify-center gap-3 border-2 border-[#17364a] bg-[#d6b45d] px-6 text-sm font-extrabold uppercase tracking-[.07em] text-[#102f43] shadow-[5px_5px_0_#17364a] disabled:cursor-wait disabled:opacity-70"
                    data-testid="button-download-hero"
                  >
                    {downloadState === 'checking' ? <Icon3D name="scan-line" size={18} className="animate-pulse" /> : <Icon3D name="download" size={18} />}
                    {downloadState === 'checking' ? 'Checking package…' : 'Download for Chrome'}
                    <Icon3D name="arrow-down" size={17} />
                  </button>
                  <div className="mt-4 min-h-6 text-sm text-[#4e6666]" aria-live="polite" data-testid="status-download">
                    {downloadState === 'missing' ? (
                      <span className="inline-flex items-center gap-2 text-[#b84635]"><Icon3D name="help" size={15} /> The package is not published yet. Please try again shortly.</span>
                    ) : (
                      <span className="inline-flex items-center gap-2"><Icon3D name="shield-check" size={15} /> Open source • Chromium native • No account required</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="inspection-ledger w-full">
                {extensionFeatures.map((feature) => (
                  <article key={feature.number} className="inspection-row">
                    <span className="inspection-number">{feature.number}</span>
                    <span className="ledger-icon">
                      <img src={feature.icon} alt="" aria-hidden="true" />
                    </span>
                    <div>
                      <h3>{feature.title}</h3>
                      <p>{feature.text}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Card Security Section */}
        <section className="scroll-mt-20 border-y border-[#17364a]/15 bg-[#dce7de] py-24 sm:py-28">
          <div className="inspect-container">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <div className="order-2 lg:order-1 relative">
                <div className="card-dossier">
                  <div className="card-dossier-stage">
                    <div className="card-dossier-heading">
                      <span className="mono-label text-[#d6b45d]">Privacy Tool / 03</span>
                      <h3>Card Authorization Document</h3>
                      <span className="card-dossier-status">
                        <Icon3D name="lock" size={12} aria-hidden="true" />
                        Browser only
                      </span>
                    </div>
                    <img
                      src={`${HOME_URL}feature-icons/card-document-3d.png`}
                      alt=""
                      aria-hidden="true"
                      className="card-dossier-object"
                    />
                    <span className="card-dossier-orbit" aria-hidden="true" />
                  </div>

                  <div className="card-dossier-checks">
                    <div className="card-dossier-check">
                      <span className="card-dossier-checkmark"><Icon3D name="check" size={15} /></span>
                      <div>
                        <strong>Generates a masked PDF locally</strong>
                        <span>Produces a document with only your card brand and last four digits visible.</span>
                      </div>
                    </div>
                    <div className="card-dossier-check">
                      <span className="card-dossier-checkmark"><Icon3D name="check" size={15} /></span>
                      <div>
                        <strong>Zero data transmission</strong>
                        <span>Does not transmit your card data to any server, database, or API.</span>
                      </div>
                    </div>
                    <div className="card-dossier-check">
                      <span className="card-dossier-checkmark"><Icon3D name="check" size={15} /></span>
                      <div>
                        <strong>No charges or saved payments</strong>
                        <span>This is a document generator only. It cannot and does not process payments.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 lg:order-2">
                <span className="mono-label text-[#17364a]/70">Secure Document Generator</span>
                <h2 className="display-font mt-5 max-w-[570px] text-4xl font-bold leading-[.96] tracking-[-.06em] text-[#102f43] sm:text-5xl">
                  Protect your card details from exposure.
                </h2>
                <p className="mt-6 text-lg leading-7 text-[#4e6666]">
                  When you need to provide card authorization, sending full details over email or untrusted forms can lead to fraud. Our Card Security tool lets you generate a formal authorization document right in your browser, keeping your sensitive data entirely off the network.
                </p>
                <div className="mt-10">
                  <Link
                    href="/card-security"
                    className="outline-focus inline-flex min-h-14 items-center justify-center gap-3 border-2 border-[#17364a] bg-[#f8f7f2] px-8 text-sm font-extrabold uppercase tracking-[.07em] text-[#17364a] shadow-[5px_5px_0_#c39b4a] transition-transform hover:-translate-y-1 active:translate-y-0"
                  >
                    Open Card Security
                    <Icon3D name="chevron-right" size={18} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* IP Lookup Compact CTA */}
        <section className="bg-[#17364a] py-10 text-[#f4f3ee] border-b border-[#20253c]/15">
          <div className="inspect-container flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Icon3D name="globe-lock" className="text-[#d6b45d] w-8 h-8 shrink-0" size={32} />
              <div>
                <h2 className="display-font text-xl font-bold tracking-tight text-white">Investigating a suspicious website?</h2>
                <p className="text-sm text-white/70 mt-1">Look up publicly available network details associated with an IP address.</p>
              </div>
            </div>
            <a
              href="https://microsoft--proipscanner.replit.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="outline-focus inline-flex min-h-12 shrink-0 items-center justify-center gap-2 border-2 border-[#d6b45d] bg-[#d6b45d] px-6 text-xs font-extrabold uppercase tracking-[.07em] text-[#102f43] shadow-[4px_4px_0_#f4f3ee] transition-transform hover:-translate-y-1 active:translate-y-0"
            >
              IP Lookup <Icon3D name="external-link" size={16} />
            </a>
          </div>
        </section>

        <section className="border-t border-[#20253c]/15 py-10 bg-[#f4f3ee]">
          <div className="inspect-container flex flex-col justify-between gap-5 text-sm text-[#4e6666] sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <span className="brand-mark grid h-9 w-9 place-items-center overflow-hidden rounded-full border border-[#c39b4a] bg-[#f8f7f2]">
                  <img src={`${HOME_URL}security-inspection-seal.png`} alt="" className="h-full w-full object-contain" aria-hidden="true" />
                </span>
                <span>Security Inspection is a public-service initiative for a more accountable, safer web.</span>
            </div>
             <span className="font-mono text-xs text-[#17364a]">Security Inspection / public-service platform</span>
          </div>
        </section>
      </main>
    </div>
  );
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/card-security" nest>
          <CardSecurityApp />
        </Route>
        <Route path="/report-fraud" nest>
          <ReportFraudApp />
        </Route>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AccessGate>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
        </AccessGate>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
