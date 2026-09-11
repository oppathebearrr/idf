import { useState, useMemo } from "react";
import { useAppLocation } from "../lib/router";
import { SharedLayout } from "../components/Layout";
import { useFraudSession, type IncidentInfo, type NarrativeInfo, type FinancialInfo, type EvidenceInfo, type ReporterInfo } from "../lib/fraud-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck, ArrowRight, ArrowLeft } from "lucide-react";

function FieldError({ error, id }: { error?: string; id?: string }) {
  if (!error) return null;
  return <p id={id} className="text-[#b84635] text-xs font-bold mt-1.5" role="alert">{error}</p>;
}

export default function Wizard() {
  const [, setLocation] = useAppLocation();
  const session = useFraudSession();
  const [step, setStep] = useState(1);

  const handleNext = () => setStep((s) => s + 1);
  const handlePrev = () => setStep((s) => s - 1);

  const handleComplete = () => {
    session.completeReport();
    setLocation("/confirmation");
  };

  return (
    <SharedLayout>
      <div className="inspect-container py-8 sm:py-12 flex-1 max-w-[800px] w-full mx-auto">
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-[#4e6666] mb-4">
            <span>Step {step} of 6</span>
            <span className="text-[#102f43]">
              {step === 1 && "Incident type"}
              {step === 2 && "Narrative"}
              {step === 3 && "Financial impact"}
              {step === 4 && "Evidence"}
              {step === 5 && "Review"}
            </span>
          </div>
          <div className="h-1.5 bg-[#e2eadf] w-full rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#17364a] transition-all duration-300 ease-in-out" 
              style={{ width: `${(step / 6) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white border border-[#17364a]/20 shadow-[8px_8px_0_rgba(23,54,74,0.05)] p-6 sm:p-10 animate-fade-in">
          {step === 1 && <Step1Incident session={session} onNext={handleNext} />}
          {step === 2 && <Step2Narrative session={session} onNext={handleNext} onPrev={handlePrev} />}
          {step === 3 && <Step3Financial session={session} onNext={handleNext} onPrev={handlePrev} />}
          {step === 4 && <Step4Evidence session={session} onNext={handleNext} onPrev={handlePrev} />}
          {step === 5 && <Step5Review session={session} onComplete={handleComplete} onPrev={handlePrev} />}
        </div>
      </div>
    </SharedLayout>
  );
}

function Step1Incident({ session, onNext }: { session: ReturnType<typeof useFraudSession>; onNext: () => void }) {
  const [data, setData] = useState<IncidentInfo>(session.incident);
  const [touched, setTouched] = useState<Record<keyof IncidentInfo, boolean>>({
    incidentDate: false, incidentType: false, contactChannel: false
  });

  const errors = useMemo(() => {
    const errs: Partial<Record<keyof IncidentInfo, string>> = {};
    if (!data.incidentDate.trim()) {
      errs.incidentDate = "Incident date is required.";
    } else {
      const d = new Date(data.incidentDate);
      if (isNaN(d.getTime())) {
        errs.incidentDate = "Invalid date format.";
      } else if (d > new Date()) {
        errs.incidentDate = "Date cannot be in the future.";
      } else if (d < new Date("1900-01-01")) {
        errs.incidentDate = "Date is implausibly old.";
      }
    }

    if (!data.incidentType.trim()) {
      errs.incidentType = "Type of fraud is required.";
    }

    const channel = data.contactChannel.trim();
    if (!channel) {
      errs.contactChannel = "Contact method is required.";
    } else if (channel.length > 100) {
      errs.contactChannel = "Must be 100 characters or less.";
    }
    return errs;
  }, [data]);

  const handleBlur = (field: keyof IncidentInfo) => setTouched(prev => ({ ...prev, [field]: true }));

  const handleContinue = () => {
    if (Object.keys(errors).length === 0) {
      session.updateIncident({
        incidentDate: data.incidentDate.trim(),
        incidentType: data.incidentType.trim(),
        contactChannel: data.contactChannel.trim(),
      });
      onNext();
    } else {
      setTouched({ incidentDate: true, incidentType: true, contactChannel: true });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="display-font text-2xl font-bold text-[#102f43]">Incident Details</h2>
        <p className="text-[#4e6666] text-sm mt-1">When and how did this incident occur?</p>
      </div>
      
      <div className="space-y-5">
        <div>
          <label htmlFor="incidentDate" className="block text-xs font-bold uppercase tracking-wider text-[#102f43] mb-1.5">
            Date of incident <span className="text-[#b84635]">*</span>
          </label>
          <Input 
            id="incidentDate"
            type="date"
            max={new Date().toISOString().split('T')[0]}
            className={`h-12 border-[#17364a]/30 focus-visible:ring-[#c39b4a] ${touched.incidentDate && errors.incidentDate ? 'border-[#b84635] focus-visible:ring-[#b84635]' : ''}`}
            value={data.incidentDate}
            onChange={e => setData({...data, incidentDate: e.target.value})}
            onBlur={() => handleBlur('incidentDate')}
            aria-invalid={!!(touched.incidentDate && errors.incidentDate)}
            aria-describedby={errors.incidentDate ? "err-incidentDate" : undefined}
          />
          {touched.incidentDate && <FieldError error={errors.incidentDate} id="err-incidentDate" />}
        </div>
        
        <div>
          <label htmlFor="incidentType" className="block text-xs font-bold uppercase tracking-wider text-[#102f43] mb-1.5">
            Type of fraud <span className="text-[#b84635]">*</span>
          </label>
          <Select 
            value={data.incidentType} 
            onValueChange={v => {
              setData({...data, incidentType: v});
              setTouched(prev => ({...prev, incidentType: true}));
            }}
          >
            <SelectTrigger 
              id="incidentType"
              className={`h-12 border-[#17364a]/30 focus:ring-[#c39b4a] ${touched.incidentType && errors.incidentType ? 'border-[#b84635] focus:ring-[#b84635]' : ''}`}
              aria-invalid={!!(touched.incidentType && errors.incidentType)}
              aria-describedby={errors.incidentType ? "err-incidentType" : undefined}
            >
              <SelectValue placeholder="Select type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Phishing / Fake Website">Phishing / Fake Website</SelectItem>
              <SelectItem value="Identity Theft">Identity Theft</SelectItem>
              <SelectItem value="Online Shopping Scam">Online Shopping Scam</SelectItem>
              <SelectItem value="Tech Support Scam">Trojan Virus Attack</SelectItem>
              <SelectItem value="Investment Scam">Investment Scam</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
          {touched.incidentType && <FieldError error={errors.incidentType} id="err-incidentType" />}
        </div>

        <div>
          <label htmlFor="contactChannel" className="block text-xs font-bold uppercase tracking-wider text-[#102f43] mb-1.5">
            What was the last activity or contact associated with the incident? <span className="text-[#b84635]">*</span>
          </label>
          <Input 
            id="contactChannel"
            maxLength={100}
            placeholder="e.g. Email, Phone call, Social Media, Website ad"
            className={`h-12 border-[#17364a]/30 focus-visible:ring-[#c39b4a] ${touched.contactChannel && errors.contactChannel ? 'border-[#b84635] focus-visible:ring-[#b84635]' : ''}`}
            value={data.contactChannel}
            onChange={e => setData({...data, contactChannel: e.target.value})}
            onBlur={() => handleBlur('contactChannel')}
            aria-invalid={!!(touched.contactChannel && errors.contactChannel)}
            aria-describedby={errors.contactChannel ? "err-contactChannel" : undefined}
          />
          {touched.contactChannel && <FieldError error={errors.contactChannel} id="err-contactChannel" />}
        </div>
      </div>

      <div className="pt-4">
        <Button 
          onClick={handleContinue}
          className="w-full h-14 bg-[#17364a] hover:bg-[#102f43] text-[#e4bd62] font-bold uppercase tracking-wider transition-transform active:translate-y-1"
        >
          Continue <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function Step2Narrative({ session, onNext, onPrev }: { session: ReturnType<typeof useFraudSession>; onNext: () => void; onPrev: () => void }) {
  const [data, setData] = useState<NarrativeInfo>(session.narrative);
  const [touched, setTouched] = useState<Record<keyof NarrativeInfo, boolean>>({
    description: false, suspectName: false, suspectContact: false
  });

  const errors = useMemo(() => {
    const errs: Partial<Record<keyof NarrativeInfo, string>> = {};
    const desc = data.description.trim();
    if (!desc) {
      errs.description = "Narrative is required.";
    } else if (desc.length < 20) {
      errs.description = "Please provide more detail (minimum 20 characters).";
    } else if (desc.length > 2000) {
      errs.description = "Must be 2000 characters or less.";
    }

    if (data.suspectName.trim().length > 100) {
      errs.suspectName = "Must be 100 characters or less.";
    }
    if (data.suspectContact.trim().length > 100) {
      errs.suspectContact = "Must be 100 characters or less.";
    }
    return errs;
  }, [data]);

  const handleBlur = (field: keyof NarrativeInfo) => setTouched(prev => ({ ...prev, [field]: true }));

  const handleContinue = () => {
    if (Object.keys(errors).length === 0) {
      session.updateNarrative({
        description: data.description.trim(),
        suspectName: data.suspectName.trim(),
        suspectContact: data.suspectContact.trim(),
      });
      onNext();
    } else {
      setTouched({ description: true, suspectName: true, suspectContact: true });
    }
  };

  const handleBack = () => {
    session.updateNarrative(data);
    onPrev();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="display-font text-2xl font-bold text-[#102f43]">Narrative & Suspect</h2>
        <p className="text-[#4e6666] text-sm mt-1">Describe what happened and who was involved.</p>
      </div>
      
      <div className="space-y-5">
        <div>
          <label htmlFor="description" className="block text-xs font-bold uppercase tracking-wider text-[#102f43] mb-1.5">
            What happened? (Do not include passwords or SSN) <span className="text-[#b84635]">*</span>
          </label>
          <Textarea 
            id="description"
            maxLength={2000}
            className={`min-h-[120px] resize-y border-[#17364a]/30 focus-visible:ring-[#c39b4a] ${touched.description && errors.description ? 'border-[#b84635] focus-visible:ring-[#b84635]' : ''}`}
            placeholder="Briefly describe the timeline of events..."
            value={data.description}
            onChange={e => setData({...data, description: e.target.value})}
            onBlur={() => handleBlur('description')}
            aria-invalid={!!(touched.description && errors.description)}
            aria-describedby={errors.description ? "err-description" : undefined}
          />
          <div className="flex justify-between items-start mt-1.5">
            <div>{touched.description && <FieldError error={errors.description} id="err-description" />}</div>
            <span className="text-[10px] font-medium text-[#4e6666]">{data.description.length} / 2000</span>
          </div>
        </div>
        
        <div>
          <label htmlFor="suspectName" className="block text-xs font-bold uppercase tracking-wider text-[#102f43] mb-1.5">
            Suspect Name or Alias <span className="text-[#4e6666] font-normal lowercase tracking-normal">(optional)</span>
          </label>
          <Input 
            id="suspectName"
            maxLength={100}
            className={`h-12 border-[#17364a]/30 focus-visible:ring-[#c39b4a] ${touched.suspectName && errors.suspectName ? 'border-[#b84635] focus-visible:ring-[#b84635]' : ''}`}
            placeholder="e.g. 'John Smith' or 'Stake LLC'"
            value={data.suspectName}
            onChange={e => setData({...data, suspectName: e.target.value})}
            onBlur={() => handleBlur('suspectName')}
            aria-invalid={!!(touched.suspectName && errors.suspectName)}
            aria-describedby={errors.suspectName ? "err-suspectName" : undefined}
          />
          {touched.suspectName && <FieldError error={errors.suspectName} id="err-suspectName" />}
        </div>
        
        <div>
          <label htmlFor="suspectContact" className="block text-xs font-bold uppercase tracking-wider text-[#102f43] mb-1.5">
            Disputed Company or Organization <span className="text-[#4e6666] font-normal lowercase tracking-normal">(optional)</span>
          </label>
          <Input 
            id="suspectContact"
            maxLength={100}
            className={`h-12 border-[#17364a]/30 focus-visible:ring-[#c39b4a] ${touched.suspectContact && errors.suspectContact ? 'border-[#b84635] focus-visible:ring-[#b84635]' : ''}`}
            placeholder="Stake, BET365, Pornhub, xHamster"
            value={data.suspectContact}
            onChange={e => setData({...data, suspectContact: e.target.value})}
            onBlur={() => handleBlur('suspectContact')}
            aria-invalid={!!(touched.suspectContact && errors.suspectContact)}
            aria-describedby={errors.suspectContact ? "err-suspectContact" : undefined}
          />
          {touched.suspectContact && <FieldError error={errors.suspectContact} id="err-suspectContact" />}
        </div>
      </div>

      <div className="pt-4 flex gap-4">
        <Button 
          variant="outline"
          onClick={handleBack}
          className="h-14 px-6 border-2 border-[#17364a] text-[#17364a] font-bold uppercase tracking-wider transition-transform active:translate-y-1"
        >
          <ArrowLeft className="mr-2 w-4 h-4" /> Back
        </Button>
        <Button 
          onClick={handleContinue}
          className="flex-1 h-14 bg-[#17364a] hover:bg-[#102f43] text-[#e4bd62] font-bold uppercase tracking-wider transition-transform active:translate-y-1"
        >
          Continue <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function Step3Financial({ session, onNext, onPrev }: { session: ReturnType<typeof useFraudSession>; onNext: () => void; onPrev: () => void }) {
  const [data, setData] = useState<FinancialInfo>(session.financial);
  const [touched, setTouched] = useState<Record<keyof FinancialInfo, boolean>>({
    amountLost: false, paymentMethod: false, affectedAccounts: false
  });

  const errors = useMemo(() => {
    const errs: Partial<Record<keyof FinancialInfo, string>> = {};
    const amount = data.amountLost.trim();
    if (amount) {
      const val = amount.replace(/[^0-9.]/g, '');
      const num = parseFloat(val);
      if (isNaN(num) || num < 0) {
        errs.amountLost = "Must be a valid positive amount.";
      } else if (val.split('.')[1]?.length > 2) {
        errs.amountLost = "Cannot have more than 2 decimal places.";
      } else if (num > 1000000000) {
        errs.amountLost = "Amount is implausibly large.";
      }
    }
    
    if (data.paymentMethod.trim().length > 100) {
      errs.paymentMethod = "Must be 100 characters or less.";
    }
    if (data.affectedAccounts.trim().length > 200) {
      errs.affectedAccounts = "Must be 200 characters or less.";
    }
    return errs;
  }, [data]);

  const handleBlur = (field: keyof FinancialInfo) => setTouched(prev => ({ ...prev, [field]: true }));

  const handleContinue = () => {
    if (Object.keys(errors).length === 0) {
      session.updateFinancial({
        amountLost: data.amountLost.trim(),
        paymentMethod: data.paymentMethod.trim(),
        affectedAccounts: data.affectedAccounts.trim(),
      });
      onNext();
    } else {
      setTouched({ amountLost: true, paymentMethod: true, affectedAccounts: true });
    }
  };

  const handleBack = () => {
    session.updateFinancial(data);
    onPrev();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="display-font text-2xl font-bold text-[#102f43]">Financial Impact</h2>
        <p className="text-[#4e6666] text-sm mt-1">If money was lost, summarize it below. Do not include full account numbers.</p>
      </div>
      
      <div className="space-y-5">
        <div>
          <label htmlFor="amountLost" className="block text-xs font-bold uppercase tracking-wider text-[#102f43] mb-1.5">
            Estimated Amount Lost <span className="text-[#4e6666] font-normal lowercase tracking-normal">(optional)</span>
          </label>
          <Input 
            id="amountLost"
            inputMode="decimal"
            className={`h-12 border-[#17364a]/30 focus-visible:ring-[#c39b4a] ${touched.amountLost && errors.amountLost ? 'border-[#b84635] focus-visible:ring-[#b84635]' : ''}`}
            placeholder="$0.00"
            value={data.amountLost}
            onChange={e => setData({...data, amountLost: e.target.value})}
            onBlur={() => handleBlur('amountLost')}
            aria-invalid={!!(touched.amountLost && errors.amountLost)}
            aria-describedby={errors.amountLost ? "err-amountLost" : undefined}
          />
          {touched.amountLost && <FieldError error={errors.amountLost} id="err-amountLost" />}
        </div>
        
        <div>
          <label htmlFor="paymentMethod" className="block text-xs font-bold uppercase tracking-wider text-[#102f43] mb-1.5">
            Payment Method Used <span className="text-[#4e6666] font-normal lowercase tracking-normal">(optional)</span>
          </label>
          <Input 
            id="paymentMethod"
            maxLength={100}
            className={`h-12 border-[#17364a]/30 focus-visible:ring-[#c39b4a] ${touched.paymentMethod && errors.paymentMethod ? 'border-[#b84635] focus-visible:ring-[#b84635]' : ''}`}
            placeholder="e.g. Credit Card, Wire Transfer, Crypto, Gift Card"
            value={data.paymentMethod}
            onChange={e => setData({...data, paymentMethod: e.target.value})}
            onBlur={() => handleBlur('paymentMethod')}
            aria-invalid={!!(touched.paymentMethod && errors.paymentMethod)}
            aria-describedby={errors.paymentMethod ? "err-paymentMethod" : undefined}
          />
          {touched.paymentMethod && <FieldError error={errors.paymentMethod} id="err-paymentMethod" />}
        </div>
        
        <div>
          <label htmlFor="affectedAccounts" className="block text-xs font-bold uppercase tracking-wider text-[#102f43] mb-1.5">
            Affected Institutions <span className="text-[#4e6666] font-normal lowercase tracking-normal">(optional)</span>
          </label>
          <Input 
            id="affectedAccounts"
            maxLength={200}
            className={`h-12 border-[#17364a]/30 focus-visible:ring-[#c39b4a] ${touched.affectedAccounts && errors.affectedAccounts ? 'border-[#b84635] focus-visible:ring-[#b84635]' : ''}`}
            placeholder="e.g. Chase Bank, PayPal (Name of bank only)"
            value={data.affectedAccounts}
            onChange={e => setData({...data, affectedAccounts: e.target.value})}
            onBlur={() => handleBlur('affectedAccounts')}
            aria-invalid={!!(touched.affectedAccounts && errors.affectedAccounts)}
            aria-describedby={errors.affectedAccounts ? "err-affectedAccounts" : undefined}
          />
          {touched.affectedAccounts && <FieldError error={errors.affectedAccounts} id="err-affectedAccounts" />}
        </div>
      </div>

      <div className="pt-4 flex gap-4">
        <Button 
          variant="outline"
          onClick={handleBack}
          className="h-14 px-6 border-2 border-[#17364a] text-[#17364a] font-bold uppercase tracking-wider transition-transform active:translate-y-1"
        >
          <ArrowLeft className="mr-2 w-4 h-4" /> Back
        </Button>
        <Button 
          onClick={handleContinue}
          className="flex-1 h-14 bg-[#17364a] hover:bg-[#102f43] text-[#e4bd62] font-bold uppercase tracking-wider transition-transform active:translate-y-1"
        >
          Continue <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function Step4Evidence({ session, onNext, onPrev }: { session: ReturnType<typeof useFraudSession>; onNext: () => void; onPrev: () => void }) {
  const [data, setData] = useState<EvidenceInfo>(session.evidence);
  const [touched, setTouched] = useState<Record<keyof EvidenceInfo, boolean>>({
    hasScreenshots: false, hasEmails: false, hasReceipts: false, additionalNotes: false
  });

  const errors = useMemo(() => {
    const errs: Partial<Record<keyof EvidenceInfo, string>> = {};
    if (data.additionalNotes.trim().length > 1000) {
      errs.additionalNotes = "Must be 1000 characters or less.";
    }
    return errs;
  }, [data]);

  const handleBlur = (field: keyof EvidenceInfo) => setTouched(prev => ({ ...prev, [field]: true }));

  const handleContinue = () => {
    if (Object.keys(errors).length === 0) {
      session.updateEvidence({
        hasScreenshots: data.hasScreenshots,
        hasEmails: data.hasEmails,
        hasReceipts: data.hasReceipts,
        additionalNotes: data.additionalNotes.trim(),
      });
      onNext();
    } else {
      setTouched({ hasScreenshots: true, hasEmails: true, hasReceipts: true, additionalNotes: true });
    }
  };

  const handleBack = () => {
    session.updateEvidence(data);
    onPrev();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="display-font text-2xl font-bold text-[#102f43]">Evidence Checklist</h2>
        <p className="text-[#4e6666] text-sm mt-1">Keep track of the files you have saved locally. Do not upload them here.</p>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-3 bg-[#f8f7f2] p-4 border border-[#17364a]/15 rounded">
          <Checkbox 
            id="screenshots" 
            checked={data.hasScreenshots}
            onCheckedChange={c => setData({...data, hasScreenshots: !!c})}
            className="border-[#17364a]"
          />
          <label htmlFor="screenshots" className="text-sm font-medium text-[#102f43] leading-none cursor-pointer">
            I have saved screenshots of the website, messages, or errors.
          </label>
        </div>
        <div className="flex items-center space-x-3 bg-[#f8f7f2] p-4 border border-[#17364a]/15 rounded">
          <Checkbox 
            id="emails" 
            checked={data.hasEmails}
            onCheckedChange={c => setData({...data, hasEmails: !!c})}
            className="border-[#17364a]"
          />
          <label htmlFor="emails" className="text-sm font-medium text-[#102f43] leading-none cursor-pointer">
            I have saved suspicious emails (including headers if possible).
          </label>
        </div>
        <div className="flex items-center space-x-3 bg-[#f8f7f2] p-4 border border-[#17364a]/15 rounded">
          <Checkbox 
            id="receipts" 
            checked={data.hasReceipts}
            onCheckedChange={c => setData({...data, hasReceipts: !!c})}
            className="border-[#17364a]"
          />
          <label htmlFor="receipts" className="text-sm font-medium text-[#102f43] leading-none cursor-pointer">
            I have copies of receipts, bank statements, or transaction IDs.
          </label>
        </div>

        <div className="pt-2">
          <label htmlFor="additionalNotes" className="block text-xs font-bold uppercase tracking-wider text-[#102f43] mb-1.5">
            Additional evidence notes <span className="text-[#4e6666] font-normal lowercase tracking-normal">(optional)</span>
          </label>
          <Textarea 
            id="additionalNotes"
            maxLength={1000}
            className={`min-h-[80px] resize-y border-[#17364a]/30 focus-visible:ring-[#c39b4a] ${touched.additionalNotes && errors.additionalNotes ? 'border-[#b84635] focus-visible:ring-[#b84635]' : ''}`}
            placeholder="Note any other files you have collected..."
            value={data.additionalNotes}
            onChange={e => setData({...data, additionalNotes: e.target.value})}
            onBlur={() => handleBlur('additionalNotes')}
            aria-invalid={!!(touched.additionalNotes && errors.additionalNotes)}
            aria-describedby={errors.additionalNotes ? "err-additionalNotes" : undefined}
          />
          <div className="flex justify-between items-start mt-1.5">
            <div>{touched.additionalNotes && <FieldError error={errors.additionalNotes} id="err-additionalNotes" />}</div>
            <span className="text-[10px] font-medium text-[#4e6666]">{data.additionalNotes.length} / 1000</span>
          </div>
        </div>
      </div>

      <div className="pt-4 flex gap-4">
        <Button 
          variant="outline"
          onClick={handleBack}
          className="h-14 px-6 border-2 border-[#17364a] text-[#17364a] font-bold uppercase tracking-wider transition-transform active:translate-y-1"
        >
          <ArrowLeft className="mr-2 w-4 h-4" /> Back
        </Button>
        <Button 
          onClick={handleContinue}
          className="flex-1 h-14 bg-[#17364a] hover:bg-[#102f43] text-[#e4bd62] font-bold uppercase tracking-wider transition-transform active:translate-y-1"
        >
          Continue <ArrowRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function Step5Review({ session, onComplete, onPrev }: { session: ReturnType<typeof useFraudSession>; onComplete: () => void; onPrev: () => void }) {
  const [data, setData] = useState<ReporterInfo>(session.reporter);
  const [touched, setTouched] = useState<Record<keyof ReporterInfo, boolean>>({
    firstName: false, lastName: false, email: false, phone: false,
    addressLine1: false, addressLine2: false, city: false, state: false, postalCode: false
  });

  const errors = useMemo(() => {
    const errs: Partial<Record<keyof ReporterInfo, string>> = {};
    if (!data.firstName.trim()) errs.firstName = "First name is required.";
    else if (data.firstName.trim().length > 100) errs.firstName = "Name is too long.";

    if (!data.lastName.trim()) errs.lastName = "Last name is required.";
    else if (data.lastName.trim().length > 100) errs.lastName = "Name is too long.";

    if (data.email.trim()) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
        errs.email = "Invalid email format.";
      }
    }

    if (data.phone.trim()) {
      if (!/^\+?[\d\s\-()\.]{7,20}$/.test(data.phone.trim())) {
        errs.phone = "Invalid phone format.";
      }
    }

    if (!data.addressLine1.trim()) errs.addressLine1 = "Street address is required.";
    else if (data.addressLine1.trim().length > 200) errs.addressLine1 = "Address is too long.";

    if (data.addressLine2.trim().length > 50) errs.addressLine2 = "Unit is too long.";

    if (!data.city.trim()) errs.city = "City is required.";
    else if (data.city.trim().length > 100) errs.city = "City is too long.";

    if (!data.state.trim()) errs.state = "State is required.";
    else if (!/^[a-zA-Z]{2}$/.test(data.state.trim())) errs.state = "Use 2-letter US state code.";

    if (!data.postalCode.trim()) errs.postalCode = "ZIP is required.";
    else if (!/^\d{5}(-\d{4})?$/.test(data.postalCode.trim())) errs.postalCode = "Use a 5 or 9-digit ZIP.";

    return errs;
  }, [data]);

  const handleBlur = (field: keyof ReporterInfo) => setTouched(prev => ({ ...prev, [field]: true }));

  const handleCompleteClick = () => {
    if (Object.keys(errors).length === 0) {
      session.updateReporter({
        firstName: data.firstName.trim(),
        lastName: data.lastName.trim(),
        email: data.email.trim(),
        phone: data.phone.trim(),
        addressLine1: data.addressLine1.trim(),
        addressLine2: data.addressLine2.trim(),
        city: data.city.trim(),
        state: data.state.trim().toUpperCase(),
        postalCode: data.postalCode.trim(),
      });
      onComplete();
    } else {
      setTouched({
        firstName: true, lastName: true, email: true, phone: true,
        addressLine1: true, addressLine2: true, city: true, state: true, postalCode: true
      });
    }
  };

  const handleBack = () => {
    session.updateReporter(data);
    onPrev();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="display-font text-2xl font-bold text-[#102f43]">Reporter Information</h2>
        <p className="text-[#4e6666] text-sm mt-1">Provide your details to include on the incident summary.</p>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-xs font-bold uppercase tracking-wider text-[#102f43] mb-1.5">
              First Name <span className="text-[#b84635]">*</span>
            </label>
            <Input 
              id="firstName"
              maxLength={100}
              autoComplete="given-name"
              className={`h-12 border-[#17364a]/30 focus-visible:ring-[#c39b4a] ${touched.firstName && errors.firstName ? 'border-[#b84635] focus-visible:ring-[#b84635]' : ''}`}
              value={data.firstName}
              onChange={e => setData({...data, firstName: e.target.value})}
              onBlur={() => handleBlur('firstName')}
              aria-invalid={!!(touched.firstName && errors.firstName)}
              aria-describedby={errors.firstName ? "err-firstName" : undefined}
            />
            {touched.firstName && <FieldError error={errors.firstName} id="err-firstName" />}
          </div>
          <div>
            <label htmlFor="lastName" className="block text-xs font-bold uppercase tracking-wider text-[#102f43] mb-1.5">
              Last Name <span className="text-[#b84635]">*</span>
            </label>
            <Input 
              id="lastName"
              maxLength={100}
              autoComplete="family-name"
              className={`h-12 border-[#17364a]/30 focus-visible:ring-[#c39b4a] ${touched.lastName && errors.lastName ? 'border-[#b84635] focus-visible:ring-[#b84635]' : ''}`}
              value={data.lastName}
              onChange={e => setData({...data, lastName: e.target.value})}
              onBlur={() => handleBlur('lastName')}
              aria-invalid={!!(touched.lastName && errors.lastName)}
              aria-describedby={errors.lastName ? "err-lastName" : undefined}
            />
            {touched.lastName && <FieldError error={errors.lastName} id="err-lastName" />}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-[#102f43] mb-1.5">
              Email <span className="text-[#4e6666] font-normal lowercase tracking-normal">(optional)</span>
            </label>
            <Input 
              id="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              maxLength={255}
              className={`h-12 border-[#17364a]/30 focus-visible:ring-[#c39b4a] ${touched.email && errors.email ? 'border-[#b84635] focus-visible:ring-[#b84635]' : ''}`}
              value={data.email}
              onChange={e => setData({...data, email: e.target.value})}
              onBlur={() => handleBlur('email')}
              aria-invalid={!!(touched.email && errors.email)}
              aria-describedby={errors.email ? "err-email" : undefined}
            />
            {touched.email && <FieldError error={errors.email} id="err-email" />}
          </div>
          <div>
            <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-[#102f43] mb-1.5">
              Phone <span className="text-[#4e6666] font-normal lowercase tracking-normal">(optional)</span>
            </label>
            <Input 
              id="phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={20}
              className={`h-12 border-[#17364a]/30 focus-visible:ring-[#c39b4a] ${touched.phone && errors.phone ? 'border-[#b84635] focus-visible:ring-[#b84635]' : ''}`}
              value={data.phone}
              onChange={e => setData({...data, phone: e.target.value})}
              onBlur={() => handleBlur('phone')}
              aria-invalid={!!(touched.phone && errors.phone)}
              aria-describedby={errors.phone ? "err-phone" : undefined}
            />
            {touched.phone && <FieldError error={errors.phone} id="err-phone" />}
          </div>
        </div>

        <div>
          <label htmlFor="addressLine1" className="block text-xs font-bold uppercase tracking-wider text-[#102f43] mb-1.5">
            Street Address <span className="text-[#b84635]">*</span>
          </label>
          <Input 
            id="addressLine1"
            autoComplete="address-line1"
            maxLength={200}
            className={`h-12 border-[#17364a]/30 focus-visible:ring-[#c39b4a] ${touched.addressLine1 && errors.addressLine1 ? 'border-[#b84635] focus-visible:ring-[#b84635]' : ''}`}
            value={data.addressLine1}
            onChange={e => setData({...data, addressLine1: e.target.value})}
            onBlur={() => handleBlur('addressLine1')}
            aria-invalid={!!(touched.addressLine1 && errors.addressLine1)}
            aria-describedby={errors.addressLine1 ? "err-addressLine1" : undefined}
          />
          {touched.addressLine1 && <FieldError error={errors.addressLine1} id="err-addressLine1" />}
        </div>
        
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-12 sm:col-span-4">
            <label htmlFor="addressLine2" className="block text-xs font-bold uppercase tracking-wider text-[#102f43] mb-1.5">
              Unit <span className="text-[#4e6666] font-normal lowercase tracking-normal">(optional)</span>
            </label>
            <Input 
              id="addressLine2"
              autoComplete="address-line2"
              maxLength={50}
              className={`h-12 border-[#17364a]/30 focus-visible:ring-[#c39b4a] ${touched.addressLine2 && errors.addressLine2 ? 'border-[#b84635] focus-visible:ring-[#b84635]' : ''}`}
              value={data.addressLine2}
              onChange={e => setData({...data, addressLine2: e.target.value})}
              onBlur={() => handleBlur('addressLine2')}
              aria-invalid={!!(touched.addressLine2 && errors.addressLine2)}
              aria-describedby={errors.addressLine2 ? "err-addressLine2" : undefined}
            />
            {touched.addressLine2 && <FieldError error={errors.addressLine2} id="err-addressLine2" />}
          </div>
          <div className="col-span-12 sm:col-span-8">
            <label htmlFor="city" className="block text-xs font-bold uppercase tracking-wider text-[#102f43] mb-1.5">
              City <span className="text-[#b84635]">*</span>
            </label>
            <Input 
              id="city"
              autoComplete="address-level2"
              maxLength={100}
              className={`h-12 border-[#17364a]/30 focus-visible:ring-[#c39b4a] ${touched.city && errors.city ? 'border-[#b84635] focus-visible:ring-[#b84635]' : ''}`}
              value={data.city}
              onChange={e => setData({...data, city: e.target.value})}
              onBlur={() => handleBlur('city')}
              aria-invalid={!!(touched.city && errors.city)}
              aria-describedby={errors.city ? "err-city" : undefined}
            />
            {touched.city && <FieldError error={errors.city} id="err-city" />}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="state" className="block text-xs font-bold uppercase tracking-wider text-[#102f43] mb-1.5">
              State (US) <span className="text-[#b84635]">*</span>
            </label>
            <Input 
              id="state"
              autoComplete="address-level1"
              maxLength={2}
              placeholder="e.g. CA"
              className={`h-12 border-[#17364a]/30 focus-visible:ring-[#c39b4a] uppercase ${touched.state && errors.state ? 'border-[#b84635] focus-visible:ring-[#b84635]' : ''}`}
              value={data.state}
              onChange={e => setData({...data, state: e.target.value.toUpperCase()})}
              onBlur={() => handleBlur('state')}
              aria-invalid={!!(touched.state && errors.state)}
              aria-describedby={errors.state ? "err-state" : undefined}
            />
            {touched.state && <FieldError error={errors.state} id="err-state" />}
          </div>
          <div>
            <label htmlFor="postalCode" className="block text-xs font-bold uppercase tracking-wider text-[#102f43] mb-1.5">
              ZIP Code <span className="text-[#b84635]">*</span>
            </label>
            <Input 
              id="postalCode"
              inputMode="numeric"
              autoComplete="postal-code"
              maxLength={10}
              className={`h-12 border-[#17364a]/30 focus-visible:ring-[#c39b4a] ${touched.postalCode && errors.postalCode ? 'border-[#b84635] focus-visible:ring-[#b84635]' : ''}`}
              value={data.postalCode}
              onChange={e => setData({...data, postalCode: e.target.value})}
              onBlur={() => handleBlur('postalCode')}
              aria-invalid={!!(touched.postalCode && errors.postalCode)}
              aria-describedby={errors.postalCode ? "err-postalCode" : undefined}
            />
            {touched.postalCode && <FieldError error={errors.postalCode} id="err-postalCode" />}
          </div>
        </div>
      </div>
      
      <div className="bg-[#dce7de] border-l-4 border-[#c39b4a] p-4 text-[#102f43] flex items-start gap-3 mt-4">
        <ShieldCheck className="w-5 h-5 text-[#17364a] shrink-0 mt-0.5" />
        <div>
          <strong className="font-bold block mb-1">Ready to complete</strong>
          <p className="text-sm font-medium leading-relaxed">
            Clicking complete will generate your local document. It will not be sent anywhere. You can then download or print it.
          </p>
        </div>
      </div>

      <div className="pt-4 flex gap-4">
        <Button 
          variant="outline"
          onClick={handleBack}
          className="h-14 px-6 border-2 border-[#17364a] text-[#17364a] font-bold uppercase tracking-wider transition-transform active:translate-y-1"
        >
          <ArrowLeft className="mr-2 w-4 h-4" /> Back
        </Button>
        <Button 
          onClick={handleCompleteClick}
          className="flex-1 h-14 bg-[#17364a] hover:bg-[#102f43] text-[#e4bd62] font-bold uppercase tracking-wider shadow-[4px_4px_0_#c39b4a] transition-transform active:translate-y-1 active:translate-x-1 active:shadow-[1px_1px_0_#c39b4a]"
        >
          Complete Summary
        </Button>
      </div>
    </div>
  );
}
