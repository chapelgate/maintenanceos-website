# Test
- Before the fix: 4 of 80 failures (target test alone, 4 CPU-burner processes running).
- After the fix: target test alone, 0 of 100 failures under the same load. Whole file (9 tests) run 20 times: 0 failures.
- Full suite with the CI command (pytest -q -x -k 'not test_local_tls_https_and_wss_transport_reaches_actual_routes') run 3 times on Linux: 581 passed each time.
- Nemotron 3 Super expert review: NON-BLOCKING, and it agrees there is no production code race.
Verified.
