# MaintenanceOS Website Human Blockers

Resolved blockers are retained in `MASTER_PROBLEM_LOG.md`. This file lists only current human actions.

## HB-002 — Physical Safari/iOS and manual assistive-technology launch QA
Status: OPEN LAUNCH-ONLY HUMAN GATE
Date: 2026-09-30

Exact blocker:
Automated engineering coverage now includes Edge, Firefox and WebKit at mobile,
tablet and desktop widths, but it cannot certify physical Safari/iOS behaviour or
manual assistive-technology usability.

Required human action:
- run the six buyer-critical routes on physical Safari/macOS and iOS Safari;
- complete a manual keyboard pass and an assistive-technology pass;
- record browser/device/OS versions plus any defects found;
- return defects for engineering repair and re-verification before public launch.

This does not block ordinary pre-launch engineering or the current staging site.
Evidence: `docs/CROSS_ENGINE_BROWSER_QA_2026-09-30.md`.

[executed on device: CG (72ec1dc1-79ea-4c2f-824f-f0ea86ff67b6)]

## HB-003 — Scanner V2 production runtime designation
Status: RESOLVED
Date resolved: 2026-10-05

Resolution:
A dedicated DigitalOcean runtime now exists: `maintenanceos-scanner-v2` (droplet 606110383, 178.128.171.45). The prior runtime-designation blocker is obsolete.

Remaining human-only boundary:
The Scanner host is reachable on public SSH and on private VPC SSH (`10.106.0.9:22`). Existing Chapelgate self-hosted runners proved VPC reachability but were rejected with `Permission denied (publickey)`, and their runner accounts expose no loaded/default public SSH identities to reuse. Public ports 80/443/8788 are closed. The exact accepted Scanner payload and fail-closed/self-rollback deployment script remain staged locally. Available automation is prohibited from invoking or redistributing the matching recovery private key. Resetting credentials, rebuilding the droplet, or creating replacement infrastructure would violate the surgical estate boundary. One owner-run local SSH/SCP invocation with the existing recovery identity remains the only safe action.


## 2026-10-06 — Scanner V2 current-candidate deployment correction
Status: OPEN HUMAN ACCESS GATE; OLD PAYLOAD REVOKED

The earlier owner-run deployment instruction referenced `maintenanceos-scanner-v2-cadce5c.tar.gz`. That payload is now obsolete because PR #202 later fixed a reproduced zero-evidence correctness defect.

Do NOT deploy the old `cadce5c` archive.

Exact next action:
1. Use the existing approved recovery identity for the dedicated Scanner V2 droplet `606110383` only.
2. Transfer/deploy a fresh payload built from exact verified current source `fe69aa7e25a18fa800e3728dd02046501de1db5f` (or a later main SHA only after equivalent verification).
3. Preserve the existing fail-closed/self-rollback deployment method and existing HTTPS route.
4. Verify health, then live black-box Scanner V2 behavior including the zero-evidence case before freezing.
5. Do not expose or copy the private recovery key into chat/GitHub and do not create a replacement host.

Verification already complete for PR #202:
- Estate Gate run `37384917884`: PASS.
- Website integration repair validation run `37384916833`: PASS.

## HB-004 — Scanner V2 droplet still runs the pre-reseed runtime
Status: OPEN
Affected slice: S2 (zero-fetch resume reseed)

Exact reason:
The marketing-website repo can hold the reseed and skip-reason code, but the
live scanner is the droplet `maintenanceos-scanner-v2` (droplet 606110383,
178.128.171.45). This change must not SSH, SCP, or redeploy that host. A
website merge does not update it. The previous owner instruction still
forbids deploying the old `cadce5c` archive.

What was attempted:
In-repo source and unit tests only. No droplet call and no new host.

Exact action Andrew needs to take:
1. Use the existing approved recovery identity for droplet `606110383` only.
2. After this website change is on `main` and its tests pass, deploy a fresh
   payload built from that verified `main` SHA (not `cadce5c`, and not an
   unverified intermediate).
3. Keep the existing fail-closed/self-rollback method and HTTPS route.
4. Check health, then a zero-fetch resume, before treating production scan as
   repaired.
5. Do not paste the recovery private key into chat or GitHub, and do not
   create a replacement host.

Other work can continue: yes. The website client can still treat a zero-fetch
response as a failure without a droplet deploy.

## HB-005 — Website-only Gemini/Gacrux preview credential
Status: OPEN
Affected slice: S5 (spoken voice on the website)

Exact reason:
`PRODUCT_CLAIMS_REGISTER.md` V-01 identifies the accepted golden-line voice as
Gemini / Gacrux. This static site has no website-owned credential for that
provider. The golden line's own keys must not be read or copied. A
`NEXT_PUBLIC_` key would be published in the export.

What was attempted:
Configuration for a website-owned preview URL, with the existing browser
en-GB voice when that URL is empty or fails. No provider key was added.

Exact action Andrew needs to take:
Provide a website-only speech preview URL that already holds a Gemini/Gacrux
credential server-side, separate from the golden phone line. Set
`NEXT_PUBLIC_VOICE_PREVIEW_ENDPOINT` for the website build (voice name
defaults to `Gacrux`) and rebuild. Do not send the golden line's key.

Other work can continue: yes. Visitors keep the browser voice until that URL
exists.

## HB-006 — Desmond product-tour soundtrack
Status: OPEN
Affected slice: S5 (tour voiceover)

Exact reason:
`public/media/product-tour.mp4` uses `scripts/product-tour/vo/desmond.wav`
(Higgsfield Seed Audio, voice Desmond). Matching the golden-line voice means
regenerating that recording with Gemini/Gacrux. This change must not fake
audio, and HB-005's website-only provider access does not exist yet.

What was attempted:
The visible caption is flagged as recorded narration, not the phone voice.
The wav and mp4 were left as committed.

Exact action Andrew needs to take:
When a website-owned Gacrux path exists, regenerate `desmond.wav` with that
voice and run `npm run product-tour:remux`. Until then, leave the committed
recording in place.

Other work can continue: yes.
