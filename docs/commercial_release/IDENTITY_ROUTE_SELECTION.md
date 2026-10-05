# CR-13B1 — Existing Managed Identity Route Decision

Date: 2026-10-05  
Worker evidence: NVIDIA two-model one-shot review, run `37386188208`  
Models: `openai/gpt-oss-20b`, `nvidia/nemotron-3-super-120b-a12b`

## Verdict

**BLOCKED for reuse of an existing managed IdP.**

Both independent NVIDIA models reached the same conclusion from the verified CR-05 evidence: no already-configured/paid/connected managed identity provider for individual MaintenanceOS users is proven in the current estate/source.

This is not permission to build a local password/auth service. The Chapelgate zero-code/config-first rule remains authoritative.

## Proven reusable controls

MaintenanceOS already has:
- tenant/client membership anchors;
- local active-user state;
- role vocabulary and authorization maps;
- tenant-resource enforcement;
- a provider-neutral isolated identity contract;
- audit primitives.

Those controls should be reused behind a managed external identity provider.

## Provider-neutral minimum claim contract

A selected IdP/gateway must be mappable into:
- issuer (`iss`);
- intended audience (`aud`);
- immutable external subject (`sub`);
- MaintenanceOS tenant/client membership;
- roles;
- MFA/authentication assurance (`acr`/`amr` or provider equivalent);
- issued-at and expiry;
- session/token identifier or equivalent revocation correlation;
- audit correlation context.

Unknown or missing tenant, role, assurance, expiry or subject data must fail closed.

## Exact unblock requirement

A separate evidence-based selection must choose and prove one managed identity route and record:
1. the actual Chapelgate account/tenant to be used;
2. issuer and audience/client identifier;
3. tenant/group-to-`Client.id` mapping;
4. group/role mapping;
5. MFA/assurance claim semantics;
6. token/session expiry and revocation mechanism;
7. redirect/origin/logout boundaries if applicable.

No implementation should start until those facts are known.

## Minimality check

- No new auth service.
- No local password login.
- No new database/queue/router/scheduler.
- Reuse `identity_contract.py`, existing tenant guards, roles and audit.
- Configuration before code; smallest adapter only after provider selection.
