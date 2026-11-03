# SLICES — build-mos-20261025

| Slice | Gap | PR | Head | Status |
|-------|-----|-----|------|--------|
| 1 | mos-1185 dict/list HTTPException detail redaction | #614 | 76e281f7 | MERGED |
| 8 | mos-01..08 product_profile, requirements.lock, audit_text, etc | #631..#698 | MERGED |
| 91 | mos-1258 control-char reject in phone_normalise.normalise_phone | #699 | open | READY_FOR_COUNCIL |
| 92 | mos-1259 report forbidden parity (FORBIDDEN_REPORT_FIELDS) | #700 | open | READY_FOR_COUNCIL |
| 93 | mos-1260 reject control chars in sla_status urgency | #701 | open | READY_FOR_COUNCIL |
| 66 | mos-1258 phone_normalise control chars | #699 | 54c5dcbe | MERGED |
| 68 | mos-1260 sla urgency control chars | #701 | 9591a29c | MERGED |
| 69 | mos-1261 export resident_name forbid | #702 | 2f3cca76 | MERGED |
| 70 | mos-1262 http_error C0 strip | #703 | 12916c78 | MERGED |
| 71 | mos-1263 redact_secrets C0 strip | #704 | 94aeffe4 | MERGED |
| 72 | mos-1265 identity_contract control chars | #705 | 4ff76400 | MERGED |
| 73 | mos-1266 portal skip-link a11y | #706 | 94f6da19 | MERGED |
| 74 | mos-1267 schema call_sessions.call_sid | #707 | 51c74d7d | MERGED |
| 75 | mos-1268 product_profile DENY_KEYS frozen/PII | #708 | aed6a948 | MERGED |
| 76 | mos-1269 action_result clean mock | #709 | edc5c437 | MERGED |
| 77 | mos-1270 portal skip-link focus style | #710 | feeda29b | MERGED |
| 78 | mos-1271 portal skip-link CSP-safe | #711 | 72e40357 | MERGED |
| 79 | mos-1272 portal skip-link aria-label | #712 | 27bf662e | MERGED |
| 80 | mos-1273 portal skip-link assertion | #713 | 4d1007b6 | MERGED |
| 81 | mos-1274 product_profile DENY_KEYS lock | #714 | e70f712b | MERGED |
| 82 | mos-1275 post-call email mirror sync | #715 | cf95a4f6 | MERGED |
| 83 | mos-1276 idempotency scope C0 | #716 | b75a8085 | MERGED |

## mos-1277 (PR #721 MERGED)
Strip DEL+C1 from http_error_text/secret_patterns._strip_controls; Spec Kit FEATURE; head cc918f3320ac6c026786dffe4e53a94a764348ce; merge 409454ebbcd7be3b484b6d86357d0f24ab459c54.

## mos-1278 (PR #722 MERGED)
Reject DEL+C1 in audit_text._has_control_chars; Spec Kit FEATURE; head 2be06465c4d8841fc36359099343fd0c3ef3894d; merge b66352c35d4ae416451a2b6e64cef9c7dfb14f4b.

## mos-1279 (PR #723 MERGED)
Reject DEL+C1 in idempotency._has_control_chars; Spec Kit FEATURE; head 06340e4; merge pending.

## mos-1280 (PR #724 MERGED)
Reject DEL+C1 in phone_normalise; Spec Kit FEATURE; head 7adc3ddb5f5588777c17d26f3330220fec48820b; merge 0402bd39403af649260578e735f33e18f5dae81c.

## mos-1281 (PR #725 MERGED)
Reject DEL+C1 in sla_status urgency; Spec Kit FEATURE; head 86550450944671fe8dc1663a8e8d5298c966c294; merge 96f06100b2c192cc74ea4f7dfe3f1fe327981f80.

## mos-1282 (PR #726 MERGED)
Reject DEL+C1 in postcode_normalise; Spec Kit FEATURE; head 632e466f529d87d759c632a129f976c3d1072c42; merge 5de3047eebbd5bee2f9f158aaa8d96639af18d92.

## mos-1282 (PR #726 MERGED)
Reject DEL+C1 in postcode_normalise; Spec Kit FEATURE; head 632e466f529d87d759c632a129f976c3d1072c42; merge 5de3047eebbd5bee2f9f158aaa8d96639af18d92.

## mos-1283 (PR #727 MERGED)
Reject DEL+C1 in escalation_text; Spec Kit FEATURE; head 6be9498a8b7cb31419f43751234eb13622084965; merge d54da5f43ecf87eda083ade150aa413ddf78690b.

