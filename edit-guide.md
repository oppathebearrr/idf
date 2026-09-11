# Edit Guide

This guide shows which file to edit for each page, section, route, and shared behavior in the Security Inspection project.

## Main Homepage

### Homepage content and page sections

Edit:

`artifacts/inspect-css/src/App.tsx`

This file controls the main homepage at `/`, including:

- Header and navigation
- Homepage brand text
- Hero headline and supporting copy
- Browser Extension CTA
- Card Security CTA
- Report a Fraud CTA
- IP Lookup CTA
- Product feature cards
- Chrome Extension product section
- Card Security product section
- Report a Fraud product section
- IP Lookup section
- Privacy and public-service messaging
- Footer content
- Homepage route declarations

### Homepage visual styling

Edit:

`artifacts/inspect-css/src/index.css`

This file controls shared visual styling, including:

- Colors
- Typography
- Layout containers
- Buttons
- Borders and shadows
- Responsive behavior
- Hero animations
- Grid backgrounds
- Seal watermark styling
- Shared public-service visual language

### Homepage extension download behavior

Edit:

`artifacts/inspect-css/src/App.tsx`

The Chrome Extension download URL and download-state behavior are near the top of this file.

The downloaded extension file is located at:

`artifacts/inspect-css/public/downloads/SecurityInspectv1.zip`

## Main Site Routing

### All top-level routes

Edit:

`artifacts/inspect-css/src/App.tsx`

The top-level routes currently include:

- `/` — Homepage
- `/card-security` — Card Security product area
- `/report-fraud` — Report a Fraud product area

The route declarations are near the bottom of `App.tsx`.

### Main site not-found page

Edit:

`artifacts/inspect-css/src/pages/not-found.tsx`

Use this file to change the generic page-not-found screen used outside the product areas.

## Card Security

### Card Security landing page

Edit:

`artifacts/inspect-css/src/card-security/pages/Landing.tsx`

This file controls `/card-security`, including:

- Card Security introduction
- Privacy and browser-only explanation
- Authorization document explanation
- Connection to Report a Fraud
- “Begin document” CTA
- Card Security page content
- Card Security safety notices

### Card Security authorization form

Edit:

`artifacts/inspect-css/src/card-security/pages/CustomerPortal.tsx`

This file controls `/card-security/authorize`, including the four-step workflow:

1. Contact and billing information
2. Temporary card details
3. Agreement acceptance
4. Typed signature

Use this file to edit:

- Form labels
- Field descriptions
- Validation messages
- Required fields
- Card number handling
- Expiry and security-code validation
- Agreement wording shown in the form
- Signature validation
- Step navigation
- Step progress labels

Sensitive card-data handling is also implemented in this file. Only the first six digits may be sent to `/api/bin-lookup`. Do not persist or log those digits, and never add the full card number, expiry, or security code to state, requests, or completed output.

### Card Security completed document

Edit:

`artifacts/inspect-css/src/card-security/pages/Confirmation.tsx`

This file controls `/card-security/confirmation`, including:

- Completed authorization summary
- Masked card display
- Download PDF button
- Print button
- Session-ended state
- Start-new-document behavior
- Privacy statements
- BIN issuer details and unavailable state
- Links back to the main site
- Links to Report a Fraud

### Card Security route shell

Edit:

`artifacts/inspect-css/src/card-security/CardSecurityApp.tsx`

This file controls the internal Card Security page routing:

- Card Security landing page
- Authorization page
- Confirmation page
- Card Security-specific not-found state

### Card Security shared header and footer

Edit:

`artifacts/inspect-css/src/card-security/components/Layout.tsx`

This file controls the shared Card Security layout, including:

- Utility bar
- Cyber Safety / Secure America Online identity
- Seal logo
- Inspection Tool link
- Card Security navigation
- Footer

### Card Security identity and agreement text

Edit:

`artifacts/inspect-css/src/card-security/config.ts`

This file controls:

- Visible business/product name used in the authorization document
- Terms version
- Authorization agreement text
- Agreement wording included in the generated document

### Card Security in-memory session

Edit only when changing workflow state behavior:

`artifacts/inspect-css/src/card-security/lib/authorization-session.tsx`

