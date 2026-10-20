# S9: Add security.txt

## Problem
The website does not have a security.txt file at `/.well-known/security.txt` as recommended by RFC 9116. Security researchers cannot report vulnerabilities via a standardized endpoint.

## Solution
Add a `/.well-known/security.txt` file with a Contact field pointing to the security email.

## Acceptance Criteria
- `curl -f https://worksmartos.co.uk/.well-known/security.txt | grep -q "Contact:"` returns successfully
- `npm run build` exits 0 with no regressions