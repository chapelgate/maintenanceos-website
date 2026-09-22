# Product tour (in-repo, claims-safe)

Self-hosted HTML5 tour for `/how-it-works/#product-tour`.  
**Not** a Higgsfield / paid AI-video asset. Chrome + ffmpeg only.

## Beats (locked)

1. Paste a public company website URL (`https://your-business.co.uk` — instructional, not a customer).
2. Scan / crawl progress — checking, then honest **queued** (no invented extract).
3. Draft receptionist knowledge pack review — empty hours/services stay empty.
4. AI collects/classifies; **rules** own safety and money.
5. UK maintenance ops context (999, never 911).
6. Pre-launch honesty — **not** a public always-on live phone.

## Hard vetoes

- No live-phone / headset theatre, fake customers, logos, reviews, or dispatch/payments.
- No “beats Fonio” or commercial-live claims.
- Single-hue blue `#1D4ED8`, light paper, flat-ink wordmark. Orb is not in this tour.

## Regenerate

Requires `ffmpeg` and Chrome (`google-chrome` / `google-chrome-stable`, or `CHROME_PATH`).

```bash
npm run product-tour
# preview the storyboard in a browser:
node scripts/product-tour/render.mjs --preview
```

Writes:

- `public/media/product-tour.mp4` — 1280×720, 12 fps, H.264 CRF 28, no audio, `+faststart`
- `public/media/product-tour.poster.webp` — frame at 5.2s (URL typed)
- `public/media/product-tour.en-GB.vtt` — copied from `captions.en-GB.vtt`

Budget target is **~8–12 MB** (a ceiling, not a quota). The current encode is **~0.33 MB** because the tour is mostly static paper UI — do not pad the file. If `LAST_RENDER.md` reports over 12 MB, raise CRF (29–31) and re-run before commit. Do not add a scheduled GitHub Action for this.

## Site wiring

- Player: `src/components/ProductTour.tsx` — native `<video controls preload="none">`, no autoplay, not muted.
- Chrome: `.product-tour-card` in `globals.css` (paper, thin line, 12px, `accent-color` blue).
- Home: compact **Watch product tour** text link under the hero CTAs only.
