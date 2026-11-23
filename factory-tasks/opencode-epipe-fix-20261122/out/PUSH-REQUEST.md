# PUSH-REQUEST.md

The fix is committed on `fix/opencode-epipe-guard` at
`25bc03d2db3cf1e4810fab08369b64eb1f33ec87` and merged locally by the council-recorded path.

No push was performed: this working tree's `origin` remote is
`https://github.com/chapelgate/maintenanceos-website.git` and `mw-repo` points at a
maintenanceos task clone — neither is the estate runner/opencode home, so pushing these
runner fix commits there would be wrong and could pollute an unrelated product.

Request to dr eggbot (relay only, no action taken here): if an estate-side remote is
designated for runner configuration, relay `fix/opencode-epipe-guard` and apply
`out/RUNNER-PATCH.diff` after the recorded council GO. No secrets, no force-push, no
permission expansion.
