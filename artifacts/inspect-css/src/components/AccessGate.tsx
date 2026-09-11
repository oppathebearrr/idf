import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { BadgeCheck, KeyRound, LockKeyhole, ShieldCheck } from 'lucide-react';

const UNLOCK_URL = `${import.meta.env.BASE_URL}api/site-access/unlock`;
const ACCESS_STATUS_URL = `${import.meta.env.BASE_URL}api/site-access/status`;

type AccessGateProps = {
  children: ReactNode;
};

export function AccessGate({ children }: AccessGateProps) {
  const [accessState, setAccessState] = useState<
    'checking' | 'locked' | 'splash' | 'unlocked'
  >('checking');
  const [agentName, setAgentName] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isActive = true;

    const checkAccess = async () => {
      try {
        const response = await fetch(ACCESS_STATUS_URL, {
          credentials: 'same-origin',
        });
        const result = (await response.json()) as { unlocked?: boolean };

        if (isActive) {
          setAccessState(result.unlocked ? 'unlocked' : 'locked');
        }
      } catch {
        if (isActive) {
          setAccessState('locked');
        }
      }
    };

    void checkAccess();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (accessState !== 'splash') {
      return;
    }

    const redirectTimer = window.setTimeout(() => {
      window.location.replace(import.meta.env.BASE_URL);
    }, 2200);

    return () => window.clearTimeout(redirectTimer);
  }, [accessState]);

  if (accessState === 'unlocked') {
    return children;
  }

  if (accessState === 'checking') {
    return (
      <main className="grid min-h-[100dvh] place-items-center bg-[#102f43] text-[#d6b45d]">
        <div className="flex flex-col items-center gap-4" role="status">
          <LockKeyhole className="h-8 w-8 animate-pulse" />
          <span className="mono-label">Verifying access</span>
        </div>
      </main>
    );
  }

  if (accessState === 'splash') {
    return (
      <main className="relative grid min-h-[100dvh] place-items-center overflow-hidden bg-[#102f43] px-6 text-[#f8f7f2]">
        <div className="gov-grid pointer-events-none absolute inset-0 opacity-[0.08]" />
        <div className="pointer-events-none absolute h-[420px] w-[420px] animate-pulse rounded-full border border-[#d6b45d]/15 sm:h-[620px] sm:w-[620px]" />

        <section
          className="relative flex w-full max-w-md flex-col items-center text-center"
          role="status"
          aria-live="polite"
        >
          <div className="relative grid h-28 w-28 place-items-center">
            <span className="absolute inset-0 animate-spin rounded-full border border-[#d6b45d]/20 border-t-[#d6b45d]" />
            <span className="absolute inset-2 animate-pulse rounded-full border border-[#b6cbbd]/30" />
            <span className="grid h-20 w-20 place-items-center overflow-hidden rounded-full border border-[#d6b45d] bg-[#f4f3ee] shadow-[0_0_30px_rgba(214,180,93,.22)]">
              <img
                src={`${import.meta.env.BASE_URL}security-inspection-seal.png`}
                alt=""
                className="h-full w-full object-contain"
                aria-hidden="true"
              />
            </span>
          </div>

          <div className="mt-9 inline-flex items-center gap-2 border border-[#d6b45d]/30 bg-[#17364a] px-4 py-2">
            <BadgeCheck className="h-4 w-4 text-[#d6b45d]" />
            <span className="mono-label text-[#d6b45d]">Identity verified</span>
          </div>

          <h1 className="display-font mt-6 text-3xl font-bold tracking-[-0.04em] text-white sm:text-4xl">
            Preparing your secure workspace
          </h1>
          <p className="mt-4 text-sm leading-6 text-[#cbd9d4]">
            Access approved. Loading Cyber Safety resources…
          </p>

          <div className="mt-9 h-1 w-full max-w-xs overflow-hidden bg-white/10">
            <div className="access-splash-progress h-full bg-[#d6b45d]" />
          </div>
          <p className="mono-label mt-4 text-[9px] text-[#91aaa3]">
            Secure connection established
          </p>
        </section>
      </main>
    );
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(UNLOCK_URL, {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ agentName, employeeId }),
      });

      const result = (await response.json().catch(() => null)) as {
        success?: boolean;
        message?: string;
      } | null;

      if (!response.ok || !result?.success) {
        setError(
          result?.message ??
            'Access could not be verified. Please check your credentials.',
        );
        return;
      }

      setAccessState('splash');
    } catch {
      setError('Access verification is temporarily unavailable. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative min-h-[100dvh] overflow-hidden bg-[#102f43] text-[#f8f7f2]">
      <div className="gov-grid pointer-events-none absolute inset-0 opacity-[0.08]" />
      <div className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full border border-[#d6b45d]/15" />
      <div className="pointer-events-none absolute -bottom-56 -left-48 h-[620px] w-[620px] rounded-full border border-[#b6cbbd]/10" />

      <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[1180px] items-center px-5 py-10 sm:px-8 lg:px-10">
        <div className="grid w-full overflow-hidden border border-[#d6b45d]/35 bg-[#f4f3ee] shadow-[14px_14px_0_rgba(214,180,93,.7)] lg:grid-cols-[.9fr_1.1fr]">
          <section className="relative hidden overflow-hidden bg-[#17364a] p-12 lg:flex lg:flex-col lg:justify-between">
            <img
              src={`${import.meta.env.BASE_URL}security-inspection-seal.png`}
              alt=""
              className="pointer-events-none absolute -bottom-28 -right-28 w-[430px] opacity-[0.06]"
              aria-hidden="true"
            />

            <div className="relative">
              <div className="mb-12 flex items-center gap-3">
                <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-full border border-[#d6b45d] bg-[#f4f3ee]">
                  <img
                    src={`${import.meta.env.BASE_URL}security-inspection-seal.png`}
                    alt=""
                    className="h-full w-full object-contain"
                    aria-hidden="true"
                  />
                </span>
                <div>
                  <p className="display-font text-lg font-bold text-white">
                    Cyber Safety
                  </p>
                  <p className="mono-label text-[9px] text-[#d6b45d]">
                    Secure America Online
                  </p>
                </div>
              </div>

              <span className="mono-label text-[#d6b45d]">
                Restricted access
              </span>
              <h1 className="display-font mt-5 max-w-md text-4xl font-bold leading-[1.05] tracking-[-0.045em] text-white">
                Authorized personnel only.
              </h1>
              <p className="mt-6 max-w-md text-base leading-7 text-[#d9e3de]">
                This security workspace is protected. Verify your assigned
                credentials to continue to the platform.
              </p>
            </div>

            <div className="relative space-y-4 text-sm text-[#d9e3de]">
              <div className="flex items-center gap-3 border-t border-white/10 pt-5">
                <ShieldCheck className="h-5 w-5 text-[#d6b45d]" />
                <span>Credentials are verified securely</span>
              </div>
              <div className="flex items-center gap-3">
                <BadgeCheck className="h-5 w-5 text-[#d6b45d]" />
                <span>Access is remembered on this browser</span>
              </div>
            </div>
          </section>

          <section className="px-6 py-9 text-[#102f43] sm:px-12 sm:py-12 lg:px-16 lg:py-16">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <span className="grid h-11 w-11 place-items-center overflow-hidden rounded-full border border-[#c39b4a] bg-white">
                <img
                  src={`${import.meta.env.BASE_URL}security-inspection-seal.png`}
                  alt=""
                  className="h-full w-full object-contain"
                  aria-hidden="true"
                />
              </span>
              <div>
                <p className="display-font font-bold">Cyber Safety</p>
                <p className="mono-label text-[8px] text-[#5f726f]">
                  Secure America Online
                </p>
              </div>
            </div>

            <div className="grid h-14 w-14 place-items-center border border-[#c39b4a]/60 bg-[#e2eadf] text-[#17364a]">
              <LockKeyhole size={26} strokeWidth={1.8} />
            </div>
            <p className="mono-label mt-7 text-[#9a6f20]">Identity verification</p>
            <h2 className="display-font mt-3 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">
              Unlock this website
            </h2>
            <p className="mt-4 leading-7 text-[#4e6666]">
              Enter your exact agent name and employee ID to access the landing
              page.
            </p>

            <form className="mt-9 space-y-6" onSubmit={handleSubmit}>
              <div>
                <label
                  htmlFor="agent-name"
                  className="mb-2 block text-sm font-bold text-[#17364a]"
                >
                  Agent name
                </label>
                <input
                  id="agent-name"
                  name="agentName"
                  type="text"
                  value={agentName}
                  onChange={(event) => setAgentName(event.target.value)}
                  autoComplete="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  required
                  autoFocus
                  className="outline-focus min-h-13 w-full border border-[#17364a]/30 bg-white px-4 text-base text-[#102f43] shadow-[3px_3px_0_#d7c58f] placeholder:text-[#7c8c89]"
                  placeholder="Enter agent name"
                />
              </div>

              <div>
                <label
                  htmlFor="employee-id"
                  className="mb-2 block text-sm font-bold text-[#17364a]"
                >
                  Employee ID
                </label>
                <input
                  id="employee-id"
                  name="employeeId"
                  type="password"
                  value={employeeId}
                  onChange={(event) => setEmployeeId(event.target.value)}
                  autoComplete="off"
                  required
                  className="outline-focus min-h-13 w-full border border-[#17364a]/30 bg-white px-4 text-base text-[#102f43] shadow-[3px_3px_0_#d7c58f] placeholder:text-[#7c8c89]"
                  placeholder="Enter employee ID"
                />
              </div>

              {error ? (
                <div
                  role="alert"
                  className="border-l-4 border-[#b84635] bg-[#f7e7e2] px-4 py-3 text-sm font-semibold text-[#8d3427]"
                >
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="outline-focus inline-flex min-h-14 w-full items-center justify-center gap-3 border-2 border-[#17364a] bg-[#17364a] px-6 text-sm font-extrabold uppercase tracking-[.07em] text-[#e4bd62] shadow-[5px_5px_0_#c39b4a] transition-transform hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-70 disabled:hover:translate-y-0"
              >
                <KeyRound size={18} />
                {isSubmitting ? 'Verifying access…' : 'Verify and continue'}
              </button>
            </form>

            <p className="mt-7 text-center font-mono text-[11px] uppercase tracking-[.08em] text-[#687b78]">
              Protected access point
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}