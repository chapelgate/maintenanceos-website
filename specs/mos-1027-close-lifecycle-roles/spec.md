# mos-1027-close-lifecycle-roles

## Goal
`operations.close_work_order` authorises through `_authorised_user(..., LIFECYCLE_ROLES)` like cancel/reopen/no-show, instead of any active same-client user.

## Acceptance
- close_work_order source uses `_authorised_user` and `LIFECYCLE_ROLES`
- unauthorised role returns False without transition/audit
- authorised lifecycle role still closes

## Out of scope
Voice, deploy, identity.py, live personal data, commercial runtime flags.
