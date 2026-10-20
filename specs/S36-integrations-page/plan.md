# S36 Implementation Plan

## Overview
Create the `/integrations/` page with 6 OAuth provider cards and supporting API routes for OAuth callbacks. Follow the existing patterns from S35 (help centre) and S28 (enquiry API).

## Phase 1: Core Library & Types
1. Create `src/lib/integrations.ts` with:
   - `IntegrationProvider` type (google, outlook, calcom, calendly, zapier, hubspot)
   - Provider configs: name, logo, description, scopes, authUrl, tokenUrl, status
   - Helper functions: getProviderConfig, getAllProviders, generateAuthUrl
2. Create `src/lib/integration-tokens.ts` with:
   - Encrypt/decrypt functions using Web Crypto API (AES-GCM)
   - Token storage interface (to be implemented with DO Functions KV or database)
   - Type definitions for stored tokens

## Phase 2: API Routes
1. Create `src/app/api/integrations/[provider]/callback/route.ts`:
   - Handle OAuth callback for each provider
   - Exchange code for tokens
   - Encrypt and store tokens
   - Redirect to integrations page with success/error

## Phase 3: UI Pages
1. Create `src/app/integrations/page.tsx`:
   - PageHero with title/description
   - Grid of 6 provider cards
   - Each card: logo, name, description, status badge, connect button
   - JSON-LD structured data (WebPage + BreadcrumbList)
   - contentPageMetadata for SEO
2. Create `src/app/integrations/[provider]/page.tsx`:
   - Dynamic route for provider detail
   - Show provider-specific info, setup steps, connected status
   - "Connect" button initiates OAuth flow

## Phase 4: Configuration & Navigation
1. Update `src/config/routes.ts` to add integrations route
2. Update `src/app/sitemap.ts` to include `/integrations/`
3. Update `src/config/site.ts` footerNav to add Integrations link

## Phase 5: Tests
1. Create `src/lib/integrations.test.ts` with tests for:
   - Provider configs loaded correctly
   - Auth URL generation
   - Token encryption/decryption roundtrip
2. Add tests for page rendering (if applicable)

## Phase 6: Verification
1. Run `npm ci`, `npx tsc --noEmit`, `npm run lint`, `npm test`, `npm run build`
2. All must pass before pushing