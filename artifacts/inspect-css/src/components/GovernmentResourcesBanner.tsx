import { ExternalLink, Landmark } from "lucide-react";

type ResourceCategory = "fraud" | "finance" | "credit" | "law" | "federal";

type GovernmentResource = {
  mark: string;
  name: string;
  description: string;
  href: string;
  category: ResourceCategory;
  categoryLabel: string;
};

const resources: GovernmentResource[] = [
  {
    mark: "FTC",
    name: "ReportFraud.ftc.gov",
    description: "Report scams, fraud, and deceptive business practices.",
    href: "https://reportfraud.ftc.gov/",
    category: "fraud",
    categoryLabel: "Fraud & identity theft",
  },
  {
    mark: "ID",
    name: "IdentityTheft.gov",
    description: "Identity-theft reporting and recovery guidance.",
    href: "https://www.identitytheft.gov/",
    category: "fraud",
    categoryLabel: "Fraud & identity theft",
  },
  {
    mark: "IC3",
    name: "FBI Internet Crime Complaint Center",
    description: "Report internet-facilitated crime.",
    href: "https://www.ic3.gov/",
    category: "fraud",
    categoryLabel: "Fraud & identity theft",
  },
  {
    mark: "USA",
    name: "USA.gov — Scams and Fraud",
    description: "Federal guidance for recognizing and reporting scams.",
    href: "https://www.usa.gov/scams-and-fraud",
    category: "fraud",
    categoryLabel: "Fraud & identity theft",
  },
  {
    mark: "CFPB",
    name: "Consumer Financial Protection Bureau",
    description: "Consumer financial complaints and guidance.",
    href: "https://www.consumerfinance.gov/complaint/",
    category: "finance",
    categoryLabel: "Banking & financial services",
  },
  {
    mark: "FRB",
    name: "Federal Reserve",
    description: "Federal banking-system information and consumer resources.",
    href: "https://www.federalreserve.gov/consumerscommunities.htm",
    category: "finance",
    categoryLabel: "Banking & financial services",
  },
  {
    mark: "FDIC",
    name: "Federal Deposit Insurance Corporation",
    description: "Bank-deposit insurance and banking information.",
    href: "https://www.fdic.gov/consumer-resource-center",
    category: "finance",
    categoryLabel: "Banking & financial services",
  },
  {
    mark: "OCC",
    name: "Office of the Comptroller of the Currency",
    description: "Information and complaints involving national banks.",
    href: "https://www.helpwithmybank.gov/",
    category: "finance",
    categoryLabel: "Banking & financial services",
  },
  {
    mark: "FTC",
    name: "Federal Trade Commission",
    description: "Consumer protection and identity-theft resources.",
    href: "https://consumer.ftc.gov/",
    category: "credit",
    categoryLabel: "Credit & consumer reports",
  },
  {
    mark: "ACR",
    name: "AnnualCreditReport.com",
    description: "The federally authorized source for free credit reports.",
    href: "https://www.annualcreditreport.com/",
    category: "credit",
    categoryLabel: "Credit & consumer reports",
  },
  {
    mark: "DOJ",
    name: "U.S. Department of Justice",
    description: "Federal law-enforcement information.",
    href: "https://www.justice.gov/",
    category: "law",
    categoryLabel: "Law enforcement",
  },
  {
    mark: "FBI",
    name: "Federal Bureau of Investigation",
    description: "Federal criminal investigations and reporting resources.",
    href: "https://www.fbi.gov/",
    category: "law",
    categoryLabel: "Law enforcement",
  },
  {
    mark: "USSS",
    name: "U.S. Secret Service",
    description: "Financial-crime and cybercrime investigations.",
    href: "https://www.secretservice.gov/investigations",
    category: "law",
    categoryLabel: "Law enforcement",
  },
  {
    mark: "USA",
    name: "USA.gov",
    description: "Official U.S. government information portal.",
    href: "https://www.usa.gov/",
    category: "federal",
    categoryLabel: "Other federal resources",
  },
  {
    mark: "DNC",
    name: "Do Not Call Registry",
    description: "Register or report unwanted telemarketing calls.",
    href: "https://www.donotcall.gov/",
    category: "federal",
    categoryLabel: "Other federal resources",
  },
  {
    mark: "USPIS",
    name: "U.S. Postal Inspection Service",
    description: "Report mail-related fraud and crimes.",
    href: "https://www.uspis.gov/report",
    category: "federal",
    categoryLabel: "Other federal resources",
  },
  {
    mark: "SSA",
    name: "Social Security Administration",
    description: "Social Security and identity-fraud resources.",
    href: "https://www.ssa.gov/scam/",
    category: "federal",
    categoryLabel: "Other federal resources",
  },
];

const logoByMark: Record<string, string> = {
  FTC: "ftc.png",
  ID: "identity-theft.png",
  IC3: "ic3.png",
  USA: "usa.svg",
  CFPB: "cfpb.png",
  FRB: "federal-reserve.png",
  FDIC: "fdic.png",
  OCC: "occ.png",
  ACR: "annual-credit-report.svg",
  DOJ: "doj.png",
  FBI: "fbi.png",
  USSS: "secret-service.png",
  DNC: "do-not-call.png",
  USPIS: "uspis.png",
  SSA: "ssa.png",
};

const LOGO_BASE_URL = `${import.meta.env.BASE_URL}government-logos/`;

function ResourceSet({ duplicate = false }: { duplicate?: boolean }) {
  return (
    <div className="gov-resource-set" aria-hidden={duplicate || undefined}>
      {resources.map((resource, index) => (
        <a
          key={`${resource.name}-${index}`}
          href={resource.href}
          target="_blank"
          rel="noopener noreferrer"
          className="gov-resource-card outline-focus"
          tabIndex={duplicate ? -1 : undefined}
        >
          <span className={`gov-resource-mark gov-resource-mark--${resource.category}`} aria-hidden="true">
            <span className="gov-resource-fallback">{resource.mark}</span>
            <img
              src={`${LOGO_BASE_URL}${logoByMark[resource.mark]}`}
              alt=""
              className="gov-resource-logo"
              loading="lazy"
              onError={(event) => {
                event.currentTarget.hidden = true;
              }}
            />
          </span>
          <span className="min-w-0">
            <span className="gov-resource-category">{resource.categoryLabel}</span>
            <span className="gov-resource-name">
              {resource.name}
              <ExternalLink size={12} aria-hidden="true" />
            </span>
            <span className="gov-resource-description">{resource.description}</span>
          </span>
        </a>
      ))}
    </div>
  );
}

export function GovernmentResourcesBanner() {
  return (
    <section className="gov-resources" aria-labelledby="government-resources-title">
      <div className="inspect-container">
        <div className="gov-resources-heading">
          <div className="flex items-center justify-center gap-3 text-center">
            <span className="gov-resources-heading-icon" aria-hidden="true">
              <Landmark size={22} />
            </span>
            <div>
              <h2 id="government-resources-title" className="display-font text-xl font-bold tracking-[-.04em] text-[#102f43] sm:text-2xl">
                Official Partnership with Trusted Federal Resources
              </h2>
            </div>
          </div>
        </div>
      </div>

      <div
        className="gov-resource-marquee"
        aria-label="Official United States government resources"
      >
        <div className="gov-resource-track">
          <ResourceSet />
          <ResourceSet duplicate />
        </div>
      </div>
    </section>
  );
}