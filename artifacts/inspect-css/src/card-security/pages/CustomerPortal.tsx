import { useState, type FormEvent, type ReactNode } from "react";
import { useAppLocation } from "@/card-security/lib/router";
import type { CustomerInput } from "@/card-security/lib/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronRight,
  CreditCard,
  FileText,
  Info,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/card-security/hooks/use-toast";
import {
  DEFAULT_BUSINESS_CONFIG,
  type CardSummary,
  useAuthorizationSession,
} from "@/card-security/lib/authorization-session";

const customerSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required"),
  lastName: z.string().trim().min(1, "Last name is required"),
  company: z.string().optional().default(""),
  personalStatement: z.string().trim().max(1000, "Please keep your statement within 1,000 characters.").optional(),
  email: z.string().trim().email("Valid email is required"),
  phone: z.string().trim().min(10, "Valid phone is required"),
  address: z.string().trim().min(1, "Address is required"),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(2, "State is required"),
  zip: z.string().trim().min(5, "ZIP is required"),
});

type CustomerFormValues = z.infer<typeof customerSchema>;

const STEPS = [
  { id: 1, name: "Information" },
  { id: 2, name: "Card details" },
  { id: 3, name: "Agreement" },
  { id: 4, name: "Signature" },
];

function makeReferenceId() {
  const random =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto.randomUUID().replace(/-/g, "").slice(0, 12)
      : Math.random().toString(36).slice(2, 14);
  return `LOCAL-${random.toUpperCase()}`;
}

import { SharedLayout } from "../components/Layout";
import { Link } from "wouter";

