# Plan
1. Add issue_form_csrf / verify_form_csrf / issue_health_csrf in security.py
2. Embed csrf_token in contractor GET forms; validate on POST
3. Emit x-csrf-token on /health
4. Tests for issue/verify, embed, reject, accept, exempt paths
