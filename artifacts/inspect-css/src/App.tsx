import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import {
  ArrowDown,
  Braces,
  Check,
  ChevronRight,
  CircleHelp,
  Copy,
  Download,
  Layers3,
  ScanLine,
  Search,
  ShieldCheck,
  WandSparkles,
} from 'lucide-react';
import {
  Route,
  Switch,
  useLocation,
  Link,
  Router as WouterRouter,
} from 'wouter';
import CardSecurityApp from '@/card-security/CardSecurityApp';

const queryClient = new QueryClient();
const DOWNLOAD_URL = '/downloads/SecurityInspectv1.zip?patched=3';

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
      window.location.href = DOWNLOAD_URL;
    } catch {
      setDownloadState('missing');
    }
  };

  const inspectionAreas = [
    { icon: <ShieldCheck />, number: '01', title: 'Surface review', text: 'See page structure, attributes, and computed styles in one local inspection view.' },
    { icon: <Search />, number: '02', title: 'Style integrity', text: 'Trace the cascade and make visual changes explicit before they move downstream.' },
    { icon: <Braces />, number: '03', title: 'Accessibility signals', text: 'Keep labels, states, IDs, and ARIA attributes in view during a security-minded review.' },
    { icon: <Layers3 />, number: '04', title: 'Asset trace', text: 'Review images, fonts, and other page assets without leaving the site under review.' },
    { icon: <Copy />, number: '05', title: 'Preset playbooks', text: 'Save repeatable text and block changes for consistent review workflows.' },
    { icon: <Download />, number: '06', title: 'Local-first control', text: 'No account, no telemetry, and no remote dashboard required to inspect a page.' },
  ];

  return (
    <div className="inspect-page min-h-[100dvh] text-[#20253c]">
      <div className="gov-utility">
        <div className="inspect-container flex flex-wrap items-center justify-between gap-x-6 gap-y-1">
          <span>Public web assurance / security inspection</span>
          <span>Local-first browser tooling · Chromium</span>
        </div>
      </div>
      <header className="relative z-20 border-b border-[#17364a]/15 bg-[#f4f3ee]/95 backdrop-blur-md">
        <div className="inspect-container flex min-h-[82px] items-center justify-between gap-6">
          <a href="/" className="outline-focus flex items-center gap-3" data-testid="link-home">
            <span className="brand-mark grid h-12 w-12 place-items-center overflow-hidden rounded-full border border-[#c39b4a] bg-[#f4f3ee]">
              <img
                src="/security-inspection-seal.png"
                alt=""
                className="h-full w-full object-contain"
                aria-hidden="true"
              />
            </span>
            <span>
              <span className="display-font block text-lg font-bold tracking-[-0.04em] text-[#102f43]">Security Inspection</span>
              <span className="mono-label block text-[9px] text-[#5f726f]">A public web review tool</span>
            </span>
          </a>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-[#17364a] md:flex" aria-label="Main navigation">
            <a href="#capabilities" className="outline-focus transition-colors hover:text-[#9a6f20]" data-testid="link-capabilities">Capabilities</a>
            <a href="#workflow" className="outline-focus transition-colors hover:text-[#9a6f20]" data-testid="link-workflow">Review protocol</a>
            <Link href="/card-security" className="outline-focus transition-colors hover:text-[#9a6f20]">Card Security</Link>
            <a href="#download" className="outline-focus transition-colors hover:text-[#9a6f20]" data-testid="link-download">Download</a>
          </nav>
          <a href="#download" className="outline-focus grid h-10 w-10 place-items-center rounded-full border border-[#17364a] bg-[#17364a] text-[#e4bd62] md:hidden" aria-label="Jump to download" data-testid="link-download-mobile">
            <Download size={17} />
          </a>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden border-b border-[#17364a]/15 py-16 sm:py-24 lg:py-28">
          <div className="gov-grid pointer-events-none absolute inset-0 -z-10 opacity-70" />
          <img src="/security-inspection-seal.png" alt="" className="seal-watermark pointer-events-none absolute -right-44 top-10 -z-10 w-[560px] opacity-[0.075] lg:right-[-90px] lg:top-[-80px] lg:w-[700px]" aria-hidden="true" />
          <div className="inspect-container relative grid items-center gap-14 lg:grid-cols-[1.02fr_.98fr] lg:gap-20">
            <div>
              <div className="hero-reveal gov-kicker mb-7 inline-flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-[#b38a32]" />
                Official browser inspection toolkit
              </div>
              <h1 className="display-font hero-reveal hero-reveal-delay max-w-[720px] text-[clamp(3.3rem,7.9vw,6.7rem)] font-bold leading-[.92] tracking-[-0.075em] text-[#102f43]">
                Inspect the web.<br />
                <span className="text-[#9a6f20]">Strengthen what you see.</span>
              </h1>
              <p className="hero-reveal hero-reveal-delay-2 mt-8 max-w-[560px] text-lg leading-8 text-[#4e6666] sm:text-xl">
                Security Inspection is a local-first browser extension for reviewing the visible structure, styling, attributes, and assets of a live web page before small surprises become public problems.
              </p>
              <div className="hero-reveal hero-reveal-delay-3 mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloadState === 'checking'}
                  className="download-button outline-focus inline-flex min-h-14 items-center justify-center gap-3 border-2 border-[#17364a] bg-[#d6b45d] px-6 text-sm font-extrabold uppercase tracking-[.07em] text-[#102f43] shadow-[5px_5px_0_#17364a] disabled:cursor-wait disabled:opacity-70"
                  data-testid="button-download-hero"
                >
                  {downloadState === 'checking' ? <ScanLine size={18} className="animate-pulse" /> : <Download size={18} />}
                  {downloadState === 'checking' ? 'Checking package…' : 'Download for Chrome'}
                  <ArrowDown size={17} />
                </button>
                <Link
                  href="/card-security"
                  className="download-button outline-focus inline-flex min-h-14 items-center justify-center gap-3 border-2 border-[#17364a] bg-[#f8f7f2] px-6 text-sm font-extrabold uppercase tracking-[.07em] text-[#17364a] shadow-[5px_5px_0_#c39b4a]"
                >
                  <ShieldCheck size={18} />
                  Card Security
                </Link>
              </div>
              <div className="mt-5 min-h-6 text-sm text-[#4e6666]" aria-live="polite" data-testid="status-download">
                {downloadState === 'missing' ? (
                  <span className="inline-flex items-center gap-2 text-[#b84635]"><CircleHelp size={15} /> The package is not published yet. Please try again shortly.</span>
                ) : (
                  <span className="inline-flex items-center gap-2"><ShieldCheck size={15} /> No account. No telemetry. Review stays in your browser.</span>
                )}
              </div>
            </div>

            <div className="hero-reveal hero-reveal-delay-2 relative mx-auto w-full max-w-[540px] lg:ml-auto">
              <div className="brief-card float-slow relative overflow-hidden border border-[#17364a]/35 bg-[#f8f7f2] shadow-[12px_12px_0_#c39b4a]">
                <img src="/security-inspection-seal.png" alt="" className="brief-watermark pointer-events-none absolute -right-14 -top-14 w-64 opacity-[0.08]" aria-hidden="true" />
                <div className="flex items-center justify-between border-b border-[#17364a]/15 bg-[#17364a] px-5 py-4 text-[#f8f7f2]">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full border border-[#d6b45d]/70">
                      <ShieldCheck size={18} className="text-[#d6b45d]" />
                    </span>
                    <div>
                      <p className="mono-label text-[9px] text-[#d6b45d]">Inspection brief</p>
                      <p className="text-sm font-semibold">Live page review</p>
                    </div>
                  </div>
                  <span className="rounded-full border border-[#b6cbbd]/30 px-2 py-1 font-mono text-[9px] text-[#b6cbbd]">LOCAL</span>
                </div>
                <div className="relative p-5 sm:p-7">
                  <div className="mb-5 flex items-end justify-between border-b border-[#17364a]/15 pb-4">
                    <div>
                      <p className="mono-label text-[9px] text-[#6f7f78]">Review target</p>
                      <p className="mt-1 font-mono text-sm font-medium text-[#17364a]">example.gov / landing</p>
                    </div>
                    <span className="text-xs font-semibold text-[#52705e]">● Active</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      ['SURFACE', 'DOM, attributes, and visible structure'],
                      ['STYLE', 'Cascade, computed values, and layout signals'],
                      ['ASSETS', 'Images, fonts, and page resources'],
                    ].map(([label, value]) => (
                      <div key={label} className="brief-row flex items-center gap-3 border border-[#17364a]/10 bg-[#eef1eb] px-3 py-3">
                        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#17364a] text-[#d6b45d]"><Check size={14} /></span>
                        <span className="min-w-0">
                          <span className="mono-label block text-[9px] text-[#9a6f20]">{label}</span>
                          <span className="block truncate text-xs font-semibold text-[#17364a]">{value}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center justify-between border-t border-[#17364a]/15 pt-4 font-mono text-[10px] text-[#6f7f78]">
                    <span>SECURITY INSPECTION / 001</span>
                    <span>NO REMOTE DATA</span>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-8 -left-5 hidden rotate-[-3deg] border border-[#17364a]/30 bg-[#dce7de] px-4 py-3 font-mono text-[11px] font-bold text-[#17364a] shadow-[4px_4px_0_#17364a] sm:block">
                REVIEW / RECORD / IMPROVE
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[#17364a]/15 bg-[#17364a] py-5 text-[#f4f3ee]" aria-label="Product summary">
          <div className="inspect-container flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
            <span className="mono-label text-[#d6b45d]">one extension / six inspection areas</span>
            <div className="flex flex-wrap items-center gap-x-7 gap-y-2 text-sm text-white/70">
              <span className="inline-flex items-center gap-2"><Check size={15} className="text-[#d6b45d]" /> Chromium native</span>
              <span className="inline-flex items-center gap-2"><Check size={15} className="text-[#d6b45d]" /> Open source</span>
              <span className="inline-flex items-center gap-2"><Check size={15} className="text-[#d6b45d]" /> Local-first</span>
            </div>
          </div>
        </section>

        <section id="capabilities" className="relative scroll-mt-20 overflow-hidden py-24 sm:py-32">
          <img src="/security-inspection-seal.png" alt="" className="section-seal-watermark pointer-events-none absolute -left-52 top-24 w-[520px] opacity-[0.035]" aria-hidden="true" />
          <div className="inspect-container relative">
          <div className="grid gap-12 lg:grid-cols-[.72fr_1.28fr] lg:gap-20">
            <div>
              <span className="mono-label text-[#9a6f20]">Inspection coverage</span>
              <h2 className="display-font mt-5 max-w-[450px] text-4xl font-bold leading-[.98] tracking-[-.06em] text-[#102f43] sm:text-5xl">A clearer record of what the public sees.</h2>
              <p className="mt-6 max-w-[390px] leading-7 text-[#4e6666]">Review the live surface before you approve it. Security Inspection keeps the evidence close to the page and the review close to your hands.</p>
              <div className="mt-10 border-l-2 border-[#b38a32] pl-5 text-sm leading-6 text-[#4e6666]">
                <span className="font-bold text-[#102f43]">No remote dashboard to learn.</span><br />Open the extension on any page, inspect the visible surface, and leave with a record you understand.
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {inspectionAreas.map((feature) => (
                <article key={feature.number} className="feature-card border border-[#17364a]/15 bg-[#f8f7f2] p-5 shadow-[0_8px_24px_rgba(16,47,67,.05)]" data-testid={`card-feature-${feature.number}`}>
                  <div className="flex items-start justify-between">
                    <span className="grid h-10 w-10 place-items-center rounded-full border border-[#c39b4a]/60 bg-[#e2eadf] text-[#17364a]">{feature.icon}</span>
                    <span className="mono-label text-[#84938d]">{feature.number}</span>
                  </div>
                  <h3 className="display-font mt-7 text-xl font-bold tracking-[-.03em] text-[#17364a]">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#4e6666]">{feature.text}</p>
                </article>
              ))}
            </div>
          </div>
          </div>
        </section>

        <section id="workflow" className="scroll-mt-20 border-y border-[#17364a]/15 bg-[#dce7de] py-24 sm:py-28">
          <div className="inspect-container">
            <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
              <div>
                <span className="mono-label text-[#17364a]/70">Review protocol</span>
                <h2 className="display-font mt-5 max-w-[570px] text-4xl font-bold leading-[.96] tracking-[-.06em] text-[#102f43] sm:text-6xl">Observe. Inspect. Record.</h2>
              </div>
              <p className="max-w-[310px] text-sm leading-6 text-[#17364a]/75">Security Inspection stays close to the rendered interface, so every decision has a clear, local trail.</p>
            </div>
            <div className="mt-16 grid border border-[#17364a] bg-[#f8f7f2] md:grid-cols-3">
              {[
                { step: '01', icon: <Search />, title: 'Observe', text: 'Open the page and establish what is actually visible.' },
                { step: '02', icon: <WandSparkles />, title: 'Inspect', text: 'Trace styles, structure, attributes, and assets in context.' },
                { step: '03', icon: <Copy />, title: 'Record', text: 'Carry a clear finding or controlled fix into your codebase.' },
              ].map((item, index) => (
                <div key={item.step} className={`relative p-7 sm:p-9 ${index < 2 ? 'border-b border-[#17364a] md:border-b-0 md:border-r' : ''}`}>
                  <div className="flex items-center justify-between">
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-[#17364a] text-[#d6b45d]">{item.icon}</span>
                    <span className="mono-label text-[#6f7f78]">{item.step}</span>
                  </div>
                  <h3 className="display-font mt-16 text-3xl font-bold tracking-[-.05em] text-[#17364a]">{item.title}</h3>
                  <p className="mt-3 max-w-[220px] text-sm leading-6 text-[#4e6666]">{item.text}</p>
                  {index < 2 && <ChevronRight className="absolute -right-4 top-1/2 z-10 hidden h-7 w-7 -translate-y-1/2 bg-[#dce7de] p-1 text-[#9a6f20] md:block" />}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="download" className="inspect-container scroll-mt-20 py-24 sm:py-32">
          <div className="relative overflow-hidden border border-[#17364a] bg-[#17364a] px-7 py-12 text-[#f4f3ee] shadow-[8px_8px_0_#c39b4a] sm:px-12 sm:py-16 lg:px-20">
            <img src="/security-inspection-seal.png" alt="" className="pointer-events-none absolute -right-24 -top-24 w-[420px] opacity-[0.09]" aria-hidden="true" />
            <div className="absolute -bottom-32 left-[46%] h-72 w-72 rounded-full border-[1px] border-white/10" />
            <div className="relative max-w-[700px]">
              <span className="mono-label text-[#d6b45d]">Ready when you are</span>
              <h2 className="display-font mt-5 text-4xl font-bold leading-[.95] tracking-[-.06em] sm:text-6xl">Make the browser show its work.</h2>
              <p className="mt-6 max-w-[550px] text-base leading-7 text-white/70 sm:text-lg">Download the Chrome package, load it unpacked, and put Security Inspection next to the work. Review what the public sees before you approve the next release.</p>
              <div className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloadState === 'checking'}
                  className="download-button outline-focus inline-flex min-h-14 items-center justify-center gap-3 border-2 border-[#d6b45d] bg-[#d6b45d] px-6 text-sm font-extrabold uppercase tracking-[.07em] text-[#102f43] shadow-[5px_5px_0_#f4f3ee] disabled:cursor-wait disabled:opacity-70"
                  data-testid="button-download-bottom"
                >
                  <Download size={18} /> {downloadState === 'checking' ? 'Checking package…' : 'Get the Chrome package'}
                </button>
                <span className="mono-label text-white/50">/downloads/SecurityInspectv1.zip</span>
              </div>
              {downloadState === 'missing' && (
                <p className="mt-5 inline-flex items-center gap-2 text-sm text-[#d6b45d]" data-testid="text-download-fallback">
                  <CircleHelp size={15} /> The hosted package is not available yet. Please try again shortly.
                </p>
              )}
            </div>
          </div>
        </section>

        <section className="border-t border-[#20253c]/15 py-10">
          <div className="inspect-container flex flex-col justify-between gap-5 text-sm text-[#4e6666] sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <span className="brand-mark grid h-9 w-9 place-items-center overflow-hidden rounded-full border border-[#c39b4a] bg-[#f4f3ee]">
                  <img src="/security-inspection-seal.png" alt="" className="h-full w-full object-contain" aria-hidden="true" />
                </span>
                <span>Security Inspection is open source software for a more accountable web.</span>
            </div>
             <span className="font-mono text-xs text-[#17364a]">Security Inspection / local-first toolkit</span>
          </div>
        </section>
      </main>
    </div>
  );
}

function Router() {
  return (
    // Keep a shared shell (sidebar, navbar) outside the boundary so it
    // survives a page crash.
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/card-security" nest>
          <CardSecurityApp />
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
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
