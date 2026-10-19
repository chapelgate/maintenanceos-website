# S25 Implementation Plan

## Approach
Create a reusable CaseStudyCard component that follows the existing component patterns (BentoCard, FaqAccordion) and brand system. The component will be a framework — Andy provides the actual case study content as MDX files in `src/content/case-studies/`.

## Steps

1. **Create CaseStudyCard component** (`src/components/CaseStudyCard.tsx`)
   - Accept props: logo (src, alt), quote, attribution (name, role, company), optional CTA link (href, label)
   - Use brand tokens: paper/surface, accent, ink, muted
   - Follow BRAND_SYSTEM.md: light paper canvas, blue accent for CTA, flat ink wordmark
   - Accessible: semantic `<article>`, proper heading hierarchy, alt text for logos, focus-visible rings

2. **Create component tests** (`src/components/CaseStudyCard.test.tsx`)
   - Test rendering with all props
   - Test rendering with minimal props (no CTA link)
   - Test accessibility attributes
   - Test logo alt text handling

3. **Create content directory** (`src/content/case-studies/`)
   - Empty directory for Andy to populate with MDX files
   - Add placeholder README explaining the format

4. **Verify build and quality gates**
   - `npm run build` passes
   - `npx tsc --noEmit` passes
   - `npm run lint` passes (0 errors)
   - `npm test` passes (pre-existing failures only)

## Component API

```tsx
type CaseStudyCardProps = {
  logo: { src: string; alt: string };
  quote: string;
  attribution: { name: string; role: string; company: string };
  cta?: { href: string; label: string };
  className?: string;
};
```

## Design Reference
- BentoCard pattern for card layout (surface, border, padding, hover state)
- BRAND_SYSTEM.md tokens for colors
- UI_VISUAL_SYSTEM.md for surface/border/radius patterns