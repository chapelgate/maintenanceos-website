# Decisions

Short record for this website-only repair. Owner instructions override these
if they conflict.

1. **Canonical host stays on the staging URL.** No production domain exists.
   Do not invent one. Tracked as MP-10.
2. **Spoken website voice falls back to the existing browser voice** until a
   website-owned preview endpoint is configured. The golden-line voice name,
   from `PRODUCT_CLAIMS_REGISTER.md` V-01, is Gemini / Gacrux. Do not copy,
   read, or reuse the golden line's credentials. Do not put a provider key in
   `NEXT_PUBLIC_*` (the static export would publish it).
3. **Desmond tour audio is not regenerated here.** Replacing it with Gacrux
   would need that provider. The page should say the tour is recorded
   narration, not the phone voice.
4. **Scanner reseed is source-only.** The droplet at `178.128.171.45` is out
   of scope. Shipping the package in git does not change production until an
   owner deploys it with the existing recovery path.
5. **Gas emergency strip comes off the global layout only.** The homepage
   link, `/how-we-keep-control/#gas`, and sector gas blocks stay.
6. **No new service, queue, or dependency** unless a patch upgrade is required
   to clear an advisory without a major-version migration. Do not downgrade
   `eslint-config-next` to 14.x.
7. **One branch and one pull request** for slices S0–S10, each slice its own
   commit.
8. **Dead Railway lead host is not called.** The existing operator mailbox
   `andy@chapelgatehome.uk` (lead notification destination already in
   `docs/WEBSITE_INTEGRATION_PROBLEM_LOG_2026-09-28.md`) is the public mailto
   fallback. No new inbox was invented and no replacement service was added.
9. **NVIDIA /oc output on this repo requires Cursor acceptance; UI slices route to Cursor after 3 demonstrated /oc failures.**

# MaintenanceOS council decisions, 12 October 2026

Andrew delegated the open decisions to a council of three independent passes: product and market, engineering and security, and UK legal and compliance. The three passes agreed. Competitor figures below are those companies' own statements, checked on 12 October 2026. They are not MaintenanceOS facts. No customer names, prices, legal identities, or performance numbers were invented for MaintenanceOS.

Items 1 to 9 already in `DECISIONS.md` still stand. This record does not reverse them.

## Decision table

| Item | Decision | Done in this website change |
| --- | --- | --- |
| 1. Scanner | Keep the website fail-closed. Redeploy droplet `606110383` from current `main`. | No droplet work. The client already refuses a zero-fetch partial. |
| 2. Voice | Browser en-GB. No Gacrux clip. No new endpoint. Golden line untouched. | No voice-code change. The empty-endpoint path already uses the browser. |
| 3. Lead intake | Mailto `andy@chapelgatehome.uk`. Do not call Railway. No new database. | Cookies copy and the form contract now match that. Mailto stays. |
| 4. Domain | Subdomain `maintenanceos.chapelgatetechnologies.com`. Do not switch the canonical until it resolves. | Constant added. Live canonical stays the staging host. |
| 5. Positioning | Maintenance-first. Receptionist means repair intake. | Create hero retitled. |
| 6. Legal and pricing | Publish the existing security page, pricing with no prices, and draft privacy, cookies, and terms. Add a voluntary accessibility note. Do not publish a public-sector statement or prices. | Cookies Railway sentence corrected. Accessibility note added after the automated check. |
| 7. Launch QA | Run axe and Playwright WebKit. Leave physical devices on the owner list. | axe-core 4.10.3 in Playwright WebKit 26.6 reported no violations on the seven routes of the local static export. |
| 8. www to apex | No change in this repo. | Listed for Andrew. |
| MP-07 | Accept the braces advisory. Do not downgrade `eslint-config-next`. | Recorded. No dependency change. |
| MP-08 | Accept the per-instance scan cap. No shared store. | Recorded. No new store. |

## 1. Scanner

Options:

- Keep the website fail-closed and have Andrew redeploy the existing Scanner V2 droplet from verified current `main`.
- Ship a website-only workaround that treats a failed or empty read as a completed scan.
- Have this agent SSH to the droplet or create a new host.

