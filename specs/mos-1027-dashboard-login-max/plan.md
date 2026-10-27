# Plan
1. Add LOGIN_PASSWORD_MAX=200 in security.py; reject overlong in verify_password and hash_password.
2. Wire EMAIL_LOOKUP_MAX and LOGIN_PASSWORD_MAX into dashboard auth().
3. Add focused tests.
