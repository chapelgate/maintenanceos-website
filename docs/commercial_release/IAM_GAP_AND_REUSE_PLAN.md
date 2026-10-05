# CR-05 IAM Gap And Reuse Plan

Scope: production individual identity for MaintenanceOS commercial release. This is a zero-code factual plan based on repository evidence only. It does not make external-law claims and does not mutate production.

## Evidence Legend

- IMPLEMENTED FACT: present in repository code or tests.
- DESIGN INTENT: documented or implied by existing release notes/runbooks, but not enforced as production individual IAM.
- GAP: required for production individual identity and not implemented in the repository evidence reviewed.
- UNKNOWN: cannot be proven from the repository.

## Current Controls Proven From Repository

### Tenant boundary

- IMPLEMENTED FACT: tenant data is modeled around `Client.id` and `client_id` foreign keys on users, properties, residents, contractors, work orders, approvals, deliveries, safety state, identities, call events, and invoices (`models.py:22`, `models.py:29`, `models.py:38`, `models.py:48`, `models.py:58`, `models.py:78`, `models.py:98`, `models.py:202`, `models.py:248`, `models.py:257`, `models.py:264`, `models.py:269`, `models.py:282`, `models.py:291`, `models.py:301`, `models.py:313`, `models.py:326`, `models.py:365`).
- IMPLEMENTED FACT: `tenant_security.require_client_resource()` rejects cross-client property, resident, contractor, and work-order access (`tenant_security.py:88`).
- IMPLEMENTED FACT: internal API calls are pinned to `INTERNAL_API_CLIENT_ID`, verify that the client exists, and require `internal_api_tenant_ready()` before setting `request.state.client_id` (`api.py:87`, `tenant_security.py:32`, `tenant_security.py:40`).
- IMPLEMENTED FACT: tests prove the internal API fails closed without token/config and accepts only a configured synthetic tenant (`tests/test_api_boundaries.py:46`), tenant-scoped idempotency (`tests/test_tenant_isolation_extended.py:75`, `tests/test_tenant_isolation_extended.py:90`), tenant-required model actions (`tests/test_tenant_isolation_extended.py:99`), tenant-filtered export/reporting (`tests/test_tenant_isolation_extended.py:130`, `tests/test_tenant_isolation_extended.py:142`), and rejection of same-tenant but unassigned contractor consequential records (`tests/test_tenant_isolation_extended.py:159`).

### Roles and operational authorization

- IMPLEMENTED FACT: the local `User` model has `client_id`, globally unique `email`, `password_hash`, string `role`, and `active` fields (`models.py:29`).
- IMPLEMENTED FACT: role maps exist for operational approvals in `APPROVAL_ROLES` and lifecycle actions in `LIFECYCLE_ROLES` (`operations.py:25`, `operations.py:37`).
- IMPLEMENTED FACT: `_authorised_user()` allows a user only when the user exists, is active, belongs to the approval client, and has an allowed role (`operations.py:79`).
- IMPLEMENTED FACT: safety clearance requires an active same-tenant user whose role is `admin` or `safety_manager`, a substantive reason, and writes `CRITICAL_SAFETY_CLEARED` audit evidence (`safety_controls.py:89`, `safety_controls.py:100`, `safety_controls.py:103`, `safety_controls.py:133`).
- IMPLEMENTED FACT: tests prove unauthorized/basic users and short reasons fail, while authorized managers/safety managers can perform the intended review steps (`tests/test_lifecycle_integrity.py:117`, `tests/test_lifecycle_integrity.py:208`, `tests/test_lifecycle_integrity.py:228`, `tests/test_lifecycle_integrity.py:271`).

### API authentication and portal links

- IMPLEMENTED FACT: the internal HTTP API uses one shared bearer secret from `INTERNAL_API_TOKEN`; it rejects weak/missing configuration and compares the presented `Authorization: Bearer ...` token with `hmac.compare_digest()` (`api.py:87`).
- IMPLEMENTED FACT: public provider ingress uses Twilio signature validation before voice and messaging handling (`api.py:328`, `api.py:365`, `webhook_security.py` referenced by `api.py` imports).
- IMPLEMENTED FACT: contractor portal actions use HMAC-signed, expiring links backed by `APP_SECRET` and `CONTRACTOR_LINK_TTL_SECONDS`; weak app secrets fail closed (`security.py:7`, `security.py:28`, `security.py:38`, `tests/test_security_stdlib.py:16`, `tests/test_security_stdlib.py:22`).
- GAP: no reviewed API dependency validates OIDC/SAML JWT claims, external identity subjects, per-user sessions, MFA/passkey assurance, or per-user role claims. `require_internal_api()` returns only a tenant `client_id`, not a user principal (`api.py:87`).

### Identity verification for residents/calls

- IMPLEMENTED FACT: phone and postcode normalization exist (`identity.py:1`) and `/identity/postcode` verifies a supplied postcode for a resident in the configured API tenant (`api.py:428`).
- IMPLEMENTED FACT: caller phone match is not treated as verified identity; unverified intake creates an `IDENTITY` hold instead of dispatch (`tests/test_api_boundaries.py:168`).
- GAP: this is resident/caller verification, not staff/customer user authentication.

