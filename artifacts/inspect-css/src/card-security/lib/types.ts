export type BusinessConfig = {
  businessName: string;
  legalName: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  logoUrl: string;
  privacyUrl: string;
  termsUrl: string;
  refundUrl: string;
  disclaimer: string;
  termsText: string;
  termsVersion: string;
};

export type CustomerInput = {
  firstName: string;
  lastName: string;
  company?: string;
  personalStatement?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
};