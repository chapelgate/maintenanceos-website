# Plan

1. Extend `landlord_compliance_bridge.py` with `evaluate_compliance()`, `strip_disallowed_fields()`, and `strip_to_allowlist()`.
2. Keep fail-closed helpers from mos-1024-02. `vertical_profile.py` is the ready #196 selector (byte-identical), not the thinner mos-1024-02 copy.
3. Allowlisted synthetic keys: `id`, `postcode`, `property_ref` only.
4. Disallowed keys stripped: `special_category`, `contact_dump`, `access_code`, `ssn`, `medical_record`, `full_name`, `date_of_birth`.
5. Call `landlordos.compliance.evaluate_compliance(synthetic)` when import works; return structured facts dict.
6. Filter the dependency dict before return: drop conclusion/deadline keys, free-text sentences, and date-shaped strings. Do not invent a legal conclusion or deadline.
7. Write acceptance tests `test_synthetic_england_eval_returns_structured_facts` and `test_disallowed_fields_are_stripped`.
8. Estate FEATURE artifacts: spec, plan, tasks, build-readiness.
9. Rollback: delete the new bridge, vertical_profile, tests, and this specs folder.
