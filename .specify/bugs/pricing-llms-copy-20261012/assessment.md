# Assessment: pricing repeats a price claim, and llms.txt points at #demo

- `/pricing` said "invented list prices" in the request card and twice in the exclusion list, so the rendered page repeated the phrase.
- `public/llms.txt` linked early access to `/demo/#demo`. The rendered file must not contain `#demo`.
- The OpenCode pull requests left an empty spec file, broke the pricing array indent, and left a blank line where a contact bullet was removed.

Verdict: verified against the current pricing page and llms.txt before the fix.
