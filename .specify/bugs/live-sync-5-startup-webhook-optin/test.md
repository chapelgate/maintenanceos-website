# Test
New tests in tests/test_provider_webhooks.py:
- off by default even when live-ready (carrier updater must not be called)
- off with ingress not ready still exits 0
- the flag accepts only explicit true
- opt-in plus ready mutates
- opt-in plus not ready still fails closed
The existing closed-mode CLI test now opts in explicitly.
Verified: tests/test_provider_webhooks.py 15 passed. Full suite on Linux box (Python 3.13): 587 passed, 0 failed; test file also passes in isolation on a fresh checkout (render_prepare DB side effect stubbed). Nemotron 3 Super review: NON-BLOCKING, no blockers.
