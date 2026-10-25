# mw-03-price-placeholder

## Problem

Non-empty [ANDY:] price labels were treated as publishable tiers if NEXT_PUBLIC_PUBLIC_LAUNCH flipped true.

## Cause

getPricingConfig gated showTiers on priceLabel.trim().length > 0, so placeholders counted as real prices.

## Acceptance

- isPublishablePriceLabel rejects empty and [ANDY: prefixes.
- showTiers requires every published tier label to pass that check.
- No numeric prices invented.
- Named unit and script tests exit 0.
