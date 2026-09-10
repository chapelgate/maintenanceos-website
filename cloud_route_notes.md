# Cloud Route Notes

No existing DigitalOcean droplet is available, so no paid cloud resource was created.
Current execution strategy: keep host work lightweight, use local evidence runners only, and prepare the project for later isolated cloud staging.
Top problem 1: stale/incorrect local verification tooling obscures a build that otherwise passes 243 tests.
Top problem 2: there is no isolated external staging environment yet; provider/voice validation therefore cannot be completed safely.
