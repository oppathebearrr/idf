import { createContext, useContext, useState, type ReactNode } from "react";

export type IncidentInfo = {
  incidentDate: string;
  incidentType: string;
  contactChannel: string;
};

export type NarrativeInfo = {
  description: string;
  suspectName: string;
  suspectContact: string;
};

export type FinancialInfo = {
  amountLost: string;
  paymentMethod: string;
  affectedAccounts: string;
};

export function formatAmountLost(value: string, fallback: string) {
  const trimmed = value.trim();
  if (!trimmed) return fallback;
  return trimmed.startsWith("$") ? trimmed : `$${trimmed}`;
}

export type EvidenceInfo = {
  hasScreenshots: boolean;
  hasEmails: boolean;
  hasReceipts: boolean;
  additionalNotes: string;
};

export type ReporterInfo = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
};

export type FraudReportCompleted = {
  incident: IncidentInfo;
  narrative: NarrativeInfo;
  financial: FinancialInfo;
  evidence: EvidenceInfo;
  reporter: ReporterInfo;
  completedAt: string;
  referenceId: string;
};

type SessionState = {
  incident: IncidentInfo;
  narrative: NarrativeInfo;
  financial: FinancialInfo;
  evidence: EvidenceInfo;
  reporter: ReporterInfo;
  completed: FraudReportCompleted | null;
};

const initialState: SessionState = {
  incident: { incidentDate: "", incidentType: "", contactChannel: "" },
  narrative: { description: "", suspectName: "", suspectContact: "" },
  financial: { amountLost: "", paymentMethod: "", affectedAccounts: "" },
  evidence: { hasScreenshots: false, hasEmails: false, hasReceipts: false, additionalNotes: "" },
  reporter: {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
  },
  completed: null,
};

type FraudSessionContextType = SessionState & {
  updateIncident: (data: Partial<IncidentInfo>) => void;
  updateNarrative: (data: Partial<NarrativeInfo>) => void;
  updateFinancial: (data: Partial<FinancialInfo>) => void;
  updateEvidence: (data: Partial<EvidenceInfo>) => void;
  updateReporter: (data: Partial<ReporterInfo>) => void;
  completeReport: () => void;
  clear: () => void;
};

const FraudSessionContext = createContext<FraudSessionContextType | null>(null);

export function FraudSessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>(initialState);

  const updateIncident = (data: Partial<IncidentInfo>) => setState(s => ({ ...s, incident: { ...s.incident, ...data } }));
  const updateNarrative = (data: Partial<NarrativeInfo>) => setState(s => ({ ...s, narrative: { ...s.narrative, ...data } }));
  const updateFinancial = (data: Partial<FinancialInfo>) => setState(s => ({ ...s, financial: { ...s.financial, ...data } }));
  const updateEvidence = (data: Partial<EvidenceInfo>) => setState(s => ({ ...s, evidence: { ...s.evidence, ...data } }));
  const updateReporter = (data: Partial<ReporterInfo>) => setState(s => ({ ...s, reporter: { ...s.reporter, ...data } }));

  const completeReport = () => {
    setState(s => ({
      ...s,
      completed: {
        incident: s.incident,
        narrative: s.narrative,
        financial: s.financial,
        evidence: s.evidence,
        reporter: s.reporter,
        completedAt: new Date().toISOString(),
        referenceId: `FRD-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      }
    }));
  };

  const clear = () => setState(initialState);

  return (
    <FraudSessionContext.Provider value={{
      ...state,
      updateIncident,
      updateNarrative,
      updateFinancial,
      updateEvidence,
      updateReporter,
      completeReport,
      clear
    }}>
      {children}
    </FraudSessionContext.Provider>
  );
}

export function useFraudSession() {
  const context = useContext(FraudSessionContext);
  if (!context) throw new Error("useFraudSession must be used within Provider");
  return context;
}
