# Plan

1. Add `.gitattributes` and pass `SCANNER_V2_RELEASE_SHA` from `run.sh`. Keep the deploy runbook in step with the script.
2. Classify zero-fetch 401/403 in both the persistent scanner and the direct scan as `blocked_by_site`. Leave partial crawls that did fetch pages unchanged.
3. Map that outcome in `/create` to its own ready state, with the host-allow line and a draft the visitor can still type.
4. Record that this repo has no DigitalOcean app spec. Put the `website/voice` secret env snippet in the pull request, with no secret values.
