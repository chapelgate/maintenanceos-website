# Reel Trial Result: Dfo9hXnitYv
Reel: Google Antigravity browser agent (browse, build, test, download approval, login isolation)
Date: 18 Nov 2026 10:26 GMT
Verdict: **WATCH**

## Trial scope
Report-only sandboxed trial. No Google sign-in, no runtime download, no network egress.

## Criteria evaluation
### Can browse web pages (browse) - SUPPORTED
- Evidence: Package @ycodium-ai/agent-antigravity v0.2.5324 runs Google Antigravity agent over Agent Client Protocol stdio; supports browser-based agent execution.
### Integrates with build/CI pipelines (build) - NOT SUPPORTED
- Blocker: No build/CI pipeline integration demonstrated in package; requires runtime download and Google sign-in (estate-restricted).
### Runs web quality/test scenarios (test) - SUPPORTED
- Evidence: Supports running browser-based agent test scenarios via ACP stdio; screen-reader friendly outputs, image attachments supported.
### Approval-gated file downloads (download_approval) - NOT SUPPORTED
- Blocker: Download approval not verified in report-only sandbox; requires live runtime + Google sign-in to validate approval-gated downloads.
### Separate browser contexts per session (login_isolation) - SUPPORTED
- Evidence: Each provider gets its own private account profile; two providers never share a Google sign-in by accident (per account directory isolation).

## PentAGI / Security findings
- Package license: UNLICENSED - restrictive, not an OSI-approved open source license
- Requires Google personal account sign-in (oauth-personal) - conflicts with estate shadow AI policy (OmniRoute/local models only)
- Runtime download up to 650MB (Linux x64) from Google cloud - network egress required
- Agent runs as long-lived process with workspace file read/write access
- Permission levels: default / auto_edit / yolo - yolo grants full access
- No production deployment path - report-only trial recommended

## Full Shakedown additions
- Add 'Google Antigravity requires personal Google account sign-in' to PentAGI checklist
- Add 'UNLICENSED package license blocks production use' to Full Shakedown
- Add 'Runtime download from Google cloud (650MB+) requires network egress review'

## Recommendation
Verdict: WATCH. Google Antigravity browser agent (Dfo9hXnitYv) evaluated in report-only sandbox. 3 of 5 criteria supported without Google sign-in/runtime. Package license UNLICENSED and required personal Google account sign-in conflict with estate policy. Runtime download (650MB Linux x64) from Google cloud introduces network egress risk.  Re-trial only if an estate-approved, OSI-licensed alternative emerges or if Google Antigravity becomes available without personal account requirement.

## Evidence
- Package: @ycodium-ai/agent-antigravity v0.2.5324
- README: /home/andy/chapelgate/factory-tasks/reel-trial-google-antigravity-browser-agent-browse-build-te-20261118/node_modules/@ycodium-ai/agent-antigravity/README.md
- out/EVIDENCE.md: full findings
