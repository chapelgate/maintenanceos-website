# Assessment: /create throws React hydration error 418

- Live release `ecd86a1` logs minified React error 418 (`text`) on `/create`.
- An unminified production comparison, after the same Cloudflare email rewrite, reported the paragraph in `EnquiryUnavailable`:
  - server text: `Online enquiries are temporarily unavailable. Please email [email protected].`
  - client text: `Online enquiries are temporarily unavailable. Please email andy@chapelgatehome.uk.`
- Cloudflare Email Address Obfuscation rewrites that address in the HTML before React hydrates the static export. The client still renders the real address, so the text does not match.
