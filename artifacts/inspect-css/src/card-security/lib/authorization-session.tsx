import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_BUSINESS_CONFIG } from "@/card-security/config";
import type { CustomerInput } from "./types";
export type BrowserCustomer = CustomerInput & { personalStatement?: string };

export type CardSummary = {
  cardholderName: string;
  cardBrand: string;
  cardLast4: string;
};

export type AcceptedAgreement = {
  termsVersion: string;
  termsText: string;
  acceptedAt: string;
};

export type CompletedAuthorization = {
  referenceId: string;
  customer: BrowserCustomer;
  card: CardSummary;
  agreement: AcceptedAgreement;
  signatureName: string;
  completedAt: string;
  businessName: string;
};

type AuthorizationSessionContextValue = {
  customer: BrowserCustomer | null;
  card: CardSummary | null;
  setCustomer: (customer: BrowserCustomer | null) => void;
  setCard: (card: CardSummary | null) => void;
  completed: CompletedAuthorization | null;
  complete: (authorization: CompletedAuthorization) => void;
  clear: () => void;
};

const AuthorizationSessionContext = createContext<AuthorizationSessionContextValue | null>(null);

export { DEFAULT_BUSINESS_CONFIG };

export function AuthorizationSessionProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<BrowserCustomer | null>(null);
  const [card, setCard] = useState<CardSummary | null>(null);
  const [completed, setCompleted] = useState<CompletedAuthorization | null>(null);
  const value = useMemo(
    () => ({
      customer,
      card,
      setCustomer,
      setCard,
      completed,
      complete: setCompleted,
      clear: () => {
        setCustomer(null);
        setCard(null);
        setCompleted(null);
      },
    }),
    [customer, card, completed],
  );

  return (
    <AuthorizationSessionContext.Provider value={value}>
      {children}
    </AuthorizationSessionContext.Provider>
  );
}

export function useAuthorizationSession() {
  const context = useContext(AuthorizationSessionContext);
  if (!context) {
    throw new Error("useAuthorizationSession must be used within AuthorizationSessionProvider");
  }
  return context;
}