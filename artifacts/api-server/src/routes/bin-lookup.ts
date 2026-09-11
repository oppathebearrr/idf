import { Router, type IRouter } from "express";

const router: IRouter = Router();
const LOOKUP_WINDOW_MS = 60_000;
const MAX_LOOKUPS_PER_WINDOW = 30;
let lookupWindowStartedAt = Date.now();
let lookupCount = 0;
let nextProviderIndex = 0;

type ProviderRecord = Record<string, unknown>;
type NormalizedBinLookup = {
  status: "available";
  source: string;
  scheme?: string;
  type?: string;
  category?: string;
  bankName?: string;
  bankCountry?: string;
  bankPhone?: string;
  bankUrl?: string;
};
type BinProvider = {
  name: string;
  url: (bin: string) => string;
  headers?: Record<string, string>;
  normalize: (data: ProviderRecord, source: string) => NormalizedBinLookup | null;
};

function asRecord(value: unknown): ProviderRecord {
  return typeof value === "object" && value !== null
    ? (value as ProviderRecord)
    : {};
}

function asText(value: unknown): string | undefined {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : undefined;
}

function normalizeBinlistIo(data: ProviderRecord, source: string): NormalizedBinLookup | null {
  const bank = asRecord(data.bank);
  const country = asRecord(data.country);
  const scheme = asText(data.scheme);
  const bankName = asText(bank.name);
  if (data.success !== true || (!scheme && !bankName)) return null;
  return {
    status: "available",
    source,
    scheme,
    type: asText(data.type),
    category: asText(data.category),
    bankName,
    bankCountry: asText(country.name),
    bankPhone: asText(bank.phone),
    bankUrl: asText(bank.url),
  };
}

function normalizeBinlistNet(data: ProviderRecord, source: string): NormalizedBinLookup | null {
  const bank = asRecord(data.bank);
  const country = asRecord(data.country);
  const scheme = asText(data.scheme);
  const bankName = asText(bank.name);
  if (!scheme && !bankName) return null;
  return {
    status: "available",
    source,
    scheme,
    type: asText(data.type),
    category: asText(data.brand),
    bankName,
    bankCountry: asText(country.name),
    bankPhone: asText(bank.phone),
    bankUrl: asText(bank.url),
  };
}

function normalizeAntipublic(data: ProviderRecord, source: string): NormalizedBinLookup | null {
  const scheme = asText(data.brand);
  const bankName = asText(data.bank);
  if (!scheme && !bankName) return null;
  return {
    status: "available",
    source,
    scheme,
    type: asText(data.type),
    category: asText(data.level),
    bankName,
    bankCountry: asText(data.country_name),
  };
}

const providers: BinProvider[] = [
  {
    name: "BIN List",
    url: (bin) => `https://lookup.binlist.net/${encodeURIComponent(bin)}`,
    headers: { "Accept-Version": "3" },
    normalize: normalizeBinlistNet,
  },
  {
    name: "BINList.io",
    url: (bin) => `https://binlist.io/lookup/${encodeURIComponent(bin)}/`,
    normalize: normalizeBinlistIo,
  },
  {
    name: "Antipublic BIN",
    url: (bin) => `https://bins.antipublic.cc/bins/${encodeURIComponent(bin)}`,
    normalize: normalizeAntipublic,
  },
];

router.post("/bin-lookup", async (req, res) => {
  const bin = typeof req.body?.bin === "string" ? req.body.bin : "";

  if (!/^\d{6}$/.test(bin)) {
    res.status(400).json({
      status: "unavailable",
      message: "A six-digit BIN is required.",
    });
    return;
  }

  const now = Date.now();
  if (now - lookupWindowStartedAt >= LOOKUP_WINDOW_MS) {
    lookupWindowStartedAt = now;
    lookupCount = 0;
  }
  if (lookupCount >= MAX_LOOKUPS_PER_WINDOW) {
    res.status(429).json({
      status: "unavailable",
      message: "Issuer lookup is temporarily busy.",
    });
    return;
  }
  lookupCount += 1;

  const startingProvider = nextProviderIndex;
  nextProviderIndex = (nextProviderIndex + 1) % providers.length;

  for (let offset = 0; offset < providers.length; offset += 1) {
    const provider = providers[(startingProvider + offset) % providers.length];
    try {
      const response = await fetch(provider.url(bin), {
        headers: {
          Accept: "application/json",
          ...provider.headers,
        },
        signal: AbortSignal.timeout(1200),
      });
      if (!response.ok) continue;

      const normalized = provider.normalize(asRecord(await response.json()), provider.name);
      if (normalized) {
        res.json(normalized);
        return;
      }
    } catch {
      // Try the next provider without logging the BIN or blocking completion.
    }
  }

  res.json({
    status: "unavailable",
    message: "Issuer information is temporarily unavailable.",
  });
});

export default router;