export default function CustomerPortal() {
  const config = DEFAULT_BUSINESS_CONFIG;
  const [step, setStep] = useState(1);
  const [accepted, setAccepted] = useState(false);
  const [acceptedAgreement, setAcceptedAgreement] = useState<{
    termsVersion: string;
    termsText: string;
  } | null>(null);
  const [, setLocation] = useAppLocation();
  const { customer, card, setCustomer, setCard, complete } = useAuthorizationSession();
  const { toast } = useToast();
  const agreementIsCurrent =
    accepted &&
    acceptedAgreement?.termsVersion === config.termsVersion &&
    acceptedAgreement?.termsText === config.termsText;

  const handleComplete = (signatureName: string) => {
    if (!customer || !card) {
      setStep(1);
      return;
    }
    if (!agreementIsCurrent || !acceptedAgreement) {
      toast({
        title: "Agreement required",
        description: "Review and accept the exact agreement before signing.",
        variant: "destructive",
      });
      setStep(3);
      return;
    }
    const completedAt = new Date().toISOString();
    complete({
      referenceId: makeReferenceId(),
      customer,
      card,
      agreement: {
        ...acceptedAgreement,
        acceptedAt: completedAt,
      },
      signatureName: signatureName.trim(),
      completedAt,
      businessName: config.businessName || DEFAULT_BUSINESS_CONFIG.businessName,
    });
    setLocation("/confirmation");
  };

  return (
    <SharedLayout>
      <div className="inspect-container py-12 flex-1">
        {/* Breadcrumbs */}
        <nav className="text-sm font-medium text-[#4e6666] mb-8 flex items-center gap-2">
          <Link href="/" className="text-[#102f43] hover:text-[#9a6f20] transition-colors">Security Inspection</Link>
          <span className="text-[#17364a]/30">›</span>
          <button onClick={() => setLocation("/")} className="text-[#102f43] hover:text-[#9a6f20] transition-colors">Card Security</button>
          <span className="text-[#17364a]/30">›</span>
          <span className="text-[#17364a]">Create Document</span>
        </nav>

        <div className="mb-8 border-b-2 border-[#17364a]/15 pb-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-[#17364a]xl font-bold text-[#102f43]">Client authorization document</h1>
              <p className="text-sm text-[#4e6666] mt-1">
                Complete the form in this browser, then download or print your document.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-[#17364a]">
              <span>Step {step} of {STEPS.length}</span>
              <span className="text-[#4e6666]/50 font-normal hidden sm:inline">—</span>
              <span className="text-[#4e6666] hidden sm:inline">{STEPS[step - 1].name}</span>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-1 sm:gap-2" aria-label={`Step ${step} of ${STEPS.length}`}>
            {STEPS.map((currentStep) => {
              const isCompleted = step > currentStep.id;
              const isCurrent = step === currentStep.id;
              return (
                <div key={currentStep.id} className="flex-1 flex flex-col gap-2">
                  <div className={`h-2 w-full rounded-sm ${isCompleted || isCurrent ? "bg-[#17364a]" : "bg-[#eef1eb]"}`} />
                  <span className={`text-xs font-bold uppercase tracking-wider hidden sm:block ${isCurrent ? "text-[#102f43]" : isCompleted ? "text-[#17364a]" : "text-[#4e6666]/50"}`}>
                    {currentStep.name}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-[#f8f7f2] border-2 border-[#17364a]/25 rounded shadow-sm animate-fade-in">
          {step === 1 && (
            <StepOne
              initialValues={customer ?? undefined}
              onNext={(values) => {
                setCustomer(values);
                setStep(2);
              }}
            />
          )}
          {step === 2 && (
            <StepTwo
              onNext={(values) => {
                setCard(values);
                setStep(3);
              }}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <StepThree
              config={config}
              accepted={agreementIsCurrent}
              setAccepted={(nextAccepted) => {
                setAccepted(nextAccepted);
                setAcceptedAgreement(
                  nextAccepted
                    ? { termsVersion: config.termsVersion, termsText: config.termsText }
                    : null,
                );
              }}
              onNext={() => setStep(4)}
              onBack={() => setStep(2)}
            />
          )}
          {step === 4 && (
            <StepFour
              onSubmit={handleComplete}
              onBack={() => setStep(3)}
            />
          )}
        </div>
      </div>
    </SharedLayout>
  );
}

function StepOne({
  initialValues,
  onNext,
}: {
  initialValues?: CustomerInput;
  onNext: (values: CustomerFormValues) => void;
}) {
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: initialValues ?? {
      firstName: "",
      lastName: "",
      company: "",
      personalStatement: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip: "",
    },
  });

  const inputClass = "h-11 border-2 border-[#17364a]/25 focus:border-[#c39b4a] focus:ring-[#c39b4a]/20";
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onNext)}>
        <StepHeader
          title="1. Contact and billing information"
          description="Provide the contact and billing address for the person authorizing this document."
        />
        <div className="p-6 sm:p-8 space-y-8">
          <div className="grid sm:grid-cols-2 gap-6">
            {(["firstName", "lastName", "email", "phone"] as const).map((name) => (
              <FormField
                key={name}
                control={form.control}
                name={name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-[#102f43]">
                      {name === "firstName"
                        ? "First name"
                        : name === "lastName"
                          ? "Last name"
                          : name === "email"
                            ? "Email address"
                            : "Phone number"}{" "}
                      <span className="text-red-600">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type={name === "email" ? "email" : name === "phone" ? "tel" : "text"}
                        className={inputClass}
                        autoComplete={name === "email" ? "email" : name === "phone" ? "tel" : "given-name"}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="font-medium text-red-600" />
                  </FormItem>
                )}
              />
            ))}
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel className="font-bold text-[#102f43]">Company (optional)</FormLabel>
                  <FormControl><Input className={inputClass} autoComplete="organization" {...field} /></FormControl>
                  <FormMessage className="font-medium text-red-600" />
                </FormItem>
              )}
            />
          </div>
          <div className="pt-6 border-t border-[#17364a]/15">
            <FormField control={form.control} name="personalStatement" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-bold text-[#102f43]">Personal statement (optional)</FormLabel>
                <p id="statement-help" className="text-sm text-[#4e6666]">Write a short statement to include with your authorization. Do not include card numbers or security codes.</p>
                <FormControl>
                  <textarea {...field} value={field.value ?? ""} rows={4} maxLength={1000} aria-describedby="statement-help statement-count" placeholder="Write your personal statement here…" className="w-full rounded border-2 border-[#17364a]/25 bg-[#f8f7f2] p-3 text-base focus:border-[#c39b4a] focus:outline-none focus:ring-2 focus:ring-[#c39b4a]/20" />
                </FormControl>
                <p id="statement-count" className="text-xs text-[#4e6666]">{field.value?.length ?? 0} / 1,000 characters</p>
                <FormMessage />
              </FormItem>
            )} />
          </div>
          <div className="pt-6 border-t border-[#17364a]/15">
            <h3 className="text-lg font-bold text-[#102f43] mb-6">Billing address</h3>
            <div className="grid sm:grid-cols-2 gap-6">
              {(["address", "city"] as const).map((name) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem className={name === "address" ? "sm:col-span-2" : ""}>
                      <FormLabel className="font-bold text-[#102f43]">
                        {name === "address" ? "Street address" : "City"} <span className="text-red-600">*</span>
                      </FormLabel>
                      <FormControl><Input className={inputClass} autoComplete={name === "address" ? "street-address" : "address-level2"} {...field} /></FormControl>
                      <FormMessage className="font-medium text-red-600" />
                    </FormItem>
                  )}
                />
              ))}
              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-[#102f43]">State or region <span className="text-red-600">*</span></FormLabel>
                    <FormControl><Input className={inputClass} autoComplete="address-level1" {...field} /></FormControl>
                    <FormMessage className="font-medium text-red-600" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="zip"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold text-[#102f43]">ZIP or postal code <span className="text-red-600">*</span></FormLabel>
                    <FormControl><Input className={inputClass} autoComplete="postal-code" {...field} /></FormControl>
                    <FormMessage className="font-medium text-red-600" />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </div>
        <StepActions>
          <Button type="submit" size="lg" className="bg-[#17364a] hover:bg-[#102f43] text-[#e4bd62] font-extrabold uppercase tracking-[.05em] h-12 px-8 rounded-md flex items-center justify-center shadow-[5px_5px_0_#c39b4a] w-full sm:w-auto transition-transform active:translate-y-1 active:translate-x-1 active:shadow-[2px_2px_0_#c39b4a]">
            Continue <ChevronRight className="ml-2 w-5 h-5" />
          </Button>
        </StepActions>
      </form>
    </Form>
  );
}

