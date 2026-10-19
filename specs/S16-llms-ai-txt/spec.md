# S16: Ensure llms.txt current; add /.well-known/ai.txt mirroring llms.txt

## Overview
Ensure the existing `public/llms.txt` is current and create `public/.well-known/ai.txt` that mirrors llms.txt for AI crawlers.

## Requirements
- Verify `public/llms.txt` content is accurate and up-to-date
- Create `public/.well-known/ai.txt` with identical content to llms.txt
- Both files accessible via HTTP at:
  - https://worksmartos.co.uk/llms.txt
  - https://worksmartos.co.uk/.well-known/ai.txt

## Acceptance Criteria
- `curl -f https://worksmartos.co.uk/.well-known/ai.txt` returns 200
- Content of `/.well-known/ai.txt` matches `llms.txt` exactly
- `curl -f https://worksmartos.co.uk/llms.txt` returns 200
- Build passes, link/sitemap checks pass

(End of file - total 16 lines)