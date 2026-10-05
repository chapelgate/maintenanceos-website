# EuroHPC / LUMI human blockers

Only genuine owner/identity/account actions belong here.

## Current verified state

- Existing MyAccessID Guest IdP is active.
- LUMI project access is proven for `project_465003507`.
- `small-g` and `standard-g` access is proven.
- Corrected AI smoke job 22563389 proved PyTorch 2.10.0+rocm7.0 can see one AMD Instinct MI250X.
- No account-attachment or entitlement blocker remains.

## Current owner action

LUMI/EuroHPC account-use rules require the award holder to perform authenticated LUMI actions personally rather than allowing a remote cloud agent to operate the account.

After PR #129 is validated/merged, the next owner action is one command in the authenticated LUMI shell:

```bash
scripts/lumi_launch_first_preflight.sh
```

That command stages the first open model without GPU allocation if needed, then submits the bounded one-GCD / 30-minute compatibility preflight.

If the EFP Interactive session has expired, the owner must complete MyAccessID/MFA again before running it.

## Not human blockers

- Corpus design, validation, scoring, model selection logic, result analysis and repository changes are autonomous engineering work.
- Failed models or failed benchmark cases are not owner blockers; they are handled by the tournament/repair rules.
- GPU budget decisions are governed by the frozen experiment policy and do not require manual approval per job unless EuroHPC itself presents a consequential declaration.
