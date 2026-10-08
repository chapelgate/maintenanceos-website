# Chapelgate agent instructions

## Owner-mandated factory architecture
For AI project factory execution use **GitHub → NVIDIA model connection → project factory → spawned logical workers → results back to GitHub**. One factory and one canonical queue per project. Reuse existing processes. No separate GitHub Actions runners for factory workers, duplicate queues, extra servers or control planes. GitHub Actions can be used for independent CI/release duties, not factory orchestration. Only the owner can authorise an exception. This policy does not imply a factory is deployed or running. Preserve all existing project safety and release gates.


## Owner prohibition: shared worker pool
For project-factory jobs, use only this project's existing GitHub → NVIDIA → project factory → logical AI workers execution path. **Do not dispatch, claim, or execute factory work on the shared worker pool, estate runner pool, or GitHub Actions self-hosted runners.** Existing GitHub Actions may be used solely for independent CI/release validation. Reuse the current authorised job and existing project factory; do not spawn infrastructure or create duplicate queues. A documented instruction is not proof of execution: record job ID, project factory identity, NVIDIA invocation evidence, start/end timestamps and completed output before reporting PASS. Owner alone may authorise an exception.
