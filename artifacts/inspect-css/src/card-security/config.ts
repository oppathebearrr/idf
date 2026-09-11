import type { BusinessConfig } from "./lib/types";

/**
 * Edit this local configuration to customize the standalone document.
 * No network request is made for configuration.
 */
export const DEFAULT_BUSINESS_CONFIG: BusinessConfig = {
  businessName: "YOUR BRAND",
  legalName: "[YOUR LEGAL BUSINESS NAME]",
  email: "[YOUR BUSINESS EMAIL]",
  phone: "[YOUR BUSINESS PHONE]",
  website: "[YOUR WEBSITE]",
  address: "",
  logoUrl: "",
  privacyUrl: "",
  termsUrl: "",
  refundUrl: "",
  disclaimer: "This authorization document is a browser-generated document for your records.",
  termsText: `CARD-ON-FILE AUTHORIZATION DOCUMENT

I authorize [YOUR LEGAL BUSINESS NAME] to record this permission for purchases, products, services, fees, and other amounts that I authorize or incur with [YOUR LEGAL BUSINESS NAME].

This document records my permission for the described authorized purchases. It does not collect or store my full card number, security code, or expiration date, and it does not process, save, or attach a chargeable payment method. The business must handle any purchase separately.

I understand that individual purchases may vary in amount and may occur at the time of purchase, delivery, completion of services, or as otherwise agreed between me and [YOUR LEGAL BUSINESS NAME].

I confirm that I am the cardholder or an authorized user of the card identified only by its brand and last four digits, and that I have authority to provide this permission.

I understand that this permission will remain in effect until I revoke it in writing or until [YOUR LEGAL BUSINESS NAME] determines that it is no longer applicable. Revocation will not affect purchases that were authorized or incurred before the revocation became effective.

I agree to notify [YOUR LEGAL BUSINESS NAME] if my card information changes or if I no longer have authorization to use this permission.

By checking the box below and providing my electronic signature, I acknowledge that I have read and agree to this Card-on-File Authorization Document.

I authorize [YOUR LEGAL BUSINESS NAME] to record my permission for the authorized purchases and services described above.`,
  termsVersion: "v2-browser-document",
};