This file controls the temporary browser-memory session for the Card Security workflow, including the safe card summary and normalized BIN lookup result.

### Card Security PDF and print output

Edit:

`artifacts/inspect-css/src/card-security/lib/browser-document.ts`

This file controls locally generated Card Security PDFs and print documents.

Keep card identification limited to the card brand and last four digits, plus normalized issuer metadata. Full card number, expiry, security code, and the six-digit BIN itself must not be added to the PDF or print output.

### Card Security BIN lookup

Edit:

`artifacts/api-server/src/routes/bin-lookup.ts`

This backend route validates an exact six-digit BIN, rotates across free no-key lookup providers with bounded timeouts and fallback, and normalizes issuer data. Do not log or persist the BIN, and never accept a full card number.

### Card Security internal routing helper

Edit:

`artifacts/inspect-css/src/card-security/lib/router.tsx`

This file adapts the Card Security nested routes to the main site router.

Use canonical links when linking from Card Security back to the main site:

- Main homepage: `${import.meta.env.BASE_URL}`
- Card Security: `${import.meta.env.BASE_URL}card-security`
- Report a Fraud: `${import.meta.env.BASE_URL}report-fraud`

## Report a Fraud

### Report a Fraud landing page

Edit:

`artifacts/inspect-css/src/report-fraud/pages/Landing.tsx`

This file controls `/report-fraud`, including:

- Report a Fraud introduction
- Privacy-first explanation
- “Prepared to support official filing” notice
- Start-report CTA
- Connection to Card Security
- Safety guidance

### Report a Fraud step-based form

Edit:

`artifacts/inspect-css/src/report-fraud/pages/Wizard.tsx`

This file controls `/report-fraud/report`, including:

1. Incident details
2. Narrative and suspected party
3. Financial impact
4. Evidence checklist
5. Reporter Information
6. Urgent: Card Authorization handoff

Use this file to edit:

- Step headings
- Form labels
- Field descriptions
- Validation rules
- Error messages
- Progress labels
- Back and Continue buttons
- Reporter address fields
- Safety warnings
- Optional versus required fields

The Reporter Information section currently includes:

- First name
- Last name
- Email
- Phone
- Street address
- Apartment, suite, or unit
- City
- State
- ZIP code

### Report a Fraud completion page

Edit:

`artifacts/inspect-css/src/report-fraud/pages/Confirmation.tsx`

This file controls `/report-fraud/confirmation`, including:

- Local incident summary
- Reporter information summary
- Address summary
- PDF download button
- Print button
- Official next-step links
- FTC ReportFraud link
- IdentityTheft.gov link
- FBI IC3 link
- Official filing instructions
- “Urgent: Card Authorization” handoff
- Link to `/card-security/authorize`
- Finish Report Only / Return option
- Session-ended state

### Report a Fraud route shell

Edit:

`artifacts/inspect-css/src/report-fraud/ReportFraudApp.tsx`

This file controls the internal Report a Fraud routes:

- Report a Fraud landing page
- Report form
- Completion page
- Report-specific fallback route

### Report a Fraud shared header and footer

Edit:

`artifacts/inspect-css/src/report-fraud/components/Layout.tsx`

This file controls the Report a Fraud shared layout, including:

- Utility bar
- Cyber Safety / Secure America Online identity
- Seal logo
- Inspection Tool link
- Card Security link
- Report Fraud navigation state
- Footer

### Report a Fraud in-memory session

Edit:

`artifacts/inspect-css/src/report-fraud/lib/fraud-session.tsx`

This file controls the temporary browser-memory state for the report:

- Incident data
- Narrative data
- Financial impact data
- Evidence checklist
- Reporter information
- Address data
- Completion state
- Reference ID generation

Do not move report data into localStorage, sessionStorage, a database, or a server without intentionally changing the privacy model.

### Report a Fraud internal routing helper

Edit:

`artifacts/inspect-css/src/report-fraud/lib/router.tsx`

This file adapts Report a Fraud nested routes to the main site router.

### Report a Fraud PDF output

Edit:

`artifacts/inspect-css/src/report-fraud/lib/browser-document.ts`

This file controls the locally generated fraud incident summary PDF and its print content.

The document must continue to state that:

