<path>/root/jobs-work/tasks/build-mos-20261025/work/mos-1025-nvidia-source-guard/specs/mos-1025-nvidia-source-guard/tasks.md</path>
<type>file</type>
<content>
1: - [x] Write spec/plan
2: - [x] Add tests/test_nvidia_source_guard.py
3: - [x] Run the three named tests

(End of file - total 3 lines)
</content>

<system-reminder>
Instructions from: /root/jobs-work/tasks/build-mos-20261025/work/mos-1025-nvidia-source-guard/AGENTS.md
# Chapelgate agent instructions

## Owner-mandated factory architecture
For AI project factory execution use **GitHub → NVIDIA model connection → project factory → spawned logical workers → results back to GitHub**. One factory and one canonical queue per project. Reuse existing processes. No separate GitHub Actions runners for factory workers, duplicate queues, extra servers or control planes. GitHub Actions can be used for independent CI/release duties, not factory orchestration. Only the owner can authorise an exception. This policy does not imply a factory is deployed or running. Preserve all existing project safety and release gates.


## Owner prohibition: shared worker pool
For project-factory jobs, use only this project's existing GitHub → NVIDIA → project factory → logical AI workers execution path. **Do not dispatch, claim, or execute factory work on the shared worker pool, estate runner pool, or GitHub Actions self-hosted runners.** Existing GitHub Actions may be used solely for independent CI/release validation. Reuse the current authorised job and existing project factory; do not spawn infrastructure or create duplicate queues. A documented instruction is not proof of execution: record job ID, project factory identity, NVIDIA invocation evidence, start/end timestamps and completed output before reporting PASS. Owner alone may authorise an exception.

</system-reminder>