import type { BusinessConfig } from "./lib/types";

/**
 * Edit this local configuration to customize the standalone document.
 * No network request is made for configuration.
 */
export const DEFAULT_BUSINESS_CONFIG: BusinessConfig = {
  businessName: "Security Inspection",
  legalName: "Security Inspection",
  email: "",
  phone: "",
  website: "",
  address: "",
  logoUrl: "",
  privacyUrl: "",
  termsUrl: "",
  refundUrl: "",
  disclaimer:
    "This debt non-authorization declaration is a browser-generated document for your records.",
  termsText: `DEBT NON-AUTHORIZATION DECLARATION

I declare that I did not authorize, initiate, or incur the debt, purchase, transaction, or payment described in this document.

This document is provided as a record of my statement that the alleged debt is not an obligation that I knowingly authorized or incurred. It is intended to serve as supporting documentation when communicating with a creditor, debt collector, financial institution, or other relevant party regarding the disputed debt.

I further declare that I did not knowingly authorize or make the disputed charge for pornography, gambling, adult services, or any other unlawful, unauthorized, or prohibited purchase or activity. To the best of my knowledge, I did not initiate or approve the disputed transaction for any such purpose.

The card associated with the disputed activity is identified only by its card brand and last four digits. This document does not contain or retain my full card number, security code, or expiration date, and it does not create or authorize any payment, charge, or payment method.

I request that the disputed debt or transaction be reviewed using the appropriate records and verification procedures. I reserve the right to provide additional information or documentation supporting my dispute.

I understand that this declaration records my position regarding the disputed debt and does not, by itself, determine the legal validity of the debt or the outcome of any investigation or dispute.

By checking the box below and providing my electronic signature, I confirm that I have read this declaration and that the statements above are true and accurate to the best of my knowledge..

`,
  termsVersion: "v3-debt-non-authorization",
};
