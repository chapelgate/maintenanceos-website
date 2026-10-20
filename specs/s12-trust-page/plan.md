Plan: Add Cyber Essentials PLANNED status to trust page and link VDP/subprocessor pages.

- Add "Cyber Essentials: PLANNED (target Q2 2027)" to /security/ page
- Add link to /vulnerability-disclosure/ page from /security/
- Add link to /subprocessors/ page from /security/
- Verify acceptance test passes: curl -s https://worksmartos.co.uk/security/ | grep -q "PLANNED"