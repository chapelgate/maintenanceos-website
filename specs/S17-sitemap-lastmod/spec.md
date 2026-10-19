# S17: Sitemap lastmod + robots.txt AI allowances

## Summary
Add `<lastmod>` to all sitemap URLs (from git/file mtime) and verify robots.txt AI bot allowances.

## Requirements
- Sitemap must include `lastmod` for all 28 URLs
- robots.txt must allow GPTBot, ChatGPT-User, OAI-SearchBot, Google-Extended, anthropic-ai, ClaudeBot, PerplexityBot, Bytespider, CCBot
- Sitemap must include /vulnerability-disclosure/ and /subprocessors/ (added in S9, S11)

## Acceptance Criteria
- `curl https://worksmartos.co.uk/sitemap.xml | grep -c 'lastmod'` = 28
- robots.txt contains allow rules for all required AI bots
- Build passes with TypeScript and lint clean