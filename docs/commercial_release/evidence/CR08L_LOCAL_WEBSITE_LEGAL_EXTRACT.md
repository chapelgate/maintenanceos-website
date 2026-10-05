# CR-08L — Local Granite Website Legal-Source Draft

Status: **DRAFT INPUT COMPLETE — CR-08 must verify source directly**

## Runtime boundary

- Existing local model: `ibm/granite4:tiny-h-q2_K`
- Existing model store reused; no download/new local stack.
- One model at a time, bounded context, `keep_alive=0`.
- Broad 100-line prompt produced poor output and was rejected.
- Two tiny exact-source passes were used instead.
- Unsupported model statements are excluded below.

## Source-verifiable footer extraction

From `chapelgate/maintenanceos-website/src/components/SiteFooter.tsx`:
- The site displays **MaintenanceOS by Chapelgate**.
- The site says **Pre-launch — not commercially generally available**.
- Legal navigation links are marked **(draft)**.
- The source does **not** show a company number, registered office, jurisdiction of registration or a fully identified contracting legal entity.
- The local model incorrectly described `footerNav` as a company field in one pass; that statement is **REJECTED**.

## Exact OWNER/COUNSEL placeholders supplied to the local model and verified from source

### `src/app/privacy/page.tsx`
- controller identity / legal entity / registered address / ICO registration if applicable;
- lawful-basis mapping by purpose;
- international-transfer mechanisms;
- retention periods by category;
- rights wording;
- rights-request inbox/process;
- age threshold;
- update/version practice;
- privacy contact email.

### `src/app/cookies/page.tsx`
- essential-cookie inventory when known;
- preference-cookie inventory or explicit none-currently decision;
- version/date practice.

### `src/app/terms/page.tsx`
- operator/controller identity;
- site-content/marks/branding ownership/licence wording;
- UK consumer/B2B fit;
- liability caps/exclusions;
- optional clause decision;
- update/effect practice;
- governing law/courts;
- operator contact details.

## Quality rule

The model output is only a draft indexing aid. CR-08 must read the canonical website source and may not promote any local-model statement that is not directly supported by an exact source path/line.
