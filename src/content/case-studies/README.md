# Case Studies Content Directory

This directory holds MDX files for real customer case studies. **Andy provides all content** — no invented claims, metrics, or testimonials.

## Format

Each case study is an `.mdx` file with frontmatter matching the `CaseStudyCardProps` interface:

```mdx
---
logo:
  src: "/media/case-studies/acme-logo.svg"
  alt: "Acme Corp logo"
quote: "This product transformed our workflow."
attribution:
  name: "Jane Doe"
  role: "Operations Director"
  company: "Acme Corp"
cta:
  href: "/case-studies/acme"
  label: "Read full story"
---

Optional long-form content can go here for a dedicated case study page.
```

## Guidelines

- **Real only**: Every case study must be a genuine design partner with consent
- **No invented claims**: No fabricated metrics, percentages, or outcomes
- **Claims-safe**: All content must pass the claims register (PRODUCT_CLAIMS_REGISTER.md)
- **Logo assets**: Place logo files in `public/media/case-studies/`
- **Alt text**: Must describe the company/logo, not be generic

## Adding a Case Study

1. Add logo to `public/media/case-studies/<slug>-logo.svg`
2. Create `<slug>.mdx` in this directory with frontmatter above
3. Component will be used on `/trust/` page and other marketing surfaces

## Component Usage

```tsx
import { CaseStudyCard } from "@/components/CaseStudyCard";
import { getCaseStudies } from "@/lib/case-studies"; // to be created when content exists

// In a page component:
<CaseStudyCard
  logo={frontmatter.logo}
  quote={frontmatter.quote}
  attribution={frontmatter.attribution}
  cta={frontmatter.cta}
/>
```