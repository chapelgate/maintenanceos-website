# CR-07 Resolved Package Evidence

## Goal
Retain the exact resolved Python package/version set from the same Security CI environment that generates the vulnerability audit and SBOM.

## Acceptance
- existing pip-audit behavior unchanged;
- existing CycloneDX generation unchanged;
- a deterministic sorted `pip freeze --all` file is generated only when the dependency audit runs;
- the resolved package file is uploaded inside the existing security-evidence artifact;
- no second scanner, workflow, service, dependency resolver, registry or deployment path is added;
- vulnerability failures still fail the job exactly as before.

## Safety boundary
This is CI evidence only. It does not change MaintenanceOS runtime, phone routing, voice, infrastructure, credentials or product dependencies.