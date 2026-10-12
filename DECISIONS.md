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
