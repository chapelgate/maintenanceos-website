# Product tour (in-repo, claims-safe)

Self-hosted HTML5 tour for `/how-it-works/#product-tour`.  
**Not** a Higgsfield / paid AI-video asset. Chrome + ffmpeg for the picture; committed Desmond VO remuxed as AAC.

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
# remux only (keep existing H.264; pad/trim VO to 45s — do not time-stretch):
npm run product-tour:remux
# preview the storyboard in a browser:
node scripts/product-tour/render.mjs --preview
```

Writes:

- `public/media/product-tour.mp4` — 1280×720, 12 fps, H.264 CRF 28, AAC voiceover, `+faststart`
- `public/media/product-tour.poster.webp` — frame at 5.2s (URL typed)
- `public/media/product-tour.en-GB.vtt` — copied from `captions.en-GB.vtt`

Voiceover source (committed):

- `scripts/product-tour/vo/desmond.wav` — Higgsfield Seed Audio, voice **Desmond**, ~39.4s, claims-safe beats above (Visual Design Council + Positioning). Remux pads trailing silence to the 45s picture. Do not stretch speech. If the wav is replaced externally, run `npm run product-tour:remux`.

Soft size target is **≤~3 MB**. If remux exceeds **~5 MB**, drop AAC to 96k before shipping. Picture ceiling remains **~8–12 MB** (raise CRF 29–31 if a full re-render exceeds that). Do not add a scheduled GitHub Action for this.

## Site wiring

- Player: `src/components/ProductTour.tsx` — native `<video controls preload="none">`, no autoplay, not muted.
- Chrome: `.product-tour-card` in `globals.css` (paper, thin line, 12px, `accent-color` blue).
- Home: compact **45s product tour · pre-launch** text link under the hero CTAs only.