- It was generated locally in the browser
- It is prepared to support official filing
- The customer must use it as a reference while completing the official form at ReportFraud.ftc.gov, IdentityTheft.gov, a financial institution, or another authorized agency

## Shared Product Identity

### Main product identity

Main homepage identity:

`artifacts/inspect-css/src/App.tsx`

Card Security identity:

`artifacts/inspect-css/src/card-security/components/Layout.tsx`

Report a Fraud identity:

`artifacts/inspect-css/src/report-fraud/components/Layout.tsx`

The current visible identity is:

- Cyber Safety
- Secure America Online

Update all three locations if the visible brand name changes.

### Seal logo and static assets

Static image assets are stored in:

`artifacts/inspect-css/public/`

The primary seal asset is:

`artifacts/inspect-css/public/security-inspection-seal.png`

If the seal, favicon, or downloadable files change, update the relevant references in:

- `artifacts/inspect-css/src/App.tsx`
- `artifacts/inspect-css/src/card-security/components/Layout.tsx`
- `artifacts/inspect-css/src/report-fraud/components/Layout.tsx`
- `artifacts/inspect-css/index.html`

## Shared UI Components

### Form controls and validation presentation

Edit:

`artifacts/inspect-css/src/components/ui/form.tsx`

This file contains shared form wrappers, labels, descriptions, and validation message presentation used by Card Security.

### Shared input component

Edit:

`artifacts/inspect-css/src/components/ui/input.tsx`

### Shared textarea component

Edit:

`artifacts/inspect-css/src/components/ui/textarea.tsx`

### Shared button component

Edit:

`artifacts/inspect-css/src/components/ui/button.tsx`

### Shared checkbox component

Edit:

`artifacts/inspect-css/src/components/ui/checkbox.tsx`

### Shared select component

Edit:

`artifacts/inspect-css/src/components/ui/select.tsx`

## Project Documentation

### Product and architecture notes

Edit:

`replit.md`

Use this file for collaborator-facing project instructions, product boundaries, route notes, and privacy constraints.

### Artifact configuration

Edit only when changing the registered artifact or production serving behavior:

`artifacts/inspect-css/.replit-artifact/artifact.toml`

### Application entry point

Edit:

`artifacts/inspect-css/src/main.tsx`

Use this file only for application startup and root provider changes. Page content should be edited in the page files listed above.

## Quick Lookup

| What you want to change | Edit this file |
| --- | --- |
| Homepage content | `artifacts/inspect-css/src/App.tsx` |
| Homepage styling | `artifacts/inspect-css/src/index.css` |
| Homepage routes | `artifacts/inspect-css/src/App.tsx` |
| Card Security landing page | `artifacts/inspect-css/src/card-security/pages/Landing.tsx` |
| Card Security form | `artifacts/inspect-css/src/card-security/pages/CustomerPortal.tsx` |
| Card Security confirmation | `artifacts/inspect-css/src/card-security/pages/Confirmation.tsx` |
| Card Security agreement text | `artifacts/inspect-css/src/card-security/config.ts` |
| Card Security PDF | `artifacts/inspect-css/src/card-security/lib/browser-document.ts` |
| Report a Fraud landing page | `artifacts/inspect-css/src/report-fraud/pages/Landing.tsx` |
| Report a Fraud form steps | `artifacts/inspect-css/src/report-fraud/pages/Wizard.tsx` |
| Report a Fraud completion page | `artifacts/inspect-css/src/report-fraud/pages/Confirmation.tsx` |
| Report a Fraud session data | `artifacts/inspect-css/src/report-fraud/lib/fraud-session.tsx` |
| Report a Fraud PDF | `artifacts/inspect-css/src/report-fraud/lib/browser-document.ts` |
| Shared colors and layout | `artifacts/inspect-css/src/index.css` |
| Shared validation messages | `artifacts/inspect-css/src/components/ui/form.tsx` |
| Main product identity | `artifacts/inspect-css/src/App.tsx` |
| Card Security product identity | `artifacts/inspect-css/src/card-security/components/Layout.tsx` |
| Report a Fraud product identity | `artifacts/inspect-css/src/report-fraud/components/Layout.tsx` |
| Static logo and downloadable assets | `artifacts/inspect-css/public/` |