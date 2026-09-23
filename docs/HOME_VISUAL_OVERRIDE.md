# Home visual override — RelicVault-like warmth (2026-09-23)

Local (owner) asked for moving parts, real-life pictures, people on phones, less clinical SaaS. Atmosphere is borrowed from [relicvault.app](https://relicvault.app). Brand, copy, logo, constellation sky, and assets were **not** copied.

Visual Design Council soft-cleared a 2026-09-23 delta: drop the luxury terrace still (no replacement stock in that slot), grow the morphing orb to that 4:3 photo footprint on paper, and keep a restrained glow on key section bands only.

## What we adopted

- Light paper stays `#F8FAFC`; warmth is photographic, not a recolour
- Hero visual: paper stage; the morphing blue orb fills the old 4:3 photo footprint. Soft `#DBEAFE` / `#3B82F6` cloud wash behind the orb only — no terrace still, no replacement stock in that slot
- Lifestyle strip under the H1: person on a phone + tradesperson (labelled stock, not customers)
- Cinematic street band of pale gabled houses (operational UK stock, not the terrace)
- CSS-only band accents (`IntakeOrbAccent`) on key home sections and how-it-works / features / industries / pricing headers — not a second logo, not on every card, not on `/create`
- CSS motion (slow photo ken-burns + existing orb morph), gated on `prefers-reduced-motion`
- Labelled UNDER TEST `ProductUiShell` **below** the hero as honesty proof
- Create / Join stay louder than the orb, photos, and motion

## What we deliberately did not copy

- RelicVault wordmark, “Know what you’ve found” copy, or mentor voice
- Constellation / night-sky hero and collector vault IP
- Award badges, App Store chrome, or their UI kit
- Any image, video, or illustration from relicvault.app

## Stock sources (self-hosted)

See `public/media/home/SOURCES.md`. CSP remains `img-src 'self' data:` — no Unsplash/Pexels hotlink. `uk-terrace.webp` was removed after local review.

## Reduced motion

Under `prefers-reduced-motion: reduce`:

- Orb idle morph / halo / sheen is off; panel open/close is instant
- Decorative band accents freeze (no morph)
- Header menu fade is instant
- Home photo ken-burns is off (`animation: none`, `transform: none`)
- `/create` stays orb-free. Other funnel pages inherit tokens only unless a header accent is opted in

## Conversion and honesty (unchanged)

Create from website is primary; Request early access / Join launch list stay secondary. UNDER TEST / pre-launch labels remain. No fake metrics, £ prices, live phone numbers, peer “beats”, or invented testimonials. Eight UK industries stay equal-weight. The orb is a listening cue — not “call the AI”.
