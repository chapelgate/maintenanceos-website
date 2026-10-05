# Assessment

Cloud CI on main stopped at the repository runner-policy check before tests.

Verified causes:
- instinct-phone-preflight.yml used forbidden GitHub-hosted `ubuntu-latest`.
- instinct-worker-phone-proof.yml used forbidden GitHub-hosted `ubuntu-latest`.
- instinct-phone-local-secret-probe.yml targeted an unregistered Windows runner and violated the required trusted-runner labels.
- the phone preflight YAML also had a malformed Python heredoc, so GitHub parsed it as an invalid workflow path rather than by its declared name.

No benchmark/product test failed.