Evidence:

- The reseed is in this repository. The live scanner is droplet `maintenanceos-scanner-v2`, id `606110383`, address `178.128.171.45`. A website merge does not update it. The old payload `cadce5c` is revoked.
- The website client already treats a zero-fetch partial as an error and tells the visitor that nothing was invented.
- Agents must not SSH, SCP, or redeploy that host. The public site must not name the droplet, the address, or the release.

Decision: keep the website fail-closed. The redeploy is on Andrew's list.

Reason: a page that pretended the scan had worked would invent business facts. A new host would break the rule that the existing droplet is the scanner.

## 2. Receptionist voice

Options:

- Keep the browser voice.
- Add a pre-recorded Gacrux sample clip.
- Add a new website-only speech endpoint.

Evidence:

- When `NEXT_PUBLIC_VOICE_PREVIEW_ENDPOINT` is empty, `speakReceptionistText` uses the browser. The name Gacrux is only sent if an endpoint is configured.
- No Gacrux audio file is in this repository. The product-tour soundtrack is `scripts/product-tour/vo/desmond.wav`, and the page already calls it recorded narration.
- The golden phone line must not be read, copied, or called. A `NEXT_PUBLIC_` provider key would be published in the static export.

Decision: keep the browser en-GB voice. Do not add a clip or an endpoint.

Reason: a clip with no Gacrux recording would be fake, and a new endpoint is new infrastructure. The golden line stays untouched. A later website-owned preview URL is optional and is on Andrew's list.

## 3. Lead intake

Options:

- Keep the mailto fallback to the existing mailbox.
- Call the Railway control plane again.
- Add a database, or a relative `/api/leads` route, on this static site.

Evidence:

- `https://rsfm-control-plane-production.up.railway.app` returns 404 Application not found.
- This site is a static export. A relative `/api/leads` route is not served.
- `andy@chapelgatehome.uk` is the mailbox already named as the lead-notification destination. No new inbox was created.
- The local stub at `http://127.0.0.1:8787/leads` stays available for development. The public adapter was not narrowed to https-only, because that would break the stub.

Decision: mailto stays the only public path. Do not call Railway. Do not add a database or service.

Reason: the existing mailbox is the simplest receiver that already works. A new service is not required for a pre-launch site that already says enquiries are unavailable online. Replacing mailto needs an HTTPS endpoint Andrew controls.

## 4. Domain

Options:

- Serve MaintenanceOS at `maintenanceos.chapelgatetechnologies.com`.
- Serve it on a path of `chapelgatetechnologies.com`.
- Switch the canonical to the new name now.

Evidence, checked on 12 October 2026:

- `https://chapelgatetechnologies.com/` and `https://www.chapelgatetechnologies.com/` both returned HTTP 200 from DigitalOcean app origin `0f1f70fe-623b-45e8-8013-8527118c2b9b`. That is the Chapelgate Technologies site, not this export.
- Apex A records: `172.66.0.96` and `162.159.140.98`. `www` CNAME: `chapelgate-technologies-website-647rc.ondigitalocean.app`. Name servers: `ns19.domaincontrol.com` and `ns20.domaincontrol.com`.
- `maintenanceos.chapelgatetechnologies.com` did not resolve.
- This site's public host is `https://seahorse-app-4oasq.ondigitalocean.app`.
- Static export does not apply `redirects()`.

Decision: use the subdomain. Prepare canonical, sitemap, and JSON-LD behind `NEXT_PUBLIC_SITE_URL`. Name the intended host as `INTENDED_PRODUCTION_SITE_URL` and do not read it until DNS resolves. Do not change the live canonical.

Reason: a path would mean changing the other DigitalOcean app. Publishing the new name as canonical before it resolves would point metadata at a host that does not serve this site. The DigitalOcean token is invalid, so the DNS and domain attach stay on Andrew's list, with the exact records in the owner list.

## 5. Positioning

Options:

