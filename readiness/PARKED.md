- separate build/test droplet (extbot feasibility ask, 26 Oct 19:35 GMT): new spend. Free route: lower-priority builds move to the REA droplet (t734u).

## welsh (Welsh model), parked by t734u setup, 26 Oct 2026
- Speechmatics Melia paid trial (SHORTLIST action 4): spend. Free route: LID-routed decoding plus Welsh LM fusion on our own CPU.
- Accepting gated dataset terms (Common Voice Welsh v27.0, WLGA, any non-commercial set): legal. Free route: CC0 Banc Trawsgrifiadau Bangor and other openly licensed data only.
- LUMI / EuroHPC GPU hours for Welsh fine-tuning: not used by this loop. Free route: CPU-only small proofs.
- duo-desk production config (extbot ask, 26 Oct 20:35 GMT): web origin/domain for BETTER_AUTH_URL, production Postgres DATABASE_URL, a registered broker OAuth client (redirect /api/auth/oauth2/callback/grok-google, email_verified), and the owner email for DUO_ALLOWED_EMAILS. Free routes: tailscale funnel or a droplet hostname as the origin, self-hosted Postgres on an existing droplet. The OAuth client registration and owner email are Andy-only. Raise with the completed Duo build.
- duo-desk go-live inputs (extbot 21:06 GMT): model key route (DUO_MODEL/base URL/DUO_MODEL_API_KEY, root-side secret) and a named deployer, as well as the origin, Postgres, broker client and allowed email parked at 20:35. Free route for the model: estate-coding through OmniRoute, served by root. The deployer and owner email are Andy-only.

- 2026-10-26 Duo broker client: auth.grok.me self-registration needs authentication (401). Needs Andy Grok account. Redirect https://cg-jobs.taild4745e.ts.net:10000/api/auth/oauth2/callback/grok-google. Free route: Google OAuth client direct (code change). See readiness/DUO-GOLIVE.md
- duo SMS / persistent Hermes assistant (extbot relayed scope, 22:14 GMT): not approved. SMS needs a paid provider, a number and per-message fees, so it's parked as Andy-only spend. No free route for real SMS. Option: email or web notifications in the desk at 0 pounds.

