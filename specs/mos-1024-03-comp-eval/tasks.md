# Tasks

- [x] Extend `landlord_compliance_bridge.py` with `evaluate_compliance()`, `strip_disallowed_fields()`, and `strip_to_allowlist()`.
- [x] Keep fail-closed helpers from mos-1024-02. Publish `vertical_profile.py` byte-identical to ready draft #196, not the thinner mos-1024-02 selector.
- [x] Allowlisted synthetic keys: `id`, `postcode`, `property_ref` only.
- [x] Disallowed keys stripped: `special_category`, `contact_dump`, `access_code`, `ssn`, `medical_record`, `full_name`, `date_of_birth`.
- [x] Call `landlordos.compliance.evaluate_compliance(synthetic)` when import works; return structured facts dict.
- [x] Filter dependency results so conclusion text, deadline keys, free-text sentences, and date-shaped strings are not returned.
- [x] Write acceptance tests `test_synthetic_england_eval_returns_structured_facts` and `test_disallowed_fields_are_stripped`.
- [x] All named tests pass; full test suite passes.
- [x] Estate FEATURE artifacts: spec.md, plan.md, tasks.md, PR_BODY.md present; all tasks checked.