- Maintenance-first, with the receptionist as the repair-intake role.
- A general agency receptionist that books viewings and writes to a CRM.

Evidence, from those companies' own pages on 12 October 2026:

- Vinny describes an AI teammate for leasing and maintenance, including portal, web, and WhatsApp enquiry capture, viewings, and contractor booking. Its maintenance page says it is ISO 27001 and SOC 2 certified and claims 99.99% uptime. Sources: [askvinny.com](https://www.askvinny.com/) and [maintenance automation](https://www.askvinny.com/maintenance-automation).
- Nesti's AI receptionist page describes answering calls, WhatsApp, email, and website chat, qualifying enquiries, and booking viewings, and says it is live 24/7 in 16 languages. Source: [nesti.io/workforce/ai-receptionist](https://www.nesti.io/workforce/ai-receptionist). Nesti also offers a separate AI property manager for tenant maintenance. Source: [nesti.io/workforce/ai-property-manager](https://www.nesti.io/workforce/ai-property-manager).
- Voco says it answers tenant repair calls 24 hours a day and logs Fixflo issues, with issues arriving as drafts by default. Voco says Fixflo is used by more than 2,000 agencies and over 40% of UK letting agents. That figure is Voco's statement. Sources: [Voco Fixflo integration](https://vocohq.co.uk/integrations/fixflo) and the same claims on [the integration article](https://vocohq.co.uk/blog/voco-fixflo-integration).
- Fixflo's Arthur page describes tenants reporting repairs in the Arthur app. It is a portal report, not an AI phone receptionist. Source: [Fixflo and Arthur](https://www.fixflo.com/integrations/lettings/arthur).
- Claire says it does not diagnose the repair, decide liability, or approve spend, and that access to named property platforms varies, so no native connection is implied. Source: [letsaskclaire.com/uk/property-management](https://www.letsaskclaire.com/uk/property-management).
- PropServ's LinkedIn company description, which is a self-description, says its agent handles tenant reports 24/7 by phone, app, and web chat and instructs contractors, with native CRM integration. Source: [linkedin.com/company/propservco](https://www.linkedin.com/company/propservco).
- This site's home page is already repair intake for landlords, letting agents, and housing providers. `/ai-receptionist/` already says it is for UK maintenance intake and is not a live phone. The create hero still said "Turn your business website into an AI receptionist".

Decision: maintenance-first. The receptionist is the repair-intake preview, not a general agency receptionist.

Reason: the surrounding market already sells viewing booking, CRM writeback, and 24/7 live phone answering. This site cannot truthfully join that claim. The create hero now says it is a repair-intake preview and that it does not change the live telephone service, book viewings, or write into a CRM. No new product claim was added. Pre-launch caveats stay.

## 6. Legal, trust, and pricing

Options:

- Publish a public-sector accessibility statement, prices, and finished legal pages.
- Publish only what is already true, fix the cookies contradiction, and add a voluntary note of the automated check.
- Publish nothing further.

Evidence:

- Regulation 8 of the Public Sector Bodies (Websites and Mobile Applications) (No. 2) Accessibility Regulations 2018 (SI 2018/952) is the accessibility-statement duty. The instrument is addressed to public sector bodies. Source: [legislation.gov.uk](https://www.legislation.gov.uk/uksi/2018/952/regulation/8). Make Things Accessible describes that statement as a document organisations must publish under those regulations. Source: [makethingsaccessible.com](https://www.makethingsaccessible.com/guides/accessibility-statements-what-are-they/).
- The Equality and Human Rights Commission publishes summary guidance on services. Source: [equality_act_summary_guidance_on_services.pdf](https://www.equalityhumanrights.com/sites/default/files/equality_act_summary_guidance_on_services.pdf). This site does not claim Equality Act compliance.
- `/security` already records the 10 September 2026 local checks and says they are not an uptime percentage, latency guarantee, or SLA. `/pricing` already publishes no list prices.
- Privacy, cookies, and terms stay drafts with counsel placeholders. The cookies page said measurement was sent to the Railway control plane. The privacy page already says that host returns Application not found and that the beacon does not post.

Decision: keep the security page and the no-price pricing page. Leave privacy, cookies, and terms as drafts. Correct the cookies page so it matches privacy. Publish a voluntary accessibility note that is not a public-sector statement and not a certification. Company facts and counsel questions stay on Andrew's list.

Reason: those pages can be true without a company number, an ICO number, or a price. A finished privacy notice or terms page would require facts this repository does not contain.

## 7. Launch QA

Options:

- Treat an earlier note as a physical Safari and assistive-technology sign-off.
- Run axe-core and Playwright WebKit now, and leave the physical check on the owner list.
- Skip automated checks.

Evidence:

- HB-002 already says automated WebKit is not a physical iPhone or Mac Safari pass, and not a pass by a person using assistive technology.
- Playwright WebKit 26.6 was installed for this check. axe-core 4.10.3 was run against a local static export. The result is on `/accessibility/`.

Decision: record the automated run. Do not claim the physical or assistive-technology pass.

Reason: those checks need a person and a physical Apple device. On the local static export, axe-core 4.10.3 in Playwright WebKit 26.6 reported no violations on `/`, `/create/`, `/demo/`, `/features/`, `/pricing/`, `/security/`, and `/accessibility/`. Each returned HTTP 200, had one level-1 heading, and did not overflow at 1440 by 900. WebKit recorded no uncaught page error. That run is not a physical Safari or assistive-technology pass.

## 8. www-to-apex redirect

Options:

- Add a redirect in this Next.js config.
- Leave it, and list the exact owner action.

Evidence:

- On 12 October 2026 both the apex and `www` returned HTTP 200 for the corporate app origin `0f1f70fe-623b-45e8-8013-8527118c2b9b`. There is no www-to-apex redirect today.
- `redirects()` is not applied to this static export. This repository is not that corporate app.

Decision: no change in this repo. The redirect is on Andrew's list and needs a valid DigitalOcean token or the corporate app console.

Reason: a redirect here would not run, and pointing `www` or the apex at MaintenanceOS would replace the Chapelgate Technologies site.

## MP-07. eslint braces advisory

Options:

- Downgrade `eslint-config-next` to 14.2.35.
- Accept the residual.

Evidence:

- `npm audit` still reports `braces` GHSA-vfj7-8cjw-p6xm through `eslint-config-next`. `braces` 3.0.3 is the current release and the advisory range is all versions. The suggested fix is a major downgrade from Next 16.3.8. Decision 6 already forbids that downgrade. The package is not in the static site runtime.

Decision: accept the residual. No dependency change.

Reason: clearing the advisory would mean running the Next 16 site on a Next 14 eslint config. That is a worse trade than a dev-toolchain advisory.

## MP-08. Per-instance scan limit

Options:

- Add Redis or another shared store so the limit is global.
- Accept the per-instance cap.

Evidence:

- The scan function allows 8 requests per IP and 3 per IP per host each minute, in memory, per function instance. A shared limit needs a store. The client IP is taken from the first `x-forwarded-for` hop, so the cap is not a legal control. It is live only if the App Platform function component is redeployed.

Decision: accept the residual. Do not add a store. Do not describe the cap as a legal control.

Reason: a new store is new infrastructure, and it is not required to keep the website honest. Redeploying the existing function bundle, if Andrew wants the in-repo cap to be the live one, is on his list with the scanner.

## Sources

- https://www.askvinny.com/
- https://www.askvinny.com/maintenance-automation
- https://www.nesti.io/workforce/ai-receptionist
- https://www.nesti.io/workforce/ai-property-manager
- https://vocohq.co.uk/integrations/fixflo
- https://vocohq.co.uk/blog/voco-fixflo-integration
- https://www.fixflo.com/integrations/lettings/arthur
- https://www.letsaskclaire.com/uk/property-management
- https://www.linkedin.com/company/propservco
- https://www.legislation.gov.uk/uksi/2018/952/regulation/8
- https://www.makethingsaccessible.com/guides/accessibility-statements-what-are-they/
- https://www.equalityhumanrights.com/sites/default/files/equality_act_summary_guidance_on_services.pdf

## Things only Andrew can do

1. Scanner droplet. Use the existing approved recovery identity for droplet `606110383` only. Deploy a fresh payload built from verified current `main` (not `cadce5c`, and not the older pin `fe69aa7e25a18fa800e3728dd02046501de1db5f`). Keep the existing fail-closed/self-rollback method and the existing HTTPS route. Check health, then a zero-fetch resume, before treating production scan as repaired. Do not paste the recovery private key into chat or GitHub and do not create a replacement host. Also redeploy the App Platform scan function component if the in-repo per-instance limits should be the live bundle.
2. Voice, optional. The council kept the browser voice. A website-owned Gacrux preview is not required. If you want one later, provide a URL that already holds the credential server-side, separate from the golden line. Set `NEXT_PUBLIC_VOICE_PREVIEW_ENDPOINT` and rebuild. Do not send the golden line's key. Only then regenerate `desmond.wav` and run `npm run product-tour:remux`.
3. Lead intake, optional. Mailto `andy@chapelgatehome.uk` stays the public path. To replace it, supply an HTTPS endpoint you control that meets `docs/FORM_ENDPOINT_CONTRACT.md` and set `NEXT_PUBLIC_FORM_ENDPOINT` at build. Also answer: is `andy@chapelgatehome.uk` the controller's mailbox, who else can read it, and how long is mail kept?
4. Domain. At GoDaddy (`ns19.domaincontrol.com` and `ns20.domaincontrol.com`), add CNAME `maintenanceos` to `seahorse-app-4oasq.ondigitalocean.app` (or the hostname DigitalOcean shows when the domain is added). Do not change the apex A records `172.66.0.96` and `162.159.140.98`, and do not change the `www` CNAME `chapelgate-technologies-website-647rc.ondigitalocean.app`. In the MaintenanceOS DigitalOcean app (not app origin `0f1f70fe-623b-45e8-8013-8527118c2b9b`), add the hostname `maintenanceos.chapelgatetechnologies.com` and complete any verification DigitalOcean asks for. The DigitalOcean API token is currently invalid, so this cannot be done from here. Only after `dig` and HTTPS show that name serving this export, set `NEXT_PUBLIC_SITE_URL=https://maintenanceos.chapelgatetechnologies.com` and rebuild.
5. www-to-apex redirect for `chapelgatetechnologies.com`. On 12 October 2026 both `https://chapelgatetechnologies.com/` and `https://www.chapelgatetechnologies.com/` returned HTTP 200 from app origin `0f1f70fe-623b-45e8-8013-8527118c2b9b`. A redirect is a setting on that corporate app, Cloudflare, or GoDaddy. It needs a valid DigitalOcean token or the corporate app console. Do not point `www` or the apex at MaintenanceOS.
6. Counsel and company-record questions, before any draft legal page is treated as final. What is the controller's legal name, registered office, company number, and ICO registration number if any? What is the lawful basis for an enquiry email, for a website URL submitted on `/create`, and for any future measurement store? Does DigitalOcean or another processor handle personal data outside the UK, and what transfer mechanism applies? What is the retention period once a receiver exists? Who handles access and erasure requests, and by what process? What children's clause should the draft use? What governing law, courts, and liability cap should the draft terms use? Is the operator a public sector body? If not, a statement under the Public Sector Bodies (Websites and Mobile Applications) (No. 2) Accessibility Regulations 2018 is not required. Who will complete the assistive-technology review? Does the host set any cookie the inventory should name?
7. Physical Safari and assistive technology (HB-002). On physical Safari/macOS and iOS Safari, check `/`, `/create/`, `/demo/`, `/features/`, `/pricing/`, and `/security/`. Complete a manual keyboard pass and an assistive-technology pass. Record browser, device, and OS versions. Automated WebKit is not that pass.
8. MP-07 and MP-08 need no action unless you want a different risk decision. The braces advisory stays accepted. The scan cap stays per function instance. No shared store was added.