function detectCardBrand(number: string) {
  if (/^4/.test(number)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(number)) return "Mastercard";
  if (/^3[47]/.test(number)) return "American Express";
  if (/^(6011|65|64[4-9]|622)/.test(number)) return "Discover";
  return "Other";
}

function passesLuhn(number: string) {
  let sum = 0;
  let shouldDouble = false;
  for (let index = number.length - 1; index >= 0; index -= 1) {
    let digit = Number(number[index]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

function maskCardNumber(digits: string) {
  if (!digits) return "";
  const masked = `${"•".repeat(Math.max(0, digits.length - 4))}${digits.slice(-4)}`;
  return masked.replace(/(.{4})/g, "$1 ").trim();
}

function maskDigits(digits: string) {
  return digits ? "•".repeat(digits.length) : "";
}

function StepTwo({ onNext, onBack }: { onNext: (values: CardSummary) => void; onBack: () => void }) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [cardholderName, setCardholderName] = useState("");
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [error, setError] = useState("");

  const clearTransientCardValues = () => {
    setCardNumber("");
    setExpiry("");
    setCvv("");
  };

  const validateAndContinue = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const digits = cardNumber.replace(/\D/g, "");
    const [monthText, yearText] = expiry.split("/");
    const month = Number(monthText);
    const year = Number(`20${yearText}`);
    const now = new Date();
    const validExpiry =
      /^\d{2}\/\d{2}$/.test(expiry) &&
      month >= 1 &&
      month <= 12 &&
      year >= now.getFullYear() &&
      (year > now.getFullYear() || month >= now.getMonth() + 1);
    const requiredCvvLength = detectCardBrand(digits) === "American Express" ? 4 : 3;
    if (digits.length < 13 || digits.length > 19 || !passesLuhn(digits)) {
      setError("Enter a valid card number. Numbers are checked locally in this browser only.");
      return;
    }
    if (!validExpiry) {
      setError("Enter a valid future expiry date in MM/YY format.");
      return;
    }
    if (cvv.length !== requiredCvvLength) {
      setError(`Enter the ${requiredCvvLength}-digit security code.`);
      return;
    }
    if (!cardholderName.trim()) {
      setError("Cardholder name is required.");
      return;
    }

    const summary: CardSummary = {
      cardholderName: cardholderName.trim(),
      cardBrand: detectCardBrand(digits),
      cardLast4: digits.slice(-4),
    };
    clearTransientCardValues();
    setFocusedField(null);
    onNext(summary);
  };

  const focusAndClearError = (field: string) => {
    setFocusedField(field);
    setError("");
  };
  const inputClass = "h-11 border-2 border-[#17364a]/25 focus:border-[#c39b4a] focus:ring-[#c39b4a]/20 font-mono";

  return (
    <form autoComplete="off" onSubmit={validateAndContinue}>
      <StepHeader
        title="2. Card details"
        description="Enter the card details needed to identify this authorization document."
      />
      <div className="p-6 sm:p-8 space-y-6">
        <div className="bg-[#dce7de] border-l-4 border-[#c39b4a] p-4 text-[#102f43] flex items-start gap-3">
          <Info className="w-5 h-5 text-[#17364a] shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold block mb-1">Private browser entry</strong>
            <p className="text-sm leading-relaxed">
              Full card details stay only in this step&apos;s temporary browser memory. They are cleared when you continue or leave this step, and are never submitted, stored, or included in the document.
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="card-number" className="block text-sm font-bold">Card number <span className="text-red-600">*</span></label>
          <Input
            id="card-number"
            type={focusedField === "number" ? "text" : "text"}
            inputMode="numeric"
            autoComplete="off"
            data-form-type="other"
            maxLength={23}
            className={inputClass}
            value={focusedField === "number" ? cardNumber.replace(/(.{4})/g, "$1 ").trim() : maskCardNumber(cardNumber)}
            onFocus={() => focusAndClearError("number")}
            onBlur={() => setFocusedField(null)}
            onChange={(event) => setCardNumber(event.target.value.replace(/\D/g, "").slice(0, 19))}
            aria-describedby="card-number-description"
          />
          <p id="card-number-description" className="text-xs text-[#4e6666]">
            {focusedField === "number" ? "Card number is revealed while this field is focused." : "Card number is masked when this field is not focused."}
          </p>
        </div>
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label htmlFor="card-expiry" className="block text-sm font-bold">Expiry date <span className="text-red-600">*</span></label>
            <Input
              id="card-expiry"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              data-form-type="other"
              maxLength={5}
              className={inputClass}
              placeholder="MM/YY"
              value={focusedField === "expiry" ? expiry : maskDigits(expiry.replace(/\D/g, ""))}
              onFocus={() => focusAndClearError("expiry")}
              onBlur={() => setFocusedField(null)}
              onChange={(event) => {
                const digits = event.target.value.replace(/\D/g, "").slice(0, 4);
                setExpiry(digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits);
              }}
              aria-describedby="card-expiry-description"
            />
            <p id="card-expiry-description" className="text-xs text-[#4e6666]">
              {focusedField === "expiry" ? "Expiry date is revealed while this field is focused." : "Expiry date is masked when this field is not focused."}
            </p>
          </div>
          <div className="space-y-2">
            <label htmlFor="card-cvv" className="block text-sm font-bold">Security code <span className="text-red-600">*</span></label>
            <Input
              id="card-cvv"
              type="text"
              inputMode="numeric"
              autoComplete="off"
              data-form-type="other"
              maxLength={4}
              className={inputClass}
              placeholder="CVV"
              value={focusedField === "cvv" ? cvv : maskDigits(cvv)}
              onFocus={() => focusAndClearError("cvv")}
              onBlur={() => setFocusedField(null)}
              onChange={(event) => setCvv(event.target.value.replace(/\D/g, "").slice(0, 4))}
              aria-describedby="card-cvv-description"
            />
            <p id="card-cvv-description" className="text-xs text-[#4e6666]">
              {focusedField === "cvv" ? "Security code is revealed while this field is focused." : "Security code is masked when this field is not focused."}
            </p>
          </div>
        </div>
        <div className="space-y-2">
          <label htmlFor="cardholder-name" className="block text-sm font-bold">Cardholder name <span className="text-red-600">*</span></label>
          <Input
            id="cardholder-name"
            autoComplete="off"
            className="h-11 border-2 border-[#17364a]/25 focus:border-[#c39b4a] focus:ring-[#005ea2]/20"
            value={cardholderName}
            onChange={(event) => {
              setCardholderName(event.target.value);
              setError("");
            }}
          />
        </div>
        {error && <p role="alert" className="text-sm font-semibold text-red-700">{error}</p>}
        <p className="text-xs text-[#4e6666] flex items-start gap-2">
          <CreditCard className="h-4 w-4 shrink-0 mt-0.5" />
          This is a standalone authorization document, not a charge or a saved payment method.
        </p>
      </div>
      <StepActions>
        <Button variant="outline" onClick={onBack} type="button" className="h-12 px-6 border-2 border-[#17364a] text-[#17364a] font-extrabold uppercase tracking-[.05em] hover:bg-[#eef1eb] shadow-[3px_3px_0_#17364a] transition-transform active:translate-y-1 active:translate-x-1 active:shadow-[1px_1px_0_#17364a] rounded-md flex items-center justify-center w-full sm:w-auto">
          <ArrowLeft className="mr-2 w-4 h-4" /> Previous
        </Button>
        <Button type="submit" size="lg" className="bg-[#17364a] hover:bg-[#102f43] text-[#e4bd62] font-extrabold uppercase tracking-[.05em] h-12 px-8 rounded-md flex items-center justify-center shadow-[5px_5px_0_#c39b4a] w-full sm:w-auto transition-transform active:translate-y-1 active:translate-x-1 active:shadow-[2px_2px_0_#c39b4a]">
          Continue <ChevronRight className="ml-2 w-5 h-5" />
        </Button>
      </StepActions>
    </form>
  );
}

function StepThree({
  config,
  accepted,
  setAccepted,
  onNext,
  onBack,
}: {
  config: typeof DEFAULT_BUSINESS_CONFIG;
  accepted: boolean;
  setAccepted: (accepted: boolean) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const { toast } = useToast();
  const handleNext = () => {
    if (!accepted) {
      toast({
        title: "Acceptance required",
        description: "Read and accept the exact agreement before continuing.",
        variant: "destructive",
      });
      return;
    }
    onNext();
  };

  return (
    <div>
      <StepHeader
        title="3. Review and accept the agreement"
        description="The exact accepted text is included in your browser-generated document."
      />
      <div className="p-6 sm:p-8 space-y-6">
        <div className="border-2 border-[#17364a]/25 rounded bg-[#f8f7f2] overflow-hidden">
          <div className="bg-[#eef1eb] border-b-2 border-[#17364a]/25 px-4 py-2 flex items-center justify-between">
            <span className="font-bold text-[#102f43] flex items-center gap-2 text-sm">
              <FileText className="w-4 h-4 text-[#17364a]" /> Exact agreement
            </span>
            <span className="text-xs font-bold uppercase text-[#4e6666] bg-[#f8f7f2] px-2 py-0.5 border border-[#17364a]/15 rounded">
              Version {config.termsVersion}
            </span>
          </div>
          <div className="p-6 overflow-y-auto max-h-[360px] text-sm text-[#102f43] font-medium leading-relaxed whitespace-pre-wrap">
            {config.termsText}
          </div>
        </div>
        <label className="flex items-start gap-4 p-5 border-2 border-[#17364a]/25 rounded bg-[#f4f3ee] hover:bg-[#eef1eb] cursor-pointer transition-colors">
          <Checkbox
            checked={accepted}
            onCheckedChange={(checked) => setAccepted(!!checked)}
            className="mt-1 w-5 h-5 border-2 border-[#c39b4a] data-[state=checked]:bg-[#17364a]"
            aria-label="Accept exact agreement"
          />
          <div className="text-sm text-[#102f43] font-medium leading-relaxed">
            <strong className="block mb-1 text-base">I have read and accept this exact agreement</strong>
            I understand this browser-generated document records my acknowledgement and typed signature. It is not a payment or server-submitted record.
          </div>
        </label>
      </div>
      <StepActions>
        <Button variant="outline" onClick={onBack} type="button" className="h-12 px-6 border-2 border-[#17364a] text-[#17364a] font-extrabold uppercase tracking-[.05em] hover:bg-[#eef1eb] shadow-[3px_3px_0_#17364a] transition-transform active:translate-y-1 active:translate-x-1 active:shadow-[1px_1px_0_#17364a] rounded-md flex items-center justify-center w-full sm:w-auto">
          <ArrowLeft className="mr-2 w-4 h-4" /> Previous
        </Button>
        <Button onClick={handleNext} size="lg" className="bg-[#17364a] hover:bg-[#102f43] text-[#e4bd62] font-extrabold uppercase tracking-[.05em] h-12 px-8 rounded-md flex items-center justify-center shadow-[5px_5px_0_#c39b4a] w-full sm:w-auto transition-transform active:translate-y-1 active:translate-x-1 active:shadow-[2px_2px_0_#c39b4a]" disabled={!accepted}>
          Proceed to sign <ChevronRight className="ml-2 w-5 h-5" />
        </Button>
      </StepActions>
    </div>
  );
}

function StepFour({ onSubmit, onBack }: { onSubmit: (signatureName: string) => void; onBack: () => void }) {
  const [signatureName, setSignatureName] = useState("");
  return (
    <form onSubmit={(event) => {
      event.preventDefault();
      if (signatureName.trim()) onSubmit(signatureName);
    }}>
      <StepHeader
        title="4. Add your signature"
        description="Type your name to complete this document in your browser."
      />
      <div className="p-6 sm:p-8">
        <div className="bg-[#f8f7f2] border-l-4 border-[#c39b4a] p-4 text-[#102f43] flex items-start gap-3 mb-8">
          <Info className="w-5 h-5 text-[#9a6f20] shrink-0 mt-0.5" />
          <p className="text-sm font-medium leading-relaxed">
            By typing your name below, you are signing this document electronically. The completed document is generated locally; no signature is transmitted or stored on a server.
          </p>
        </div>
        <div className="max-w-md space-y-4">
          <label htmlFor="signature" className="font-bold text-[#102f43] block">
            Type your full name <span className="text-red-600">*</span>
          </label>
          <Input
            id="signature"
            value={signatureName}
            onChange={(event) => setSignatureName(event.target.value)}
            placeholder="e.g. Jane Doe"
            required
            className="h-14 font-bold text-xl border-2 border-[#17364a]/25 focus:border-[#c39b4a] focus:ring-[#c39b4a]/20"
            autoComplete="off"
            spellCheck="false"
          />
          <p className="text-xs text-[#4e6666] font-medium">
            The date and time shown on the completed document come from this browser and are not server verified.
          </p>
        </div>
      </div>
      <StepActions>
        <Button variant="outline" onClick={onBack} type="button" className="h-12 px-6 border-2 border-[#17364a] text-[#17364a] font-extrabold uppercase tracking-[.05em] hover:bg-[#eef1eb] shadow-[3px_3px_0_#17364a] transition-transform active:translate-y-1 active:translate-x-1 active:shadow-[1px_1px_0_#17364a] rounded-md flex items-center justify-center w-full sm:w-auto">
          <ArrowLeft className="mr-2 w-4 h-4" /> Previous
        </Button>
        <Button type="submit" size="lg" disabled={!signatureName.trim()} className="bg-[#17364a] hover:bg-[#102f43] text-[#e4bd62] font-extrabold uppercase tracking-[.05em] h-12 px-8 rounded-md flex items-center justify-center shadow-[5px_5px_0_#c39b4a] w-full sm:w-auto transition-transform active:translate-y-1 active:translate-x-1 active:shadow-[2px_2px_0_#c39b4a]">
          <Check className="mr-3 h-5 w-5" /> Complete document
        </Button>
      </StepActions>
    </form>
  );
}

function StepHeader({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-[#f4f3ee] border-b border-[#17364a]/15 px-6 py-4">
      <h2 className="text-xl font-bold text-[#102f43]">{title}</h2>
      <p className="text-sm text-[#4e6666] mt-1">{description}</p>
    </div>
  );
}

function StepActions({ children }: { children: ReactNode }) {
  return (
    <div className="bg-[#f4f3ee] border-t border-[#17364a]/15 p-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
      {children}
    </div>
  );
}