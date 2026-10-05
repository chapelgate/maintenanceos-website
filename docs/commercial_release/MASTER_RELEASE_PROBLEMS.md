# MaintenanceOS — Commercial Release Master Problems

Created: 2026-10-05

Live execution state is held in the Chapelgate AI Control Room project `MaintenanceOS Commercial Release`. The stable task map is `docs/commercial_release/MASTER_RELEASE_REGISTER.md`.

| Problem | Severity | State | Owning task |
|---|---|---|---|
| LUMI candidate not yet frozen | Critical | Existing evaluation still running | CR-H01 |
| Existing live-host deployment authority unavailable | Critical | Human/admin gate | existing MOS blocker / #18 |
| Product-name clearance not completed | Critical | Research available; professional decision later | CR-01 / CR-H02 |
| Production retention/deletion/legal-hold workflow incomplete | Critical | Work available | CR-03 / CR-06 / CR-11 / CR-13 |
| Production user identity/MFA/RBAC/session controls incomplete | Critical | Work available | CR-05 / CR-12 / CR-13 |
| Social-housing statutory timing controls not yet explicitly proven | Critical for that market | Work available | CR-04 / CR-10 / CR-13 |
| DPIA/data-flow/legal treatment not professionally signed off | Critical | Fact work available | CR-03 / CR-H03 |
| Provider commercial/data-processing permissions not consolidated | Critical | Work available | CR-02 |
| Independent security acceptance not yet completed on integrated candidate | Critical | Held until candidate ready | CR-15 / CR-H04 |
| Website legal-source closure incomplete | High | Work available | CR-08 |
| Production observability/incident evidence incomplete | High | Work available | CR-09 |
| Frozen-candidate supply-chain/licence evidence incomplete | High | Work available | CR-07 |
| Customer trust pack incomplete | High | Held on evidence inputs | CR-14 / CR-H03 |
| UK design-partner pilot not yet completed | Critical before GA | Held | CR-16 |
| Final evidence audit/launch decision not completed | Critical before GA | Held | CR-17 / CR-H05 |

## Duplication removed

- Control Room #681 is superseded by #676 plus the commercial-release register.
- Control Room #687 is superseded by #685 plus the commercial-release register.
- Existing SCA/SBOM tooling is reused; no second scanner/SBOM pipeline is authorised.
- Existing Control Room allocator is reused; no second queue/dispatcher is authorised.
