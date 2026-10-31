# fix
1) Check job availability before CSRF on contractor_decision_submit; restore verify_link after CSRF.
2) Enforce CSRF only when csrf_token is a real str (HTTP Form always delivers str; missing field stays FastAPI 422).
3) Reorder availability_submit/complete_submit so business fields precede csrf_token; validate datetime lengths before CSRF.
