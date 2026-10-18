# Build Readiness

## 1. Architecture and Boundaries
Status: APPLIES
Reason: Keeps the static export boundary with zero backend services or secrets by using a client-side mailto builder and clipboard fallback.

## 2. Data and Storage
Status: NOT_APPLICABLE
Reason: No database, storage, or server state is added; enquiry drafts open in the visitor's local mail client only.

## 3. Security and Privacy
Status: APPLIES
Reason: Encodes mailto parameters with encodeURIComponent, caps body and URL lengths, strips control characters, and sends nothing until the visitor presses send.

## 4. Reliability and Fallbacks
Status: APPLIES
Reason: Provides a visible Copy details button, prefilled mailto link, and plain info@chapelgatetechnologies.com fallback when no mail client opens.

## 5. Accessibility and UX
Status: APPLIES
Reason: Uses explicit field labels, aria-invalid and aria-describedby error bindings, aria-live polite alerts, focus management, and 48px min-h-12 buttons.

## 6. Testing and Verification
Status: APPLIES
Reason: Covered by unit tests for the mailto builder (encoding, length cap, special characters, validation) and repository contract/build tests.

## 7. Brand and Claims Honesty
Status: APPLIES
Reason: Spells WorkSmartOS as one word, makes no response-time or customer claims, and clearly states nothing is sent until the visitor presses send.

## 8. Operations and Rollback
Status: ALREADY_COVERED
Reason: Purely static frontend change in LeadCaptureForm and public-enquiry helper that can be reverted with a single git revert.
