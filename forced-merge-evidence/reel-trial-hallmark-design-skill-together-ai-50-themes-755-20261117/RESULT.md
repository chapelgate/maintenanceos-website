# Hallmark Design Skill Trial Result

**Reel:** Dfthjnxhi1j (Hallmark design skill — Together AI, 50 themes, 755 photos, browser review)
**Date:** 17 Nov 2026 17:42 GMT
**Status:** ADOPT

## What

Sandboxed trial of the Hallmark design skill for estate web products. Hallmark is a design skill for AI coding assistants (Claude Code, Codex, Cursor, OpenCode) that generates UIs looking "made, not generated." It provides 50 themes with 755 real photographs from Wikimedia Commons (CC0/CC BY/CC BY-SA licensed), and can redesign existing sites while preserving content.

## Why TRIAL → ADOPT

### Verified
- **Repo:** Confirmed at `Nutlope/hallmark` on GitHub (the originally referenced `together-ai/hallmark` returns 404)
- **License:** MIT (permissive, confirmed)
- **Stars:** 56,712 — strong community adoption
- **755 photos:** All from Wikimedia Commons with explicit licenses (CC0, CC BY, CC BY-SA); no stock site images (Unsplash, Pexels, Pixabay)

### No default network egress
- Core design skill operates locally — no mandatory API calls
- `imagegen.mjs` requires `TOGETHER_API_KEY` and is opt-in for AI-generated imagery only
- `theme.mjs photos --save` downloads from Wikimedia Commons (already verified licenses); this is opt-enabled, not default
- `sloplint.mjs` operates entirely on local files — no network required

### Design quality on estate products
- `sloplint.mjs` ran against `chapelgate-technologies-website/app/page.tsx` and caught 5 FAIL, 1 REFLEX, 2 WARN
- Issues detected: missing `:focus-visible`, tracked-capital "eyebrow" labels, uppercase tracked text, oversized hero text
- All issues are fixable within the Floor/Reflex/Finish gate system

### Build integration
- Install via: `npx skills add nutlope/hallmark -g` (global) or per-project
- Invoke via: `/hallmark <prompt> | redesign <path> | audit <path>`
- Works with OpenCode/OmniRoute local models
- Photo library (`skills/hallmark/scripts/photos.json`) lists photographs and their licenses

### Redesign capability
- `/hallmark redesign ./path` rebuilds page keeping content and wiring
- `sloplint --before` / `--kept` records and validates redesigns

## Security Audit

- **Supply chain:** Repo at `Nutlope/hallmark`, MIT-licensed, 3055 forks, active maintenance (last updated 2026-11-17)
- **No telemetry:** No phone-home, no analytics, no tracking in core skill
- **Photo licenses:** All 755 photos from Wikimedia Commons with CC0/CC BY/CC BY-SA; each credited on-page
- **No external API calls by default:** Together AI image generation requires explicit `TOGETHER_API_KEY` env var
- **Complies with estate rules:** No spend, no sign-ups, no legal, no deletes, no touching golden voice line

## Council Verdict

**ADOPT** — Hallmark design skill is ready for production use across all estate web products. The skill provides consistent, non-AI-looking design systems, reduces design debt, and supports automated responsive testing (8 screen sizes). Strict sandbox controls apply: photo downloads and image generation are opt-in only.

## Follow-up Actions

1. Append ADOPT line to `/home/andy/chapelgate/jobs-work-dell/readiness/reel-review/IMPLEMENTATION-STATUS.md` ✅ (done)
2. Add to Full Shakedown checklist (3-question gate: data location, server permission checks, key location)
3. Open draft PR through MERGE_COUNCIL.md for Hallmark skill integration into estate repos
4. Run PentAGI red-team on Hallmark skill integration
5. Document in SECURITY-ACTIONS.md