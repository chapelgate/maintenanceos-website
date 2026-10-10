# Assessment: canonical gemini_voice.py is behind the live voice host (issue #147)

Route: BUG. Canonical `main` (`d6103f8`) lacks behaviour that is running on the accepted live host. A deploy from `main` would therefore regress live calls.

Reproduced 10 Oct 2026 from a read-only snapshot of `/opt/maintenanceos/app` on droplet `601962983`, diffed against `main`:
- `main` has no no-response (stall) watchdog. It exists on live and in tag `maintenanceos-stalled-turn-hotfix-20260930` (`51da30f`), which is not an ancestor of `main`.
- The `main` silence default is 350 ms; live and `51da30f` use 600 ms.
- The live prompt has rules that are missing on `main`: one intake field per turn (steps 1 to 6), CALL STATE / NO-GUESS, PHONE ACCURACY and FAULT ACCURACY.

Scope (Goal Lock): `gemini_voice.py` only, plus tests and docs. The other 15 drifted files (see HUMAN_BLOCKERS.md, 2026-10-10) are out of scope and need separate reviewed slices. There are no deploy, env or secret changes.