## t748u, 26 Oct 2026 ~22:55 GMT
- welsh build loop REMOVED from the estate loop (Andy t748u). Coding cannot move accuracy further (frozen40 18.94% WER unchanged); only training can. Resumes when GPU hours (e.g. LUMI/EuroHPC) or datasets (gated Welsh sets) are unparked by Andy. All code, data and checkpoints kept. To resume: re-add welsh to PRIORITY_BUILDS.md and remove it from PAUSED_BUILDS.md and restore it in build-supervisor.sh P list.
- lo (LandlordOS) build loop REMOVED (Andy t748u): all 11 lo-ws slices built, PRs #314-316 merged 22:38 GMT. Live landlord pilot needs Andy: DPIA sign-off, DPA, named design partner.
- 2026-10-26T23:00:14Z chapelgate/business-evidence-wallet#49: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:00:20Z chapelgate/business-evidence-wallet#84: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:00:22Z chapelgate/chapelgate-multilingual-transcribe#23: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:00:23Z chapelgate/business-evidence-wallet#85: closed unmerged, branch kept. Reserved reason: frozen paths. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:00:25Z chapelgate/chapelgate-multilingual-transcribe#24: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:00:26Z chapelgate/business-evidence-wallet#86: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:00:28Z chapelgate/chapelgate-multilingual-transcribe#73: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:00:29Z chapelgate/business-evidence-wallet#87: closed unmerged, branch kept. Reserved reason: frozen paths. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:00:31Z chapelgate/chapelgate-technologies-site#4: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:00:32Z chapelgate/business-evidence-wallet#88: closed unmerged, branch kept. Reserved reason: frozen paths. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:00:34Z chapelgate/chapelgate-technologies-site#61: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:00:35Z chapelgate/business-evidence-wallet#89: closed unmerged, branch kept. Reserved reason: frozen paths. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:00:36Z chapelgate/chapelgate-technologies-site#62: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:00:38Z chapelgate/business-evidence-wallet#91: closed unmerged, branch kept. Reserved reason: frozen paths. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:00:39Z chapelgate/chapelgate-technologies-site#63: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:00:41Z chapelgate/business-evidence-wallet#92: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:00:42Z chapelgate/chapelgate-technologies-site#115: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:00:43Z chapelgate/business-evidence-wallet#94: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:00:44Z chapelgate/chapelgate-technologies-site#116: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:00:46Z chapelgate/business-evidence-wallet#97: closed unmerged, branch kept. Reserved reason: frozen paths. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:00:48Z chapelgate/business-evidence-wallet#98: closed unmerged, branch kept. Reserved reason: frozen paths. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:00:51Z chapelgate/business-evidence-wallet#135: closed unmerged, branch kept. Reserved reason: frozen paths. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:00:54Z chapelgate/business-evidence-wallet#139: closed unmerged, branch kept. Reserved reason: frozen paths. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:00:55Z chapelgate/cheap-trips#161: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:00:56Z chapelgate/business-evidence-wallet#140: closed unmerged, branch kept. Reserved reason: EW #140 hold. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:00:57Z chapelgate/cheap-trips#175: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:00:59Z chapelgate/business-evidence-wallet#141: closed unmerged, branch kept. Reserved reason: frozen paths. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:00:59Z chapelgate/cheap-trips#177: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:01:02Z chapelgate/business-evidence-wallet#157: closed unmerged, branch kept. Reserved reason: frozen paths. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:01:02Z chapelgate/cheap-trips#179: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:01:05Z chapelgate/cheap-trips#180: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:01:07Z chapelgate/cheap-trips#182: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:01:07Z chapelgate/business-evidence-wallet#95: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:01:10Z chapelgate/cheap-trips#189: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:01:13Z chapelgate/cheap-trips#190: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:01:16Z chapelgate/cheap-trips#218: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:01:19Z chapelgate/cheap-trips#219: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:01:21Z chapelgate/cheap-trips#220: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:01:24Z chapelgate/cheap-trips#232: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:01:27Z chapelgate/cheap-trips#233: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:01:30Z chapelgate/cheap-trips#235: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:01:32Z chapelgate/cheap-trips#236: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:01:35Z chapelgate/cheap-trips#237: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:01:38Z chapelgate/cheap-trips#238: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:01:41Z chapelgate/cheap-trips#239: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:01:44Z chapelgate/cheap-trips#241: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:01:46Z chapelgate/cheap-trips#243: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:01:51Z chapelgate/cheap-trips#244: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:01:54Z chapelgate/cheap-trips#245: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:06:32Z chapelgate/evolution-engine#497: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:07:35Z chapelgate/landlord-os#155: closed unmerged, branch kept. Reserved reason: frozen paths. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:08:03Z chapelgate/holiday-let-operator#159: closed unmerged, branch kept. Reserved reason: frozen paths. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:08:31Z chapelgate/maintenanceos-website#293: closed unmerged, branch kept. Reserved reason: frozen paths. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:08:35Z chapelgate/maintenanceos-website#294: closed unmerged, branch kept. Reserved reason: frozen paths. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:09:05Z chapelgate/holiday-let-operator#195: closed unmerged, branch kept. Reserved reason: frozen paths. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:09:10Z chapelgate/cheap-trips#322: closed unmerged, branch kept. Reserved reason: GitHub Actions budget exhausted for this repo's CI; free route: self-hosted runner on the droplets. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:09:12Z chapelgate/cheap-trips#327: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:09:17Z chapelgate/maintenanceos-website#307: closed unmerged, branch kept. Reserved reason: frozen paths. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:09:20Z chapelgate/maintenanceos-website#317: closed unmerged, branch kept. Reserved reason: frozen paths. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:09:22Z chapelgate/maintenanceos-website#323: closed unmerged, branch kept. Reserved reason: frozen paths. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:09:26Z chapelgate/maintenanceos-website#325: closed unmerged, branch kept. Reserved reason: frozen paths. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:09:29Z chapelgate/maintenanceos-website#340: closed unmerged, branch kept. Reserved reason: frozen paths. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:10:13Z chapelgate/public-sector-citizen-agent#183: closed unmerged, branch kept. Reserved reason: frozen paths. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:10:26Z chapelgate/holiday-let-operator#210: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:10:32Z chapelgate/holiday-let-operator#223: closed unmerged, branch kept. Reserved reason: GitHub Actions budget exhausted for this repo's CI; free route: self-hosted runner on the droplets. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:10:34Z chapelgate/holiday-let-operator#225: closed unmerged, branch kept. Reserved reason: frozen paths. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:10:37Z chapelgate/holiday-let-operator#226: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:40:52Z chapelgate/public-sector-document-copilot#36: closed unmerged, branch kept. Reserved reason: GitHub Actions budget exhausted for this repo's CI; free route: self-hosted runner on the droplets. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:42:29Z chapelgate/cheap-trips#388: closed unmerged, branch kept. Reserved reason: GitHub Actions budget exhausted for this repo's CI; free route: self-hosted runner on the droplets. Free route: re-raise once the reserved item is cleared.
- 2026-10-26T23:42:30Z chapelgate/public-sector-citizen-agent#274: closed unmerged, branch kept. Reserved reason: GitHub Actions budget exhausted for this repo's CI; free route: self-hosted runner on the droplets. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T01:54:33Z chapelgate/chapelgate-information-rights#947: closed unmerged, branch kept. Reserved reason: GitHub Actions budget exhausted for this repo's CI; free route: self-hosted runner on the droplets. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T01:54:36Z chapelgate/cheap-trips#557: closed unmerged, branch kept. Reserved reason: GitHub Actions budget exhausted for this repo's CI; free route: self-hosted runner on the droplets. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T01:55:03Z chapelgate/holiday-let-operator#437: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T01:55:06Z chapelgate/holiday-let-operator#438: closed unmerged, branch kept. Reserved reason: GitHub Actions budget exhausted for this repo's CI; free route: self-hosted runner on the droplets. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T01:55:22Z chapelgate/legal-case-management#493: closed unmerged, branch kept. Reserved reason: GitHub Actions budget exhausted for this repo's CI; free route: self-hosted runner on the droplets. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T01:55:45Z chapelgate/maintenanceos-v1-pilot#319: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T01:55:48Z chapelgate/maintenanceos-v1-pilot#320: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T01:55:51Z chapelgate/maintenanceos-v1-pilot#321: closed unmerged, branch kept. Reserved reason: frozen paths. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T01:55:57Z chapelgate/public-sector-citizen-agent#314: closed unmerged, branch kept. Reserved reason: GitHub Actions budget exhausted for this repo's CI; free route: self-hosted runner on the droplets. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T01:58:11Z chapelgate/business-evidence-wallet#887: closed unmerged, branch kept. Reserved reason: merge refused by branch protection. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T01:59:59Z chapelgate/business-evidence-wallet#891: closed unmerged, branch kept. Reserved reason: merge refused by branch protection. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T02:02:16Z chapelgate/business-evidence-wallet#895: closed unmerged, branch kept. Reserved reason: merge refused by branch protection. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T02:23:18Z chapelgate/public-sector-citizen-agent#317: closed unmerged, branch kept. Reserved reason: checks failing. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T02:23:19Z chapelgate/public-sector-citizen-agent#318: closed unmerged, branch kept. Reserved reason: checks failing. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T02:23:23Z chapelgate/public-sector-citizen-agent#319: closed unmerged, branch kept. Reserved reason: checks failing. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T02:23:24Z chapelgate/chapelgate-technologies-site#117: closed unmerged, branch kept. Reserved reason: merge conflicts with main. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T02:23:27Z chapelgate/chapelgate-technologies-site#114: closed unmerged, branch kept. Reserved reason: merge conflicts with main. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T02:23:28Z chapelgate/chapelgate-technologies-site#19: closed unmerged, branch kept. Reserved reason: merge conflicts with main. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T02:23:30Z chapelgate/chapelgate-information-rights#943: closed unmerged, branch kept. Reserved reason: checks failing. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T02:23:32Z chapelgate/chapelgate-information-rights#941: closed unmerged, branch kept. Reserved reason: checks failing. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T02:23:35Z chapelgate/chapelgate-information-rights#942: closed unmerged, branch kept. Reserved reason: checks failing. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T02:23:37Z chapelgate/chapelgate-information-rights#940: closed unmerged, branch kept. Reserved reason: checks failing. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T02:23:38Z chapelgate/chapelgate-information-rights#933: closed unmerged, branch kept. Reserved reason: checks failing. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T02:23:41Z chapelgate/chapelgate-information-rights#58: closed unmerged, branch kept. Reserved reason: draft, not council-approved. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T02:23:43Z chapelgate/chapelgate-technologies-website#20: closed unmerged, branch kept. Reserved reason: draft, not council-approved. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T02:23:58Z chapelgate/public-sector-citizen-agent#317: closed unmerged, branch kept. Reserved reason: GitHub Actions budget / failing checks; free route: self-hosted runner on the droplets. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T02:23:58Z chapelgate/public-sector-citizen-agent#318: closed unmerged, branch kept. Reserved reason: GitHub Actions budget / failing checks; free route: self-hosted runner on the droplets. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T02:23:58Z chapelgate/public-sector-citizen-agent#319: closed unmerged, branch kept. Reserved reason: GitHub Actions budget / failing checks; free route: self-hosted runner on the droplets. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T02:25:10Z chapelgate/holiday-let-operator#442/#439/#438/#437: closed unmerged, branch kept. Reserved reason: GitHub Actions budget exhausted for this repo's CI; free route: self-hosted runner on the droplets. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T02:29:37Z chapelgate/chapelgate-technologies-site#122: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T02:29:38Z chapelgate/chapelgate-information-rights#972: closed unmerged, branch kept. Reserved reason: GitHub Actions budget exhausted for this repo's CI; free route: self-hosted runner on the droplets. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T02:29:46Z chapelgate/maintenanceos-v1-pilot#322: closed unmerged, branch kept. Reserved reason: frozen paths. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T02:29:48Z chapelgate/maintenanceos-v1-pilot#323: closed unmerged, branch kept. Reserved reason: frozen paths. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T02:29:50Z chapelgate/holiday-let-operator#443: closed unmerged, branch kept. Reserved reason: GitHub Actions budget exhausted for this repo's CI; free route: self-hosted runner on the droplets. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T02:33:04Z chapelgate/maintenanceos-v1-pilot#324: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T02:33:11Z chapelgate/holiday-let-operator#437: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T02:33:14Z chapelgate/holiday-let-operator#438: closed unmerged, branch kept. Reserved reason: GitHub Actions budget exhausted for this repo's CI; free route: self-hosted runner on the droplets. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T04:55:55Z chapelgate/chapelgate-technologies-site#126: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T04:55:56Z chapelgate/chapelgate-information-rights#976: closed unmerged, branch kept. Reserved reason: GitHub Actions budget exhausted for this repo's CI; free route: self-hosted runner on the droplets. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T04:55:58Z chapelgate/chapelgate-technologies-site#127: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T04:56:00Z chapelgate/chapelgate-technologies-site#128: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T04:56:03Z chapelgate/chapelgate-technologies-site#129: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T04:56:16Z chapelgate/holiday-let-operator#444: closed unmerged, branch kept. Reserved reason: GitHub Actions budget exhausted for this repo's CI; free route: self-hosted runner on the droplets. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T04:56:22Z chapelgate/legal-case-management#506: closed unmerged, branch kept. Reserved reason: GitHub Actions budget exhausted for this repo's CI; free route: self-hosted runner on the droplets. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T04:56:26Z chapelgate/holiday-let-operator#447: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T04:56:44Z chapelgate/public-sector-citizen-agent#320: closed unmerged, branch kept. Reserved reason: GitHub Actions budget exhausted for this repo's CI; free route: self-hosted runner on the droplets. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T05:02:02Z chapelgate/holiday-let-operator#443: closed unmerged, branch kept. Reserved reason: estate-gate red (likely Actions budget / gate). Free route: self-hosted estate-gate green then re-raise.
- 2026-10-27T05:02:04Z chapelgate/holiday-let-operator#449: closed unmerged, branch kept. Reserved reason: estate-gate red (likely Actions budget / gate). Free route: self-hosted estate-gate green then re-raise.
- 2026-10-27T05:02:06Z chapelgate/holiday-let-operator#450: closed unmerged, branch kept. Reserved reason: estate-gate red (likely Actions budget / gate). Free route: self-hosted estate-gate green then re-raise.
- 2026-10-27T05:02:08Z chapelgate/holiday-let-operator#451: closed unmerged, branch kept. Reserved reason: estate-gate red (likely Actions budget / gate). Free route: self-hosted estate-gate green then re-raise.
- 2026-10-27T05:02:20Z chapelgate/chapelgate-information-rights#958: closed unmerged, branch kept. Reserved reason: pytest failing on real diff; no Andy spend. Free route: fix tests locally and re-raise.
- 2026-10-27T05:02:22Z chapelgate/chapelgate-information-rights#959: closed unmerged, branch kept. Reserved reason: pytest failing on real diff; no Andy spend. Free route: fix tests locally and re-raise.
- 2026-10-27T05:02:24Z chapelgate/chapelgate-information-rights#971: closed unmerged, branch kept. Reserved reason: pytest failing on real diff; no Andy spend. Free route: fix tests locally and re-raise.
- 2026-10-27T05:02:26Z chapelgate/chapelgate-information-rights#972: closed unmerged, branch kept. Reserved reason: pytest failing on real diff; no Andy spend. Free route: fix tests locally and re-raise.
- 2026-10-27T05:02:29Z chapelgate/chapelgate-information-rights#973: closed unmerged, branch kept. Reserved reason: pytest failing on real diff; no Andy spend. Free route: fix tests locally and re-raise.
- 2026-10-27T05:02:32Z chapelgate/chapelgate-information-rights#974: closed unmerged, branch kept. Reserved reason: pytest failing on real diff; no Andy spend. Free route: fix tests locally and re-raise.
- 2026-10-27T05:19:29Z chapelgate/maintenanceos-website#481: closed unmerged, branch kept. Reserved reason: estate-gate pending; no Andy spend. Free route: re-run CI on self-hosted runner.
- 2026-10-27T05:19:32Z chapelgate/maintenanceos-website#482: closed unmerged, branch kept. Reserved reason: estate-gate pending; no Andy spend. Free route: re-run CI on self-hosted runner.
- 2026-10-27T05:19:34Z chapelgate/maintenanceos-website#483: closed unmerged, branch kept. Reserved reason: estate-gate pending; no Andy spend. Free route: re-run CI on self-hosted runner.
- 2026-10-27T05:19:36Z chapelgate/maintenanceos-website#484: closed unmerged, branch kept. Reserved reason: estate-gate pending; no Andy spend. Free route: re-run CI on self-hosted runner.
- 2026-10-27T05:19:38Z chapelgate/maintenanceos-website#486: closed unmerged, branch kept. Reserved reason: estate-gate pending; no Andy spend. Free route: re-run CI on self-hosted runner.
- 2026-10-27T05:19:58Z chapelgate/chapelgate-information-rights#994: closed unmerged, branch kept. Reserved reason: pytest red on real diff. Free route: fix tests locally and re-raise.
- 2026-10-27T05:20:00Z chapelgate/chapelgate-information-rights#993: closed unmerged, branch kept. Reserved reason: pytest red on real diff. Free route: fix tests locally and re-raise.
- 2026-10-27T05:20:02Z chapelgate/chapelgate-information-rights#992: closed unmerged, branch kept. Reserved reason: pytest red on real diff. Free route: fix tests locally and re-raise.
- 2026-10-27T05:20:05Z chapelgate/chapelgate-information-rights#990: closed unmerged, branch kept. Reserved reason: pytest red on real diff. Free route: fix tests locally and re-raise.
- 2026-10-27T05:20:09Z chapelgate/chapelgate-information-rights#991: closed unmerged, branch kept. Reserved reason: pytest red on real diff. Free route: fix tests locally and re-raise.
- 2026-10-27T05:20:11Z chapelgate/chapelgate-information-rights#989: closed unmerged, branch kept. Reserved reason: pytest red on real diff. Free route: fix tests locally and re-raise.
- 2026-10-27T05:20:14Z chapelgate/public-sector-citizen-agent#332: closed unmerged, branch kept. Reserved reason: GitHub Actions budget exhausted (Andy-only). Free route: self-hosted runner on droplets.
- 2026-10-27T05:20:16Z chapelgate/public-sector-citizen-agent#331: closed unmerged, branch kept. Reserved reason: GitHub Actions budget exhausted (Andy-only). Free route: self-hosted runner on droplets.
- 2026-10-27T05:20:18Z chapelgate/public-sector-citizen-agent#330: closed unmerged, branch kept. Reserved reason: GitHub Actions budget exhausted (Andy-only). Free route: self-hosted runner on droplets.
- 2026-10-27T05:21:28Z chapelgate/maintenanceos-v1-pilot#337: closed unmerged, branch kept. Reserved reason: frozen paths (identity.py). Free route: move phone max helper off identity.py and re-raise.
- 2026-10-27T05:22:07Z chapelgate/maintenanceos-v1-pilot#338: closed unmerged, branch kept. Reserved reason: frozen paths (identity.py). Free route: move helper off identity.py and re-raise.
- 2026-10-27T07:58:09Z chapelgate/chapelgate-technologies-site#135: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T07:58:10Z chapelgate/chapelgate-information-rights#1014: closed unmerged, branch kept. Reserved reason: GitHub Actions budget exhausted for this repo's CI; free route: self-hosted runner on the droplets. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T07:58:12Z chapelgate/chapelgate-technologies-site#136: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T07:58:13Z chapelgate/cheap-trips#620: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T07:58:14Z chapelgate/chapelgate-technologies-site#137: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T07:58:17Z chapelgate/legal-case-management#513: closed unmerged, branch kept. Reserved reason: GitHub Actions budget exhausted for this repo's CI; free route: self-hosted runner on the droplets. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T07:58:21Z chapelgate/maintenanceos-v1-pilot#355: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T07:58:23Z chapelgate/holiday-let-operator#452: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T07:58:24Z chapelgate/maintenanceos-v1-pilot#356: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once the reserved item is cleared.
- 2026-10-27T07:58:31Z chapelgate/public-sector-citizen-agent#333: closed unmerged, branch kept. Reserved reason: GitHub Actions budget exhausted for this repo's CI; free route: self-hosted runner on the droplets. Free route: re-raise once the reserved item is cleared.