## mos-1284 (PR #728 MERGED)
Reject DEL+C1 in identity phone/postcode; Spec Kit FEATURE; head a804e6209da4b5c32b712da6695fccb92cc8a37f; merge 62d20a437ddf51f64faa75168de6f236acd8a5be.

## mos-1285 (PR #729 MERGED)
Reject DEL+C1 in approval_text; Spec Kit FEATURE; head eac33b2d299f88da550bad472684b0dc3941a9c6; merge 5f0ee3b08b972a8fa4d81bbf486ac97839d7fa6a.

## mos-1286 (PR #730 MERGED)
Reject DEL+C1 in work_order_text; Spec Kit FEATURE; head 35f4138f63a1ceeffb0a07dd4d0fb469b4556d98; merge 189b44ee65c938daff109bf40f4c34b464a5ce95.

## mos-1287 (PR #731 MERGED)
Reject DEL+C1 in lifecycle transitions; Spec Kit FEATURE; head 42d104729f1236f9b7cdc244917cb95eddce62b1; merge d7c4dd94c635c6776c52f8e44d6d406cde8f086c.

## mos-1288 (PR #732 MERGED)
Reject DEL+C1 in channels helpers; Spec Kit FEATURE; head bf1a97e22dcdad6d09b3d3d76483467e69efe64f; merge 014b04468dbe6b9f53785e889c694381ce87734f.

## mos-1288 (PR #732 MERGED)
Reject DEL+C1 in channels helpers; Spec Kit FEATURE; head bf1a97e22dcdad6d09b3d3d76483467e69efe64f; merge bf1a97e22dcdad6d09b3d3d76483467e69efe64f.

## mos-1289 (PR #733 MERGED)
Reject DEL+C1 in communications helpers; Spec Kit FEATURE; head ba8a73ee2b38340ed8d91456e5e96e46ccbe9f89; merge f01e6cd6950c3e7b09b1356ab1173c23af3630fc.

## mos-1290 (PR #734 MERGED)
Reject DEL+C1 in retention_class_known; Spec Kit FEATURE; head c39c0a4df0a8c505ce9321715c26ce06753a5bc7; merge f0d3d48860cd31762ebb73f23b5f28de5e349fdc.

## mos-1291 (PR #735 MERGED)
Reject DEL+C1 in safety_controls; Spec Kit FEATURE; head 28dba50a0f946ba562e7b0d1f0b48ab5c9ed5e40; merge 6c9c8bd14fb4aa6568e714a673e45943b1ffd289.

## mos-1292 (PR #736 MERGED)
Reject DEL+C1 in tenant_security; Spec Kit FEATURE; head 9981ca38594896e924a0546ce6bd2b8e3cb7aaae; merge cbe1201b31e86c868c671bba83984b9d2fb06370.

## mos-1292 (PR #737 MERGED)
Reject DEL+C1 in tenant_security; Spec Kit FEATURE; head 9981ca38594896e924a0546ce6bd2b8e3cb7aaae; merge df5b9a1c2636a267811fbc2e9ae0e1da1a828582.

## mos-1292 (PR #737 MERGED)
Reject DEL+C1 in tenant_security; Spec Kit FEATURE; head 9981ca38594896e924a0546ce6bd2b8e3cb7aaae; merge df5b9a1c2636a267811fbc2e9ae0e1da1a828582.

## mos-1293 (PR #738 MERGED)
Reject DEL+C1 in email_gateway; Spec Kit FEATURE; head 34125f15db21414b617f65551ff91ef6bd4335ba; merge fceaf71540c5c3a879bda033cd99510bdeec99d2.

## mos-1294 (PR #739 MERGED)
Reject DEL+C1 in webhook_security; Spec Kit FEATURE; head ac5a12d577022d04fc99d37ba908461e252484ea; merge 4596df93654571a9c92aae6dad89b02ed54caffe.

## mos-1295 (PR #740 MERGED)
Reject DEL+C1 in action_evidence; Spec Kit FEATURE; head 3e2a0f4f5b4b5118674e64ede4fb8483d156cb4d; merge 3918f24bb9db1362b787fa442688ec84e77bd04e.

## mos-1296 (PR #741 MERGED)
Reject DEL+C1 in call_capacity; Spec Kit FEATURE; head 53564d44ce0f5d87c5d5930b6626771325888b25; merge 81c42a88e6ba58c2a8fd314f8a75af7f81437737.

## mos-1297 (PR #742 MERGED)
Reject DEL+C1 in identity_contract; Spec Kit FEATURE; head 4806aad690384809daee80c124819ae48d73360c; merge b6fdfe1c45a3755826ec5ebc4e95eadf5a0eef10.

