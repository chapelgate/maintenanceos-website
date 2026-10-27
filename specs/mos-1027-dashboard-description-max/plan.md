# Plan
1. Reuse api.WORK_ORDER_DESCRIPTION_MAX and api._reject_control_chars constants/helpers via import of the max constant only; keep dashboard validation local to avoid FastAPI coupling on the Streamlit path.
2. Gate Create + triage on description length and control characters before WorkOrder insert.
3. Add focused unit tests that prove the bound and source wiring.
