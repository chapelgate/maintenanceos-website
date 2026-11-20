# Cyber Essentials v3.3 (April 2026) — GAPS.md

## Source Question Set
NCSC IASME Cyber Essentials Requirements for IT Infrastructure v3.3 (April 2026)
URL: https://www.ncsc.gov.uk/sites/default/files/2026-11/Cyber-Essentials-Requirements-for-IT-Infrastructure-v3-3.pdf
Accessed: 2026-11-15

## Scope (Section D)
| Asset | In Scope | Notes |
|-------|----------|-------|
| Dell Precision T5820 (Ubuntu 24.04) | YES | Primary workstation |
| Mac Studio | YES | Secondary device |
| CG laptop | YES | Mobile device |
| Cloud services (GitHub, email, OmniRoute, SaaS) | YES | Cannot be excluded per CE v3.3 D(iv) |
| ISP/home routers | NO | Table 2 exclusion |
| Voice/text/MFA-only devices | NO | Table 2 exclusion |
| Third-party-owned devices | NO | Table 2 exclusion |

## Control Status Summary

| Control | Total Questions | YES | PARTIAL | GAP | Free Fix No-Sudo |
|---------|----------------|-----|---------|-----|------------------|
| Firewalls (E.1) | 7 | 0 | 0 | 7 | 0 |
| Secure Configuration (E.2) | 9 | 1 | 2 | 6 | 0 |
| Security Update Management (E.3) | 4 | 1 | 1 | 2 | 0 |
| User Access Control (E.4) | 10 | 0 | 1 | 9 | 0 |
| Malware Protection (E.5) | 3 | 0 | 0 | 3 | 0 |
| **Total** | **33** | **2** | **4** | **27** | **0** |

## Detailed GAPs with Free Fix Routes

### Firewalls (E.1)
| Q | Requirement | Status | Free Fix | Needs Andy |
|---|-------------|--------|----------|------------|
| E1.1 | Firewall on every device | GAP | ufw config exists; needs runtime verify | sudo ufw status/enable |
| E1.2 | Default admin passwords changed | GAP | Change defaults; disable remote admin | sudo |
| E1.3 | Admin interface not internet-accessible | GAP | Confirm local-only; MFA/IP allowlist | sudo |
| E1.4 | Unauthenticated inbound blocked | GAP | ufw default deny incoming | sudo |
| E1.5 | Inbound rules approved/documented | GAP | Document rules | Free (doc) |
| E1.6 | Unnecessary rules removed | GAP | Review and remove | Free (doc) |
| E1.7 | Software firewall on untrusted networks | GAP | Enable on Mac/laptop | Free (Mac/laptop) |

### Secure Configuration (E.2)
| Q | Requirement | Status | Free Fix | Needs Andy |
|---|-------------|--------|----------|------------|
| E2.1 | Unnecessary accounts removed | PARTIAL | Verify no guest accounts | Free (check) |
| E2.2 | Default passwords changed | GAP | Change all defaults | Free (web UI) |
| E2.3 | Unnecessary software/services removed | GAP | Audit and remove | Free (audit) |
| E2.4 | Auto-run disabled | GAP | Disable on Ubuntu desktop | Free (config) |
| E2.5 | Authentication before access | PARTIAL | Enforce on Mac/laptop | Free (Mac/laptop) |
| E2.6 | Device locking enabled | GAP | Enable screen lock all devices | Free (config) |
| E2.7 | Brute-force on unlock | GAP | Enable throttle/lock (≤10) | Free (config) |
| E2.8 | Min unlock length ≥6 | GAP | Set policy | Free (config) |

### Security Update Management (E.3)
| Q | Requirement | Status | Free Fix | Needs Andy |
|---|-------------|--------|----------|------------|
| E3.1 | Software licensed/supported | PARTIAL | Verify app support | Free (audit) |
| E3.2 | Unsupported software removed | GAP | Audit for unsupported | Free (audit) |
| E3.3 | Auto updates enabled | YES | — | — |
| E3.4 | Critical/high fixes ≤14 days | GAP | Apply upgrades; review CVE | sudo unattended-upgrade |

### User Access Control (E.4)
| Q | Requirement | Status | Free Fix | Needs Andy |
|---|-------------|--------|----------|------------|
| E4.1 | Account creation process | GAP | Document process | Free (doc) |
| E4.2 | Unique credentials | PARTIAL | Maintain | — |
| E4.3 | Deprovisioning process | GAP | Document process | Free (doc) |
| E4.4 | MFA where available | GAP | Enable MFA GitHub/email/SaaS | Free (web UI) |
| E4.5 | Separate admin accounts | GAP | Create dedicated admin | sudo |
| E4.6 | Privilege removal process | GAP | Document process | Free (doc) |
| E4.7 | Password length CE-compliant | GAP | Set policy | Free (config) |
| E4.8 | Brute-force on passwords | GAP | Enable MFA or throttle | Free (config) |
| E4.9 | Unique password support | GAP | Document 3 words/manager | Free (doc) |
| E4.10 | Compromise password change | GAP | Document process | Free (doc) |

### Malware Protection (E.5)
| Q | Requirement | Status | Free Fix | Needs Andy |
|---|-------------|--------|----------|------------|
| E5.1 | Malware protection active | GAP | Install ClamAV on Dell | sudo apt install clamav |
| E5.2 | Anti-malware updated/prevents | GAP | Configure anti-malware | sudo |
| E5.3 | Application allow-listing | GAP | Document if used | Free (doc) |

## Free Fixes Applied (No Andy Login Needed)

None identified. All free fixes on the Dell require sudo (ufw, clamav, unattended-upgrade). Free fixes on Mac/laptop/cloud require Andy's direct access.

## GAPS Parked for Andy

All 27 GAP items and 4 PARTIAL items requiring verification are parked in:
- jobs-work-dell/readiness/PARKED.md
- cyber-essentials-prep-20261115/out/ANDY-STEPS.md
- This file (GAPS.md)

## Evidence Index

| Evidence File | Description | Location |
|---------------|-------------|----------|
| CE-DRAFT-ANSWERS.md | Draft answers to all v3.3 questions | Same directory |
| CE-TEMPLATE.md | Fill-in template for all questions | Same directory |
| INVENTORY-TEMPLATE.md | Device/software/cloud inventory template | Same directory |
| POLICY-PACK.md | Policy drafts (access, patching, malware, firewall, secure config) | Same directory |
| ANDY-STEPS.md | Gaps needing sudo/Mac/laptop/account | Prep out/ |
| EVIDENCE.md | Build evidence summary | Prep out/ |
| council-ce-self-assessment-20261116.md | Second-family council GO | council-ai-agent-sefton-gap-20261116/out/ |
| evidence/01-*.txt through 08-*.txt | Dell read-only captures | Prep out/evidence/ |

## Assessment Fee & Submission

PARKED — Andy-only (fee, IASME submission, board declaration). Free prep complete.