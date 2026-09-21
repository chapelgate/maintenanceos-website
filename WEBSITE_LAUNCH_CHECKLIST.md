# WEBSITE_LAUNCH_CHECKLIST.md

**Owner:** MOS Documentation (structure) + Final Verifier (sign-off)  
**Updated:** 2026-09-17T15:35 BST  
**Rule:** Do **not** set `PUBLIC_LAUNCH=true` until this checklist and product/legal gates allow.

## Claims truth

- [ ] `PRODUCT_CLAIMS_REGISTER.md` current vs pilot evidence — **Claims Verifier**
- [ ] All page copy matches VERIFIED / UNDER TEST / PLANNED rules — **Copywriter + Claims Verifier**
- [ ] No commercially live / GA / certification / fake social proof claims — **Claims Verifier**
- [ ] Telephony/controlled-call stance still NO-GO reflected on site — **Product Investigator**

## Content & IA

- [ ] Minimum page set live (mission brief) — **Front-End + Copy**
- [ ] Industries pages claims-gated — **Industries + Claims Verifier**
- [ ] `/status` is placeholder architecture only (no fake metrics) — **Front-End**
- [ ] Brand system approved and applied — **Owner + Brand/UI**

## Legal (DRAFT → review)

- [ ] `/privacy`, `/cookies`, `/terms` marked **DRAFT FOR LEGAL REVIEW** until counsel clears — **Legal Scaffold + Privacy**
- [ ] Cookie/consent behaviour matches policy draft — **Privacy + Analytics**

## Forms & conversion

- [ ] Demo / waitlist / contact forms validate and store/queue leads — **Forms Engineer**
- [ ] No unsolicited consequential outbound mail unless configured — **Forms + Privacy**
- [ ] CTAs remain Create from website (primary) / Join launch list / Request early demo (secondary briefing) until launch policy changes — no live-phone “see it live” CTAs — **Conversion**

## Accessibility

- [ ] WCAG 2.2 AA baseline met (semantic HTML, keyboard, focus, contrast) — **Accessibility**
- [ ] Automated + manual a11y checks recorded — **QA + Accessibility**

## SEO foundation

- [ ] Titles, meta, sitemap, robots, OG, structured data — **SEO Architect**
- [ ] No aggressive/misleading promo metadata — **SEO + Claims**

## Security

- [ ] Security headers / CSP / form abuse controls reviewed — **Security**
- [ ] Dependency vulns checked; no secrets in repo — **Security + DevOps**
- [ ] `WEBSITE_SECURITY_REVIEW.md` filled — **Security**

## Performance

- [ ] Core Web Vitals targets agreed and measured on staging — **Performance**
- [ ] Font/image budget acceptable — **Performance + UI**

## Analytics

- [ ] Consent-gated events only; no unnecessary PII — **Analytics + Privacy**

## Staging & ops

- [ ] Website repo decided and scaffolded (B1) — **Owner + Site Director**
- [ ] Staging URL verified; deploy docs reproducible — **DevOps**
- [ ] `.env.example` complete; no secrets committed — **DevOps + Front-End**
- [ ] `CURSOR_HANDOFF.md` current — **Cursor Handoff**
- [ ] Automated tests green on staging — **QA**
- [ ] Mobile/cross-browser pass — **Mobile Tester**
- [ ] Red team report on staging reviewed (no unfixed criticals) — **Red Team + Security**

## PUBLIC_LAUNCH flip gate

- [ ] Owner approval to flip `PUBLIC_LAUNCH=true`
- [ ] Product telephony/commercial gates revisited (do not invent readiness)
- [ ] Legal drafts cleared or still clearly labelled if not
- [ ] Final Verifier DoD sign-off — **Final Verifier**
- [ ] `MAINTENANCEOS_WEBSITE_FINAL_REPORT.md` completed — **Documentation**
