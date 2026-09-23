# Home visual override — RelicVault-like warmth (2026-09-23)

Local (owner) asked for moving parts, real-life pictures, people on phones, less clinical SaaS. Atmosphere is borrowed from [relicvault.app](https://relicvault.app). Brand, copy, logo, constellation sky, and assets were **not** copied.

## What we adopted

- Warm linen paper (`#F3EEE4`) and cream surface instead of sterile slate chrome
- Photographic hero: UK brick houses + scaffolding, a person on a phone, a tradesperson at a wall box
- A cinematic street band of pale gabled houses
- CSS motion (slow photo ken-burns, soft shell float, existing orb morph)
- Secondary `SiriOrbCloud` listening cue on the home visual — Create stays primary

## What we deliberately did not copy

- RelicVault wordmark, “Know what you’ve found” copy, or mentor voice
- Constellation / night-sky hero and collector vault IP
- Award badges, App Store chrome, or their UI kit
- Any image, video, or illustration from relicvault.app

## Stock sources (self-hosted)

See `public/media/home/SOURCES.md`. CSP remains `img-src 'self' data:` — no Unsplash/Pexels hotlink.

## Reduced motion

Under `prefers-reduced-motion: reduce`:

- Orb idle morph / halo / sheen is off; panel open/close is instant
- Header menu fade is instant
- Home photo ken-burns and shell float are off (`animation: none`, `transform: none`)
- Funnel pages inherit the warmer tokens only — no orb, no new photography

## Conversion and honesty (unchanged)

Create from website is primary; Request early access / Join launch list stay secondary. UNDER TEST / pre-launch labels remain. No fake metrics, £ prices, live phone numbers, peer “beats”, or invented testimonials. Eight UK industries stay equal-weight.