### Service workload identity

- IMPLEMENTED FACT: MOS to USH has a renewable workload identity design using durable Ed25519 key material and short-lived bearer cache, with fail-closed renewal/revocation behavior (`ush_identity.py:1`, `ush_identity.py:117`, `ush_identity.py:171`, `ush_identity.py:230`, `ush_client.py:105`, `ush_client.py:135`).
- IMPLEMENTED FACT: tests cover non-persistence of one-hour issue tokens, expiry renewal, restart survival, revocation fail-closed, restrictive file permissions, single-flight refresh, and rejection of legacy permanent bearer unless explicitly allowed (`tests/test_ush_identity_lifecycle.py:293`, `tests/test_ush_identity_lifecycle.py:315`, `tests/test_ush_identity_lifecycle.py:336`, `tests/test_ush_identity_lifecycle.py:365`, `tests/test_ush_identity_lifecycle.py:415`, `tests/test_ush_identity_lifecycle.py:429`, `tests/test_ush_identity_lifecycle.py:463`).
- DESIGN INTENT: release docs call out SSO/MFA/session lifecycle as still needed (`PILOT_CHECKLIST.md:62`, `SECURITY_DEPLOYMENT.md:39`, `docs/commercial_release/MASTER_RELEASE_PROBLEMS.md:13`).
- GAP: USH workload identity is application-to-vault identity, not production individual user IAM.

### Audit context

- IMPLEMENTED FACT: domain audit is persisted in `AuditEvent` with `work_order_id`, `actor`, `event`, `detail`, and timestamp (`models.py:248`). `operations.audit()` writes these events (`operations.py:17`), and safety clearance records `actor=f"User:{user.id}"` (`safety_controls.py:133`).
- IMPLEMENTED FACT: structured operational logging redacts sensitive keys and values and only allows a narrow set of safe fields (`operational_logging.py:13`, `operational_logging.py:24`, `operational_logging.py:36`, `operational_logging.py:54`, `operational_logging.py:84`).
- GAP: audit actor context is local/free-form and does not yet include an external subject, IdP tenant, authentication method, MFA assurance, session id, token id, or request auth context.

## Production IAM Gap Matrix

| Requirement | Status | Repository evidence | Smallest reusable production route |
| --- | --- | --- | --- |
| External identity subject | GAP | `User` has `email` and local `password_hash`, but no external subject/issuer fields (`models.py:29`). `require_internal_api()` authenticates a shared token, not a user (`api.py:87`). | Use managed IdP OIDC/SAML/passkey/MFA. Map immutable `iss` + `sub` to local user/member record; avoid local passwords. |
| Tenant membership | IMPLEMENTED FACT plus GAP | Local `User.client_id` and `_authorised_user()` enforce same-tenant checks (`models.py:32`, `operations.py:79`). | Reuse `client_id` as tenant membership anchor; source membership from IdP groups/claims or SCIM-style provisioning into local membership rows. |
| Least-privilege roles | IMPLEMENTED FACT plus GAP | Role strings and approval role maps exist (`models.py:35`, `operations.py:25`). | Reuse `APPROVAL_ROLES` semantics; drive role assignment from IdP groups, with deny-by-default for unknown groups/roles. |
| MFA assurance signal | GAP | No `mfa`, `acr`, `amr`, passkey, or assurance enforcement found in API auth path. | Require IdP policies for MFA/passkey; gate sensitive routes on OIDC `acr`/`amr` or equivalent IdP session assurance. |
| Session lifecycle | GAP | No app session table/cookie lifecycle for users found. Contractor links expire, and USH service bearers refresh, but neither is user session management (`security.py:28`, `ush_identity.py:90`). | Prefer IdP-hosted session/cookie or gateway session with short app session TTL, idle timeout, and IdP logout/revocation checks. |
| Disabled/revoked users | PARTIAL IMPLEMENTED FACT | Local `User.active` is enforced by `_authorised_user()` and safety clearance (`operations.py:79`, `safety_controls.py:103`). | Keep `active` as local fail-closed override; sync disabled/deprovisioned IdP state into local active=false or deny at auth middleware. |
| Joiner/mover/leaver | GAP | No provisioning lifecycle or membership sync code found for people users. | Use IdP directory groups as source of truth; implement config-first provisioning/export before adding custom lifecycle code. |
| Per-user API authorization | GAP | Internal API uses shared `INTERNAL_API_TOKEN` and tenant env config (`api.py:87`); user id only appears in selected action payloads such as `actor_user_id` (`api.py:449`). | Put managed auth in front of API, validate claims centrally, attach `principal`, `client_id`, roles, and assurance to request context, then reuse `require_client_resource()` and role maps. |
| Audit context | PARTIAL IMPLEMENTED FACT plus GAP | `AuditEvent.actor` exists but is free-form (`models.py:248`, `operations.py:17`). | Extend audit context in a later implementation to include external subject/issuer/session/assurance while preserving existing audit events. |