## 2026-10-27 disk headroom (t753u)
- Hermes 70% disk gate: now 67.5% after cache cleanup, ~7.5 GB headroom. Next space = old /root/jobs-work folders or /root/.local/share/opencode (30G) - project data, needs Andy OK (delete). Free route: move cold jobs-work folders to a snapshot/volume only if approved.

## 20261027T083216Z hermes disk gate (t755u)
- Raised Hermes disk gate 70% -> 85% in /opt/hermes/bin/*-loop.py (backups .bak-t755u-*). Overnight 27 Oct both loops stalled on DISK_LIMIT. 85% of 309G still leaves ~46G free.

## 2026-10-27 08:55 GMT duo W67e intake (t756u)
- Relaunching the Instinct (extbot) run on chapelgate/duo-desk is an Andy / Instinct-console action, not doable by any council. Free route used instead: extbot pushes W67e to duo-desk branch extbot/duo-w67e via its existing 'extbot duo-desk write' deploy key, or drops duo-portable-W67e.tgz into /home/extbot/work/inbox/ on the jobs droplet. Note pinned at top of /home/extbot/work/STATUS.md and QUEUE.md item DUO-W67E.
- Standalone Hermes SMS assistant: stays parked (paid SMS provider/number).

## 20261027T090009Z extbot Cheap Trips access (t757) [RESOLVED by Andy t758u, 27 Oct 2026 09:08 GMT]
- RESOLVED: Andy t758u made extbot the Cheap Trips agent. Done 09:15 GMT: root mirror /srv/extbot-mirror/chapelgate-cheap-trips.git, extbot clone /home/extbot/work/cheap-trips, harvest product tr (extbot/tr-release -> one draft PR), tests extbot-tests-tr.path; tr in HANDED_BUILDS.md, out of REMOTE_BUILDS.md, job-build-tr stopped on 64.227.40.86. No deploy key added (root harvest pushes).
- extbot asked (mail 27 Oct 08:58 GMT) for a cheap-trips mirror + push to extbot/* branches. New repo access beyond the t715u duo-desk grant needs Andy yes. Parked. No Cheap Trips slice is open anyway (all HOLD/HUMAN_BLOCKED), so nothing is lost.

## 2026-10-27T11:04Z council-cycle
- lcm #517/#518/#519 closed unmerged, branches kept: CONFLICTING on readiness/lcm-repo-scaffold + CI test FAILURE. Free route: retarget to main, drop COUNT_NOTE noise, reopen one behavioural PR.
- ew #1010 closed unmerged, branch kept: CONFLICTING vs master. Free route: rebase on current master and re-open typecheck fix.
- MaintenanceOS production deploy / voice box 165.227.227.9: unchanged PARK. Free route: merge-to-main only where no auto-deploy (mw/mos workflows checked; no prod deploy on push for these slices).
- GitHub Actions spend / budget top-ups: PARK. Free route: self-hosted runners already in use for estate-gate.
- Solicitor / ICO fee / Companies House / DPIA signing: PARK (Andy-only legal/spend). Free route: builds continue on synthetic; last-gates stay off critical path until commercial GO.
- t764u (27 Oct 2026 13:08 GMT): build host 64.227.40.86 (4 CPU/8 GB) runs at load 18-27 with swap full; remote cap cut 4->3 and cw moved to the jobs droplet. More build throughput there needs a resize or extra droplet = spend, Andy only. Not done.
2026-10-27T13:58Z chapelgate/chapelgate-technologies-site#156: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once deploy_on_push is off or brochure cutover is approved.
2026-10-27T13:58Z chapelgate/chapelgate-technologies-site#157: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once deploy_on_push is off or brochure cutover is approved.
2026-10-27T13:58Z chapelgate/chapelgate-technologies-site#158: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once deploy_on_push is off or brochure cutover is approved.
2026-10-27T13:58Z chapelgate/chapelgate-technologies-site#159: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once deploy_on_push is off or brochure cutover is approved.
2026-10-27T13:58Z chapelgate/chapelgate-technologies-site#160: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once deploy_on_push is off or brochure cutover is approved.
2026-10-27T13:58Z chapelgate/chapelgate-technologies-site#161: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once deploy_on_push is off or brochure cutover is approved.
2026-10-27T13:58Z chapelgate/chapelgate-technologies-site#162: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once deploy_on_push is off or brochure cutover is approved.
2026-10-27T13:58Z chapelgate/chapelgate-technologies-site#163: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once deploy_on_push is off or brochure cutover is approved.
2026-10-27T13:58Z chapelgate/chapelgate-technologies-site#164: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once deploy_on_push is off or brochure cutover is approved.
2026-10-27T13:58Z chapelgate/chapelgate-technologies-site#165: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once deploy_on_push is off or brochure cutover is approved.
2026-10-27T13:58Z chapelgate/chapelgate-technologies-site#166: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once deploy_on_push is off or brochure cutover is approved.
2026-10-27T13:58Z chapelgate/chapelgate-technologies-site#167: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once deploy_on_push is off or brochure cutover is approved.
2026-10-27T13:58Z chapelgate/chapelgate-technologies-site#168: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once deploy_on_push is off or brochure cutover is approved.
2026-10-27T13:58Z chapelgate/chapelgate-technologies-site#169: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once deploy_on_push is off or brochure cutover is approved.
2026-10-27T13:58Z chapelgate/chapelgate-technologies-site#170: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once deploy_on_push is off or brochure cutover is approved.
2026-10-27T13:58Z chapelgate/chapelgate-technologies-site#171: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once deploy_on_push is off or brochure cutover is approved.
2026-10-27T13:58Z chapelgate/chapelgate-technologies-site#172: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once deploy_on_push is off or brochure cutover is approved.
2026-10-27T13:58Z chapelgate/chapelgate-technologies-site#173: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once deploy_on_push is off or brochure cutover is approved.
2026-10-27T13:58Z chapelgate/chapelgate-technologies-site#174: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once deploy_on_push is off or brochure cutover is approved.
2026-10-27T13:59Z chapelgate/chapelgate-information-rights#1041: closed unmerged, branch kept. Reserved reason: pytest failing on real diff; no Andy spend. Free route: fix tests locally and re-raise.
2026-10-27T13:59Z chapelgate/legal-case-management#521: closed unmerged, branch kept. Reserved reason: merge conflicts with readiness/lcm-repo-scaffold; rebase on the kept branch and re-raise.
2026-10-27T13:59Z chapelgate/legal-case-management#522: closed unmerged, branch kept. Reserved reason: merge conflicts with readiness/lcm-repo-scaffold; rebase on the kept branch and re-raise.
2026-10-27T13:59Z chapelgate/legal-case-management#524: closed unmerged, branch kept. Reserved reason: merge conflicts with readiness/lcm-repo-scaffold; rebase on the kept branch and re-raise.
2026-10-27T13:59Z chapelgate/legal-case-management#523: closed unmerged, branch kept. Reserved reason: test failure on main; fix and re-raise.
2026-10-27T13:59Z chapelgate/cheap-trips#643: closed unmerged, branch kept. Reserved reason: extbot draft PR awaiting extbot merge.
2026-10-27T13:59Z chapelgate/maintenanceos-website#516: closed unmerged, branch kept. Reserved reason: lighthouse failure; fix locally and re-raise.
2026-10-27T14:00Z chapelgate/legal-case-management#521: closed unmerged, branch kept. Reserved reason: merge conflicts with base. Free route: rebase on main and re-raise one behavioural PR.
2026-10-27T14:00Z chapelgate/legal-case-management#522: closed unmerged, branch kept. Reserved reason: merge conflicts with base. Free route: rebase on main and re-raise one behavioural PR.
2026-10-27T14:00Z chapelgate/legal-case-management#524: closed unmerged, branch kept. Reserved reason: merge conflicts with base. Free route: rebase on main and re-raise one behavioural PR.
2026-10-27T14:00Z chapelgate/legal-case-management#523: closed unmerged, branch kept. Reserved reason: checks failing / COUNT_NOTE noise; lcm parked. Free route: strip note-only files, fix tests locally, re-raise.
2026-10-27T14:00Z chapelgate/cheap-trips#643: closed unmerged, branch kept. Reserved reason: estate-gate red; main deploy-on-push. Free route: self-hosted estate-gate green then re-raise tests-only if deploy paths stay untouched.
2026-10-27T14:00Z chapelgate/chapelgate-technologies-site#175: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once deploy_on_push is off or brochure cutover is approved.
2026-10-27T14:00Z chapelgate/chapelgate-technologies-site#176: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once deploy_on_push is off or brochure cutover is approved.
2026-10-27T14:00Z chapelgate/chapelgate-technologies-site#177: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once deploy_on_push is off or brochure cutover is approved.
2026-10-27T14:01Z chapelgate/chapelgate-technologies-site#175: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once deploy_on_push is off or brochure cutover is approved.
2026-10-27T14:01Z chapelgate/chapelgate-technologies-site#176: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once deploy_on_push is off or brochure cutover is approved.
2026-10-27T14:01Z chapelgate/chapelgate-technologies-site#177: closed unmerged, branch kept. Reserved reason: merge triggers an automatic deploy. Free route: re-raise once deploy_on_push is off or brochure cutover is approved.
2026-10-27T14:02Z chapelgate/maintenanceos-v1-pilot#427: closed unmerged, branch kept. Reserved reason: no council decision; branch kept pending future need.
2026-10-27T14:02Z chapelgate/maintenanceos-v1-pilot#428: closed unmerged, branch kept. Reserved reason: no council decision; branch kept pending future need.
2026-10-27T14:02Z chapelgate/maintenanceos-v1-pilot#429: closed unmerged, branch kept. Reserved reason: no council decision; branch kept pending future need.
2026-10-27T14:02Z chapelgate/maintenanceos-v1-pilot#429: closed unmerged, branch kept.
2026-10-27T14:05Z chapelgate/maintenanceos-v1-pilot#427: closed unmerged, branch kept. Reserved reason: estate-gate can't run (Actions budget exhausted; Andy spend). Free route: self-hosted runner green then re-raise stack bottom-up #427→#428→#429.
2026-10-27T14:05Z chapelgate/maintenanceos-v1-pilot#428: closed unmerged, branch kept. Reserved reason: estate-gate can't run (Actions budget exhausted; Andy spend). Free route: self-hosted runner green then re-raise stack bottom-up #427→#428→#429.
2026-10-27T14:05Z chapelgate/maintenanceos-v1-pilot#429: closed unmerged, branch kept. Reserved reason: estate-gate can't run (Actions budget exhausted; Andy spend). Free route: self-hosted runner green then re-raise stack bottom-up #427→#428→#429.
2026-10-27T14:08Z chapelgate/chapelgate-information-rights#1045: closed unmerged, branch kept. Reserved reason: CI Actions budget exhausted; local tests pass. Free route: self-hosted runner green then re-raise.

- 2026-10-27: EW #1034 hcv-compliance-obligation-actions-busy — CLOSED empty head; branch kept; no Andy needed.

## 20261027T1640Z Cheap Trips deploy-on-push hold [RESOLVED by Andy t766u/t767u, 27 Oct 2026 16:34 GMT]
- RESOLVED: Andy gave extbot full authority over Cheap Trips and ordered "Merge". PR #643 (extbot/tr-release @ 29ac0da, tests/ only) reopened and squash-merged to main as 9ea331ec3909caa8bb06959844f3b0b9421e513e at ~16:38 GMT. No Deploy run fired (tests/ is outside deploy.yml push paths); https://tripcheap.co.uk/ 200 after merge.
- From now on "merge triggers an automatic deploy" is NOT a park reason for extbot's cheap-trips branches. Councils merge them once scoped tests pass (rule in AGENTS.md "Cheap Trips exception"). The 13:59/14:00Z #643 entries above are cleared. Older estate-loop cheap-trips PRs (#161..#620) are NOT covered (not extbot work); re-raise only via extbot.
- Still parked/limits: spend (Actions budget top-ups), secrets, CI/Caddy/deploy-config changes, new tokens/keys.

## 2026-10-27T17:12Z council-cycle
- holiday-let-operator Actions budget blocking estate-gate (e.g. #478/#480 path): spend. Free route: self-hosted runner on droplets; branch kept for hl-s048.
- opencode.db prune (27GB) and unused docker image deletes: irreversible data delete → Andy-only/parked; free route: continue with N=4 caps.
- Droplet resize to 32GB: spend. Free route: keep N=4 + suite lock + cache clears.

## 2026-10-27 council-cycle HLO #491
- Closed unmerged, branch kept. Reason: conflicts after #490. Free route: rebase S063 onto master and reopen.

## 2026-10-27T20:36Z council-cycle
- GitHub Actions budget exhausted (ubuntu-latest): PARK spend. Free route: local pytest/node tests + self-hosted estate runners.
- DC LoginThrottle key-cap (#180/#184 closed, branches kept): free route dc build adds MAX_KEYS + sweep then reopen.
- MOS production deploy / voice box 165.227.227.9: unchanged PARK.
- IR #1086 closed for local-verify path; branch kept for b18 build to re-raise.
- 2026-10-27T21:33Z rea16 b-01 (chapelgate-information-rights#47) and c-06 (business-evidence-wallet#174): closed unmerged 27 Oct 00:28 GMT by PR-zero, branches kept; rea16 loop finished (t783u). Free route: owning build re-raises from the kept branch.

## t788u, 28 Oct 2026 ~04:18 GMT (this ACT cycle)
- status file rotation: tick.py .bak-* rotation at source (rotate >7 days to readiness/archive/) — LEGAL-NOW
- dead host 161.35.169.247 removed from pipecat-rea.md — LEGAL-NOW
- Duo Desk go-live inputs: DATABASE_URL, DUO_ALLOWED_EMAILS, broker OAuth client, model key route — Andy-only spend, PARKED
- OmniRoute monitoring AUTH_001 unreadable without auth token — reporting gap, LEGAL-NOW but no free route without key
- Backup key verification (Groq/Mistral/Gemini/Claude/Codex): requires tuner access on 64.227.40.86, PARKED
- Pipecat LLM intent classification fix: disk 81% leaves 3% headroom to 84% gate, PARKED until disk < 80%
- need integration: Hermes tenders changes under /opt/hermes, READ-ONLY per constraint 9, PARKED
- Status file sprawl (54 .bak-* files, 295M readiness dir): addressed via tick.py rotation, ongoing LEGAL-NOW
- opencode.db 31GB at ~/.local/share/opencode/opencode.db: path documented corrected; vacuum added to nightly clean timer, ongoing LEGAL-NOW
- Disk at 81%, 380 inotify/no-space errors in 48h: tick.py rotation + .old-* prune, ongoing LEGAL-NOW
- copilotkit: verdict consumed; LAB-ONLY, live chat/Serve PARKED (needs Andy key). Free route: keep CopilotKit lab-only; no live Serve enable; no key rotation changes.
- openclaw: sandbox allowed for untrusted-skill eval only; full install stays REJECTED; no running container required until a skill needs it.
- infinity: core built + 108 tests; a non-root agent-core wait-pattern pilot is LEGAL but optional; no daemon/UI; PARK the daemon/UI. Free route: one-slice non-root agent-core eval wait-pattern pilot on the jobs droplet.
- marketing skills / agent reach: anything needing WhatsApp/Teams/paid accounts PARKED (Andy). Free route: a single free tripcheap messaging playbook via extbot; no new paid accounts.
- chinese models: enabling only already-configured FREE OmniRoute backups with estate-only prompts (no customer data) is the free route. Paid direct deals + customer data stay REJECTED/Andy-only.

- build-supervisor honesty cap (t785u rank 3, PARKED rather than editing to avoid breaking the build loop): proposed one-liner "in build-supervisor.sh, before any CUT/honesty/loading-status slice, skip if AUTO_DECISIONS.md already has one such slice for the same product today; prefer real behaviour slices". Free route: supervisors apply the policy manually per-tick until a safe edit is agreed by councils.

## t786u Document Copilot (27 Oct 2026 23:00 GMT)
- Bids, council contact, framework (G-Cloud) listing, pricing, accreditation (Cyber Essentials, pen-test), DPIA and DPA: PARKED, Andy only. The capability pack lists them as gaps and not as claims.
- Public exposure (Tailscale funnel or public port) for Copilot: PARKED, not done. Access is localhost plus ssh tunnel only.
  - t806u (28 Oct 2026): tailnet-only access DONE: `tailscale serve` https://cg-jobs.taild4745e.ts.net:10001 -> 127.0.0.1:8770 (Andy's tailnet devices only, no funnel, no public port, no DNS). Public funnel or public port remains PARKED. Free route: keep tailnet-only; Andy approves any public exposure separately.
  - t806u: login throttle and CSRF hardening still PARKED (app has neither). Scope is now Andy's 2 tailnet devices plus root, not root-only. Free route: one-off repair branch via OpenCode council if Andy wants it before any wider access.
- Login throttle and CSRF hardening branch: PARKED until Copilot is reopened. It is not essential at root-only localhost scope. If reopened, do it on a separate repair branch and keep the frozen commit.
- 2026-10-27T23:25Z chapelgate/chapelgate-information-rights (ir, b18): handed to Grok (Andy t791u). Estate parks all build, review, merge and sweep work on this repo. Unpushed estate WIP saved as patches in readiness/grok-handover-ir/wip-patches/ (b18-192 redresses, b18-230 a11y, ir-1027-58 login label, ir-1028-26 exemption autocomplete); worktrees kept, not deleted. Free route back: remove ir/b18 from HANDED_BUILDS.md, re-add ir to REMOTE_BUILDS.md, remove the repo from PR_SWEEP_EXCLUDE.md.
- 2026-10-28 08:12 GMT | cheap-trips | extbot asked for a daily, private copy of /app/data/page-views-daily.txt (aggregate date/bucket/count, no visitor data) readable on the jobs droplet. Needs a new cross-host credential (jobs droplet -> trips host 206.189.112.98, read-only forced-command key + root timer writing to a root-owned dir). Auto-review blocked key creation as unauthorised; parked. Free route meanwhile: HQ posts reads on request in /home/extbot/work/STATUS.md. **RESOLVED 2026-10-28 08:25 GMT (Andy approved t803s3534):** built. Key /root/.ssh/trips_pageviews_ro (root 0600, jobs droplet only) is forced-command restricted on the trips host; root timer trips-pageviews-copy.timer 06:00 UTC daily writes /srv/extbot-readonly/cheap-trips/page-views-daily.txt (+ .mtime), root:extbot 0640, read-only to extbot.

## Cheap Trips privacy slice 6 (28 Oct 2026 16:45 GMT)
- Live /api/auth sign-in+registration are enabled (CHEAP_TRIPS_ACCOUNTS_ENABLED switch from PR #219 not deployed). Deploy go-ahead is Andy's. Free route: extbot keeps privacy copy accurate to "accounts currently enabled" until #219 deploys.
- privacy@chapelgatehome.uk owner/controller not documented. Free route: note "not documented" in policy evidence; owner to be confirmed with Andy at release.
- Pinned jsdom/axe-core for extbot's runner = install, not granted. Free route: dr eggbot runs wcag_aa on demand as root (15/15 passed at ca9a93f and 25f2c3c).

## 2026-10-28 t809u holidaylets.tripcheap.co.uk DNS points at a stale host (production DNS change, needs Andy)
- Public DNS (GoDaddy, ns77/ns78.domaincontrol.com) has holidaylets.tripcheap.co.uk A 144.126.226.143. That host answers only ssh, with no 80/443, and its ssh host key no longer matches the laptop's known_hosts. It's probably the old droplet 601167763, gone or reassigned. The live app is hlo-pilot on the runner 64.227.40.86 behind Caddy, which already has the holidaylets.tripcheap.co.uk site block and works at https://holidaylets.64-227-40-86.sslip.io.
- Fix (free, Andy only): in GoDaddy DNS for tripcheap.co.uk, change the A record holidaylets to 64.227.40.86. Caddy will then get the certificate itself. No Caddy edit is needed.
- Free route meanwhile: https://holidaylets.64-227-40-86.sslip.io (200).

## Evidence Wallet commercial release (t810u)
(Andy t810u, 28 Oct 2026. Lines appended by job-build-ew on the jobs droplet: item | why only a human | free route | what the mission does meanwhile.)

## 2026-10-28 EW invite mailer (ew-invite-mailer, Andy t152u 19:45 GMT via the Evidence Wallet agent). Branch readiness/ew-invite-mailer, PR held by Andy (do not merge)
- Mail provider account (SendGrid or Amazon SES, whichever the PR picks): account creation is Andy's only (t737u). Provider facts checked 28 Oct 2026: SendGrid has had no free plan since May 2025, only a one-time 60-day trial at 100 emails/day. SES's 3,000/month free tier ended for new customers on 21 Jul 2026; new AWS accounts get up to $200 in Free Tier credits for 6 months, and SES Essentials costs $0.16 per 1,000 emails. Free route: leave the mailer env vars unset. The app then falls back to today's on-screen invite code with no error and no spend, and the owner shares the code by hand. If email is wanted, a new AWS account's free credits or a SendGrid 60-day trial covers a pilot at no cost.
- Provider API key / credentials: Andy creates them in the provider console and sets them only in the server environment (never in chat, the repo or .env.example values). Free route: same on-screen fallback as above.
- Verified sender (domain or single sender identity, plus SPF/DKIM DNS records if domain-verified): Andy only (production DNS, t795u). Free route: a single-sender verification of an address Andy already owns needs no DNS change. Until then, use the on-screen fallback.
- .env.example placeholder lines: .env* is a frozen path (the push hook refuses it), so the PR proposes the exact commented lines in docs/MAILER.md for Andy to add. Free route: the docs list them, and the code runs with them absent.
## 2026-10-28 mt-fusion-t93u: delete chapelgate-multilingual-transcribe is Andy-only (irreversible). Status READY, report /root/jobs-work/tasks/mt-fusion-t93u/out/REPORT.md, PR fusion/mt-into-transcribe-t93u, head bbd026bdc6243c0b7b670fb915fb4ce634c22fc4. Free route: archive (reversible) instead, also Andy's call.

## nvidia-dev-lane retire leftovers (t822u, 28 Oct 2026)
- red-team-board PR #104 (https://github.com/chapelgate/red-team-board/pull/104): estate-gate not run, GitHub Actions budget exhausted. Free route: run the gate on a self-hosted runner, or leave it for the PR-zero council once budget resets.
- Runner host 64.227.40.86: /home/cgr-cloud/<owner>-runners/nvidia-dev-lane (904 MB) not removed, because it was outside the t822u scope (delete). Free route: archive it to /root/archive, then remove it when approved.
- /opt/<owner>-runners/nvdl/externals (597 MB) kept: maintenanceos-website-owner.service (disabled) uses its node24. MaintenanceOS changes are off limits. Free route: repoint it to a system node when MOS work allows.

## 2026-10-29 00:25 UTC  lcm pilot build (Andy t0u, Grok one-off job, branch readiness/lcm-pilot-runtime-t0u @ d1e6882)
Phases 1-5 built and tested on the jobs droplet (39 passed; record in the repo TASKS.md). Human-only items:
- lcm-t0u-1 Pilot partner: Andy picks a friendly council/firm and sends docs/PILOT_BRIEF.pdf. No bot contacts buyers. Free route: keep demoing on synthetic data.
- lcm-t0u-2 Real sample documents need the partner IG sign-off (DPIA / data-sharing basis) before loading. Free route: synthetic bundles in tests/pilot/fixtures.
- lcm-t0u-3 Pilot hosting for a partner workspace (no prod deploy made). Free route: jobs droplet, 127.0.0.1 + SSH tunnel, synthetic data only.
- lcm-t0u-4 North Tyneside tech spec + demo scenarios sit behind an OPEN portal supplier login (account creation / bid decision; deadline 13 Nov 2026 12:00). Free route: docs/NORTH_TYNESIDE_COMPARISON.md against the public notice.
- lcm-t0u-5 GitHub Actions: budget exhausted for this repo, and Actions need a read-only key/secret to fetch the private IR core. Free route: droplet test runs.
- lcm-t0u-6 Merge of the pilot branch: Andy decides (held in PR_SWEEP_EXCLUDE.md). Never to main without him.

## 2026-10-29 mt-fusion-t93u: delete chapelgate-multilingual-transcribe is Andy-only (irreversible). Status BLOCKED, report /root/jobs-work/tasks/mt-fusion-t93u/out/REPORT.md, PR https://github.com/chapelgate/chapelgate-transcribe/pull/49, head 8bfaea91ea622679e1da2c13102652c0d552aacc. Free route: archive (reversible) instead, also Andy's call.

## 2026-10-29 mos-loop: spare 157.245.45.241 disk 826928 KB free (<1 GB) - loop held, needs Andy OK to free space
rss20 cannot run safely; job-mos-loop held (MISSION_COMPLETE BLOCKED disk). Nothing deleted. Candidates (MB, path). Backups: 60 backup dirs, 38316 MB. Free route: keep the newest backup + rgold + whatever matches live 8000 (a32b5ed), delete the rest (~38 GB), or just apt-get clean + journalctl --vacuum-size=50M (~0.4 GB, enough to clear the 1 GB bar but not much headroom). Never touch /opt/maintenanceos or port 8000.
```
693	/root/maintenanceos.03c6c56-r11-backup
693	/root/maintenanceos.03c6c56-r12-backup
1	/root/maintenanceos.0ee55c3-backup
694	/root/maintenanceos.121951e-r27-backup
693	/root/maintenanceos.1542495-r16-backup
695	/root/maintenanceos.19007ba-r39-backup
695	/root/maintenanceos.19007ba-r40-backup
695	/root/maintenanceos.19007ba-r40a-backup
695	/root/maintenanceos.19007ba-r41-backup
694	/root/maintenanceos.2739ab2-r31-backup
693	/root/maintenanceos.2ffa2dc-r10-backup
694	/root/maintenanceos.3df7efa-r30-backup
1	/root/maintenanceos.3ee42c5-backup
692	/root/maintenanceos.464663d-backup
693	/root/maintenanceos.48c602e-r13-backup
695	/root/maintenanceos.4b8071a-r43-backup
695	/root/maintenanceos.4e16a50-r42-backup
695	/root/maintenanceos.4e16a50-r42b-backup
695	/root/maintenanceos.4e16a50-r43-backup
695	/root/maintenanceos.4e16a50-r44-backup
695	/root/maintenanceos.4e16a50-r45-backup
695	/root/maintenanceos.4e16a50-r46-backup
695	/root/maintenanceos.4e16a50-r47-backup
695	/root/maintenanceos.4e16a50-r48-backup
696	/root/maintenanceos.4e16a50-rgold-backup
693	/root/maintenanceos.52b8644-r22-backup
692	/root/maintenanceos.5998724-backup
1	/root/maintenanceos.5998724-r9-backup
719	/root/maintenanceos.59f44e3-backup
719	/root/maintenanceos.5f86bb0-backup
694	/root/maintenanceos.63fd292-r28-backup
694	/root/maintenanceos.66e2c5f-r38-backup
693	/root/maintenanceos.6f7ed78-r20-backup
693	/root/maintenanceos.7a4c3ff-r14-backup
694	/root/maintenanceos.8181d99-r32-backup
694	/root/maintenanceos.8181d99-r33-backup
719	/root/maintenanceos.8c960d5-backup
693	/root/maintenanceos.9a964a8-r21-backup
719	/root/maintenanceos.a267675-backup
693	/root/maintenanceos.a492b62-r23-backup
1	/root/maintenanceos.af60a2e-backup
1	/root/maintenanceos.b44283c-backup
719	/root/maintenanceos.b769098-backup
693	/root/maintenanceos.bc800df-r15-backup
693	/root/maintenanceos.bc800df-r17-backup
693	/root/maintenanceos.bd31550-r24-backup
694	/root/maintenanceos.bd31550-r25-backup
694	/root/maintenanceos.bd31550-r26-backup
693	/root/maintenanceos.c232339-backup
694	/root/maintenanceos.c4bbd10-r29-backup
692	/root/maintenanceos.cbe6600-backup
694	/root/maintenanceos.cd4640a-r36-backup
694	/root/maintenanceos.cd4640a-r37-backup
694	/root/maintenanceos.cd4640a-r38-backup
692	/root/maintenanceos.cffd38d-backup
695	/root/maintenanceos.d240e6a-r40-backup
693	/root/maintenanceos.e395938-backup
693	/root/maintenanceos.f01d039-r18-backup
693	/root/maintenanceos.f01d039-r19-backup
719	/root/maintenanceos.fa078b1-backup
254	/var/cache/apt
199	/root/.cache
Archived and active journals take up 192.0M in the file system.
```

- RESOLVED 20261029T083648Z: mos-loop spare disk item resolved with Andy OK (t226s1560). 58 old /root/maintenanceos.*-backup deleted; kept fa078b1 (newest) + 4e16a50-rgold; 37G free.
- lcm-t4u-5 (29 Oct 2026, t4u repair) Pilot document scope: PDF/Word disclosures are not redacted (P10 in lcm MASTER_PROBLEMS.md). Andy + partner confirm a text-only pilot, or wait for the PDF raster slice (core ir_redaction.raster). Free route: officer converts to text; PDFs/DOCX get an explicit per-file failed result.

## 2026-10-29 13:21 GMT mt-council-t96u (header time corrected by owner bot)

- (a) Source repo chapelgate-multilingual-transcribe: RECOMMEND-ARCHIVE (delete needs Andy).
- (b) FUS-07: FIX-NOW on PR #49 branch — wording replacement for status page health.yml references.
- (c) FUS-08: ghcr packages not a blocker; free route Andy checks/tokens.
- (d) extbot/mt-release harvest: retarget to chapelgate-transcribe before archive; pause before delete.
- (e) PR #49: STAY DRAFT held in PR_SWEEP_EXCLUDE.md; merge to main forbidden by Andy t93u.
- Owner-bot note 2026-10-29 13:30 GMT: archive of [REDACTED]-multilingual-transcribe = Andy yes (reversible, recommended); delete = Andy yes after FUS-08 ghcr check; PR #49 merge to main = Andy (t93u). Source repo still fires scheduled e2e/health runs (failing, budget) until archived.

## jobs droplet disk (t838u, 29 Oct 2026)
- Disk is at 83-84%. About 1.5 GB of caches, old temp files and old OpenCode tool output were cleared. The biggest item left is /root/.local/share/opencode/opencode.db (31 GB, the OpenCode session database). It was not touched because it holds session history. Free routes: export and VACUUM old sessions in a quiet window, or prune finished job task dirs under /root/jobs-work after a council check. A bigger disk or volume costs money and needs Andy.

## EW retro review (29 Oct 2026, dr eggbot)
- council-cycle merged EW #1179-#1197 (16:57-17:00 GMT) with estate-gate red and no review. A retrospective council review of master needs Andy yes (council BRIEF line 17). EW repo held in PR_SWEEP_EXCLUDE.md until then. Free route: build-ew keeps opening gated PRs; runner bew _work needs chown (EACCES) for sbom/vuln-scan.
