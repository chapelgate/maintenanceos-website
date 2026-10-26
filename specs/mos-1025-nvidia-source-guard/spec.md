# mos-1025-nvidia-source-guard: product source stays off the NVIDIA API host

## Goal
Fail the suite if product Python or an opencode config names the public NVIDIA integrate API host. Model-name strings in docs are out of scope. No network call is made.

## Acceptance
- `tests/test_nvidia_source_guard.py::test_product_python_has_no_nvidia_api_host` passes.
- `tests/test_nvidia_source_guard.py::test_opencode_config_has_no_nvidia_api_host` passes.
- `tests/test_nvidia_source_guard.py::test_guard_needles_cover_integrate_host` passes.

## Safety boundary
- Licence route: NONE.
- No secret scan ignore file. No voice, deploy, or dependency edits.
