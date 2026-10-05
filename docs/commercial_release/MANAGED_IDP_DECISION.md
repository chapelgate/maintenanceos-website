# CR-13B0 — Managed IdP Decision

Date: 2026-10-05  
Worker: NVIDIA identity-selection lane  
Evidence runs: `37386753145` (final usable reasoning), with current official provider facts supplied by the release council.

## Decision

**Primary: Auth0 Essentials for the UK design-partner release.**

Reason: among the reviewed managed options it gives the clearest small-B2B fit with the fewest new moving parts: managed identity, Organizations, MFA, per-Organization RBAC, OIDC/JWT, and a path to enterprise SSO without MaintenanceOS becoming an identity platform.

Current official Auth0 pricing evidence supplied to the worker: Essentials is $35/month for up to 500 MAU and adds Pro MFA, RBAC per Organization, 10 Organizations and separate production/development environments.

**Fallback: Microsoft Entra External ID** if Chapelgate already has, or deliberately chooses, an Azure subscription and wants a Microsoft-first external-identity route. Current official evidence supplied to the worker: the core offer includes the first 50,000 MAU free, supports external customer/partner identities and MFA, but requires Azure subscription linkage.

Clerk was not selected because the supplied current free-tier evidence lacks MFA/enterprise SSO. Cognito was not selected because it adds more configuration surface for this small first release.

## Provider-neutral contract to preserve

The MaintenanceOS adapter must keep the provider-specific surface narrow and map Auth0/any future IdP into the existing `identity_contract.py` fields:

- issuer;
- audience;
- immutable subject;
- tenant / `Client.id` membership;
- role set;
- MFA/authentication assurance;
- issued-at and expiry;
- session/token correlation and revocation state;
- audit correlation context.

Unknown or missing identity, tenant, role, assurance or expiry information fails closed.

## Implementation boundary

- No local password login.
- No Auth0-specific logic in domain authorization.
- Reuse existing tenant guards, role maps and audit primitives.
- Provider configuration must come from environment/config, not source constants.
- One central identity adapter only.
- Machine/webhook/signed contractor-link paths remain unchanged.
- No deployment or customer data until the real Auth0 tenant/application/API values and MFA policy exist.

## Admin gate still required

Before production activation, an authorised human/admin must create or approve the Auth0 tenant/subscription and provide the real issuer/domain, API audience/client identifier, Organization/tenant mapping and MFA/role configuration through the approved secret/config path. No credential values belong in Git.
