# Mailflare Self-Hosted Google Workspace Alt Trial Result - Df2nfTWPEk8

**Date**: 18 Nov 2026 GMT
**Reel**: andy-video-instagram-Df2nfTWPEk8
**Area**: Estate email/calendar/drive, Cloudflare Workers, MCP eval
**Verdict**: WATCH

## Summary of trial

Mailflare is a legitimate, actively maintained open-source project (AGPL-3.0 license, 7k stars, 1.2k forks, 551 commits) that serves as a self-hosted Google Workspace alternative. It includes email, calendar, drive, booking, and built-in AI agents with MCP integration.

The trial was report-only / sandboxed: no live install or deployment was attempted. Research was conducted from the official GitHub repository `https://github.com/hieunc229/mailflare` and its documentation.

## Verification evidence (all from official Mailflare/hieunc229/mailflare GitHub repo)

| Criterion | Result | Evidence |
|-----------|--------|----------|
| Legitimate open-source project | PASS | AGPL-3.0 license; 7k stars; 1.2k forks; 551 commits; active maintenance |
| Cloudflare Workers compatible | PASS | Designed for Cloudflare Workers; `wrangler.jsonc` config; "Deploy to Cloudflare" button |
| MCP integration support | PASS | Full MCP support: `list_emails`, `get_email`, `search_events`, `get_calendars`, `create_event`, `update_draft`, `request_send`, calendar MCP tools; Streamable HTTP MCP endpoint |
| AI agent support | PASS | Cloudflare Workers AI and OpenAI-compatible providers; multiple model configuration; assistant chat with draft review |
| Email/Calendar/Drive features | PASS | Email with custom domains, Calendar with repeating events/tz, Drive file storage, Booking sharing links |
| Database options | PASS | D1, PostgreSQL, MySQL, Turso/libSQL; SQLite for Docker self-hosting |
| File storage options | PASS | Cloudflare R2, Backblaze B2, AWS S3 |
| 34 languages including RTL | PASS | Full language support including Arabic, Hebrew |
| License compatibility | WATCH | AGPL-3.0 copyleft; requires review for estate product integration |
| No hidden network egress | WATCH | Email sending via external providers (Resend/Amazon SES optional); Cloudflare Email Routing is free and internal |
| Security posture | WATCH | Audit logs, database migrations across 3 dialects, backup/restore, but AGPL copyleft terms |

## Architecture fit for estate

Mailflare maps well to estate email/calendar/drive requirements:
- **Email**: Custom domain mailboxes with Cloudflare Email Routing (free, no external egress) or Resend/Amazon SES
- **Calendar**: Repeating events with time zones, attendee email invitations
- **Drive**: File storage and sharing via R2/B2/S3
- **AI agents**: MCP enables integration with estate AI clients for mail search, draft replies, event management
- **Deployment**: Cloudflare Workers (free tier available) or Docker self-hosting

However, the AGPL-3.0 license requires source sharing of modifications for distributed deployments, which needs review for estate product integration. MCP key management and external provider configuration (Resend/Amazon SES) also need proper handling.

## Considerations / risks (recorded, not blockers)

- AGPL-3.0 copyleft license - requires source sharing of modifications; needs legal review for estate product use
- Email sending requires external provider (Resend free tier: 3,000/month, or Amazon SES with sandbox lift)
- MCP key access grants mailbox permissions; needs key ownership and permission policies
- Calendar writes save immediately; no invitation/cancellation sending from MCP
- 90-day limit on schedule/availability ranges
- Database migration complexity across 3 dialects (SQLite/D1, PostgreSQL, MySQL)

## Recommended adoption path (estate, smallest change first)

1. **Research AGPL-3.0 license compatibility** with estate product requirements before any code integration
2. **Deploy Mailflare on Cloudflare Workers** in a sandbox account (free tier); verify email via Cloudflare Email Routing (no cost, no external egress)
3. **Configure MCP key** for estate AI clients with permitted mailboxes only; test `list_emails`, `search_events`, `create_event` tools
4. **Set up file storage** with Cloudflare R2 (available in estate account) or local SQLite for Docker self-hosting
5. **Assess calendar integration** with estate scheduling needs (90-day range limit)
6. **If all checks pass, adopt** Mailflare as estate email/calendar/drive alternative with MCP-augmented AI agents

## Full Shakedown / PentAGI additions proposed

- Add Mailflare AGPL-3.0 license review to Full Shakedown checklist
- Add Mailflare MCP key management and external provider config to PentAGI checklist
- Add "Mailflare: AGPL-3.0 license compatibility verification" to security gate
- Add "Mailflare: MCP key permission policies; no unbounded external egress" to security gate

## Evidence

- Repository research: /home/andy/chapelgate/factory-tasks/reel-trial-mailflare-self-hosted-google-workspace-alt-with-20261118/out/PROGRESS.md
- Mailflare docs: https://github.com/hieunc229/mailflare/tree/main/docs
- MCP docs: /home/andy/chapelgate/factory-tasks/reel-trial-mailflare-self-hosted-google-workspace-alt-with-20261118/out/PROGRESS.md
- REEL-DECISIONS.md row: /home/andy/chapelgate/jobs-work-dell/readiness/reel-review/REEL-DECISIONS.md (line 278, verdict TRIAL -> now resolved WATCH)
- FOLLOW-UPS.md: /home/andy/chapelgate/jobs-work-dell/readiness/reel-review/FOLLOW-UPS.md

## Result

**Verdict**: WATCH

Mailflare is a technically capable self-hosted Google Workspace alternative with full MCP integration for AI agents. The AGPL-3.0 license requires review before estate product integration, and email sending requires external provider configuration. These are manageable blockers, not show-starters. Recommend monitoring for license change to a more permissive terms, or proceeding with license review for internal estate use.

**Next steps**:
1. Council reviews AGPL-3.0 license compatibility for estate use
2. If approved, deploy Mailflare in Cloudflare sandbox account
3. Configure MCP keys for estate AI clients
4. Re-trial in 30 days to verify deployment and license compliance