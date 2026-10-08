# Chapelgate agent instructions

## Owner-mandated factory architecture
For AI project factory execution use **GitHub → NVIDIA model connection → project factory → spawned logical workers → results back to GitHub**. One factory and one canonical queue per project. Reuse existing processes. No separate GitHub Actions runners for factory workers, duplicate queues, extra servers or control planes. GitHub Actions can be used for independent CI/release duties, not factory orchestration. Only the owner can authorise an exception. This policy does not imply a factory is deployed or running. Preserve all existing project safety and release gates.