## Explicit Non-Route: Local Password/Auth Service

Reject building a local password/auth service for CR-05. Repository evidence makes this unnecessary and risk-expanding:

- Local password hashing exists (`security.py:11`, `tests/test_security_stdlib.py:12`), but no production login/session flow was found.
- Existing release intent already identifies strong staff authentication, MFA/SSO, and session lifecycle as missing gates rather than implemented local auth (`SECURITY_DEPLOYMENT.md:39`, `PILOT_CHECKLIST.md:62`).
- Managed IdP OIDC/SAML/passkey/MFA can supply external subject, MFA assurance, revocation, session policy, and joiner/mover/leaver controls without storing user passwords in MaintenanceOS.

## Smallest Reusable Route To Production Individual Identity

1. Configuration first: select a managed IdP path that supports OIDC or SAML, enforced MFA/passkeys, group claims, session lifetime policy, and disabled-user revocation. Do not introduce local password login.
2. Tenant mapping: map IdP organization/group to existing `Client.id`; preserve `tenant_security.require_client_resource()` as the tenant-resource guard.
3. User mapping: map immutable external subject (`iss` + `sub`) to an existing or new local user/member representation. Keep local `User.active` as a fail-closed override and keep `email` as display/contact, not identity primary key.
4. Role mapping: map IdP groups to the existing role vocabulary already used by `APPROVAL_ROLES` and `LIFECYCLE_ROLES` (`operations.py:25`, `operations.py:37`).
5. Assurance policy: require IdP MFA/passkey assurance for all staff sessions, and require a stronger assurance claim for safety clearance, financial approval, tenant administration, and remote side-effect enablement.
6. Session lifecycle: use IdP/gateway managed session expiry, idle timeout, logout, and revocation; application sessions should be short-lived and revalidated against IdP/gateway state.
7. API authorization: replace shared-token-only user routes with central auth context that carries principal, tenant, roles, assurance, and session id. Continue to use `require_client_resource()` for object authorization and `_authorised_user()` semantics for role decisions.
8. Audit context: add external subject, issuer, tenant, local user id, role source, assurance, and session/request id to future audit records while preserving current `AuditEvent` behavior.

## Migration And Test Gates

No code is changed by this document. Before any future implementation is accepted:

- Inventory gate: prove every user-facing and staff/admin route is classified as public webhook, contractor signed link, internal machine API, or authenticated individual user route.
- Config gate: prove IdP tenant/app/client is configured with MFA/passkey policy, allowed callback/origin list, logout path, token/session lifetimes, and group claims.
- Mapping gate: prove each IdP group maps to exactly one allowed local role set, with unknown groups denied.
- Tenant gate: add tests proving a user from tenant A cannot read/write tenant B resources, reusing existing `require_client_resource()` patterns.
- Role gate: add tests for every sensitive operation showing viewer/basic denied, manager/admin/finance/dispatcher/safety_manager allowed only where `APPROVAL_ROLES` permits.
- Assurance gate: add tests proving sensitive routes deny sessions lacking required MFA/passkey assurance.
- Revocation gate: add tests proving disabled IdP user, removed group, disabled local `User.active`, and revoked session fail closed.
- Session gate: add tests for expired sessions, idle timeout, logout, replayed/invalid token, wrong issuer/audience, and clock-skew handling.
- Audit gate: add tests proving audit records include external subject, tenant, local user id, route/action, assurance, and request/session correlation without logging bearer tokens or secrets.
- Regression gate: keep existing tenant/security tests passing: `tests/test_api_boundaries.py`, `tests/test_tenant_isolation_extended.py`, `tests/test_lifecycle_integrity.py`, `tests/test_security_stdlib.py`, and `tests/test_ush_identity_lifecycle.py`.

## Zero-Code / Config-First Sequence

1. Freeze local-password scope: document that `security.hash_password()` remains legacy/test/internal only until a separate approved decision says otherwise.
2. Configure managed IdP application: OIDC/SAML with MFA/passkey policy, strict redirect/logout URLs, short session lifetimes, and group claims.
3. Define tenant and role claim contract: IdP group naming maps to `Client.id` membership and existing local roles; unknown claims deny by default.
4. Run repository route inventory: identify which endpoints remain provider webhooks/signed contractor links and which become individual-user routes.
5. Produce test plan and fixtures for issuer, subject, tenant, role, assurance, expiry, revocation, and audit context.
6. Only after gates 1-5 are complete, implement the smallest central auth adapter/middleware and keep domain authorization in existing tenant/resource/role helpers.

## Unknowns To Resolve Before Implementation

- UNKNOWN: chosen production IdP, tenant identifier format, group naming convention, and exact MFA/passkey assurance claim names.
- UNKNOWN: whether production should expose the existing FastAPI API directly, behind an auth gateway, or behind a platform-managed identity-aware proxy.
- UNKNOWN: whether local `User` should be migrated in place or supplemented with separate identity/membership tables.
- UNKNOWN: final session timeout and revocation polling/introspection strategy.
- UNKNOWN: whether contractor portal signed links remain link-only or later move to contractor IdP accounts.