## mos-1298 (PR #743 MERGED)
Reject DEL+C1 in ai_session_sim; Spec Kit FEATURE; head 5c24b067558a64cdb89be269f65da4abb0af46ee; merge 6633c17c26533f7bba78663a26201c41cd524099.

## mos-1299 (PR #744 MERGED)
Reject DEL+C1 in call_notifications; Spec Kit FEATURE; head 815f4f432ea8d700e05262ca34c34ff5d0ad02fb; merge b9bd3251fb12ad3ddb365a506c8fa6badb7db701.

## mos-1300 (PR # MERGED)
Reject DEL+C1 in permissions_policy; Spec Kit FEATURE; head 5484e3dc4adc843ca550e1e97d00fe3c5a178fd5; merge .

## mos-1301 (PR #746 MERGED)
Reject DEL+C1 in request_context; Spec Kit FEATURE; head d6aa9c747184debe9b14a2af4f004228407b3ab8; merge 42ef21a8e2577772c77ee30989a7141f36264403.

## mos-1302 (PR #747 MERGED)
Reject DEL+C1 in secret_patterns; Spec Kit FEATURE; head 0501bdaa2d83b01bbee331b051e8f85c3d43304b; merge 1b0f0bff88387e52d78d7349c264197ac35402ea.

## mos-1303 (PR #749 MERGED/HELD)
Reject DEL+C1 in security link kind; Spec Kit FEATURE; head 3eefe893667e8ca2bbcaefbcc2e20a67203b9d8b.

## mos-1031-01-product-hardening (PR #754 OPEN) — Product profile overlay validation and deny-keys hardening
mos-1031-01: Enforce deny-keys set exactly six keys and allow exactly two profiles on product profile overlay. Reduced DENY_KEYS from origin/main's 21 back to exactly 6 core keys (retention, voice, telephony, market, dispatch, credential) in product_profile.py. Acceptance: test_product_profile_deny_keys_comprehensive, test_deny_keys_set_has_exactly_six_keys, test_allowed_profiles_set_has_two_profiles, test_product_profile_api_title_returns_string, test_page_title_returns_profile_specific_string, test_worker_banner_returns_profile_specific_string all pass. PR: https://github.com/chapelgate/maintenanceos-v1-pilot/pull/754

## mos-1311 (PR #753 OPEN) — Competitor and market benchmark
MOS-S011: compare Moneypenny, BT Digital Voice for Business, Hey Jodie, Dialzara and relevant UK alternatives on verified current primary-source features, call accuracy, interruptions, escalation, reporting, integrations, privacy, trial/onboarding and price; identify realistic differentiated positioning. Sourced dated matrix, no fabricated scores. Independent of S004/S006/S007; documentation/analysis only, no carrier call. Artifact: docs/commercial_release/COMPETITOR_BENCHMARK.md.

## mos-1031-02-runtime-hardening (PR #755 OPEN) — Commercial runtime fail-closed guards enrichment
mos-1031-02: Add social_housing_runtime_fail_closed guard and reinforce lifecycle/identity runtime false-closed. Acceptance: test_lifecycle_runtime_fail_closed, test_identity_runtime_fail_closed, test_social_housing_runtime_fail_closed, test_retention_policy_configured — all pass. PR: https://github.com/chapelgate/maintenanceos-v1-pilot/pull/755

## mos-1031-03-accessibility-hardening (PR #756 OPEN) — Accessibility hardening for API responses and forms
mos-1031-03: Extend accessibility sanitization to all API endpoints and form fields. Acceptance: test_sanitize_http_detail_basic_redaction, test_sanitize_http_detail_non_string_passthrough, test_sanitize_http_detail_truncation, test_sanitize_http_detail_provider_id_redaction, test_sanitize_http_detail_all_token_types, test_sanitize_http_detail_pem_private_key, test_sanitize_json_payload_redacts_secrets_in_json, test_sanitize_json_payload_preserves_safe_fields, test_sanitize_json_payload_truncates_long_output, test_no_duplicate_regex_constants_http_error_text, test_no_duplicate_regex_constants_audit_text, test_api_health_endpoint_no_secrets, test_api_error_response_is_sanitized, test_html_forms_have_aria_labels, test_product_profile_title_used_for_api, test_api_has_no_openapi_or_docs_exposed, test_health_response_has_no_raw_emails, test_redact_detail_no_secrets_leak — all 24 pass. PR: https://github.com/chapelgate/maintenanceos-v1-pilot/pull/756
