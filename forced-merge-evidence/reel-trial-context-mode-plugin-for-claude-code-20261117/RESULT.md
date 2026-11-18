# Context Mode Plugin Trial - Result Summary

## Reel
Reel DfSSgfbDSBh - Context Mode plugin for Claude Code

## Status
WATCH - Context Mode plugin for Claude Code evaluated on estate compute

## License Verification
- Repo: https://github.com/mksglu/context-mode
- License: Elastic License 2.0 (ELv2) (source-available, not OSI open-source)
- NPM: context-mode@2.2.1, Elastic-2.0
- Node requirement: >= 24.15.0 (estate has v26.13.0 via nvm)
- Permits internal estate use; restricts offering as hosted/managed service

## Technical Findings
- Plugin runs on host user with user's files/environment
- Zero telemetry: all usage data stored locally in `~/.context-mode` SQLite DBs
- 4 documented network call types, all user/agent-initiated:
  1. ctx_index URL fetch (blocks private/link-local addresses)
  2. ctx_doctor git ls-remote (npm version check)
  3. `npm i -g context-mode` (upgrade command)
  4. Agent install command (npm or git)
- OpenCode integration: `opencode plugin add context-mode` works
- SQLite FTS5 search for indexed content retrieval
- Runs on Node 26.13.0 (satisfies >= 24.15.0 requirement)

## Council Verdict
WATCH - Plugin functional with verified security properties but source-available license (not OSI open-source). Network egress documented and user-controlled. Zero telemetry confirmed. Internal estate use permissible under ELv2 terms.

## Conditions
1. License compliance: monitor ELv2 terms for hosted service restrictions
2. Network egress monitoring: all 4 documented call types under user control
3. Data locality: all data stored in `~/.context-mode` per project (estate-compliant)
4. Weigh context reduction benefit against source-available license constraints

## Deliverables
- Context Mode plugin installed and operational on Node v26.13.0
- Security audit complete with file:line references
- Plugin functional for opencode integration