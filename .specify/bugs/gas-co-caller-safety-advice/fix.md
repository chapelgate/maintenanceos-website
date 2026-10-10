# Fix

- New `safety_messages.py`: `GAS_SAFETY_ADVICE` and `CO_SAFETY_ADVICE`, verbatim from official GB sources (National Gas, GOV.UK, NHS, HSE). `GAS_CO_SAFETY_RULE` is built from those constants.
- `gemini_voice.py`: the rule is inserted after the 999/911 line. Prompt only.
- `voice_bridge.py`:
  - The rule and the "not a handoff" line are added to the prompt.
  - New helpers `safety_advice_for_flags`, `deterministic_safety_twiml` and `_deliver_safety_advice`.
  - On a `deterministic_safety` escalation with `GAS_SMELL` or `CO` flags, the live call is updated to `<Say>` the advice before `request_transfer` closes the stream.
  - Only one call update is made. If a live handoff was requested, the advice TwiML carries the `<Dial>`.
  - On failure, `safety_advice_delivery_failed` is recorded and the original transfer behaviour runs.
- `voice_policy.py`: gas-service parties are added to `PARTY` and mapped to `emergency_services_*`, so false "contacted the gas emergency service" claims are rejected.
- `tests/test_gas_co_safety_advice.py`: the 19 spec tests.

Rollback: revert the single commit. No data, schema, config or deploy change.
