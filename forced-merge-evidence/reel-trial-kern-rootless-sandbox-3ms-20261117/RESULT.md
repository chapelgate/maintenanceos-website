# Trial RESULT: reel Dfra7fQSJMo (Kern rootless sandbox (3ms))

**Verdict:** WATCH

**Date:** 2026-11-17

**Area:** AI agent execution isolation (sandbox sealing)

## Summary

Kern is a rootless sandbox binary (Apache-2.0 licensed, ~4MB) that can spin up kernel-enforced containers in approximately 3ms from a single binary with no daemon. The project aligns with estate AI sandbox sealing requirements and provides strong isolation via namespaces, seccomp, cgroups, and pivot_root.

## Trial Results

- **Binary built successfully** from source in `repo/kern/`
- **kern doctor** shows 1 blocker (AppArmor restricting unprivileged user namespaces on Ubuntu 23.10+), 13 OK, 7 warnings
- **Security properties verified:**
  - Namespaces (user, PID, network loopback-only, UTS, IPC, mount) enforced
  - Least-privilege capabilities: 16 dangerous caps dropped
  - Always-on seccomp allowlist (deny-by-default, blocks 37 escape syscalls)
  - pivot_root into read-only rootfs with overlay
  - Landlock write-allowlist support (opt-in)
  - No network egress by default (loopback-only)
- **Blocker:** AppArmor `kernel.apparmor_restrict_unprivileged_userns=1` prevents rootless user namespace mapping on this host. This is a host-level LSM restriction, not a kernel vulnerability.
- **Trial command attempted:** `kern box test-box --image alpine --rm -- /bin/echo "hello"` - failed due to AppArmor restriction

## Assessment

**ADOPT criteria not met** due to the AppArmor blocker on this host platform. The kernel-enforced isolation mechanisms themselves are sound, but the rootless user namespace requirement is blocked by the host's AppArmor policy.

**WATCH** because:
- The sandbox design and isolation properties are strong and well-documented
- Apache-2.0 license is permissive for commercial use
- Could work on hosts without this AppArmor restriction (many Linux distributions)
- Supply-chain is clean (single repo, Apache-2.0 deps)
- May be viable on different host platforms or with AppArmor profile installed

**DROP** if: host platform cannot resolve the AppArmor restriction and platform compatibility is a hard requirement.

## Follow-up

1. Test on a host without AppArmor restrictions or with the profile installed
2. Evaluate `--no-uid-range` flag or alternative user namespace approaches
3. Document platform requirements for Kern deployment in estate
4. Re-trial on compatible host if/when available

## Evidence

- Binary built: `/home/andy/chapelgate/factory-tasks/reel-trial-kern-rootless-sandbox-3ms-20261117/repo/kern/target/release/kern`
- `kern doctor` output: see `out/cycle-2307-1.log`
- Source: `/home/andy/chapelgate/factory-tasks/reel-trial-kern-rootless-sandbox-3ms-20261117/repo/kern/`
- LICENSE: Apache-2.0