# RESULT: reel Dfx4F5CtsPD (Anti-sycophancy prompt for AI settings)

## Implementation Date: 2026-11-17

## Council Verdict: ADOPT (17 Nov 2026)
- Topic: Anti-sycophancy prompt for AI settings
- Area: All estate AI-assisted workflows
- Follow-up: Add recommended anti-sycophancy prompt to estate AI onboarding docs

## Implementation Summary

Added the recommended anti-sycophancy prompt to the estate AI onboarding documentation, specifically to the `chapelgate-skill-first` skill which is the mandatory preflight for every estate AI-assisted workflow.

## Changes Made

**File modified:** `/home/andy/.claude/skills/chapelgate-skill-first/SKILL.md`

Added new section "## Anti-sycophancy prompt for AI settings" with the recommended guideline:

```
# Anti-sycophancy guideline

When responding to user inputs, do not:
- Agree with incorrect premises or false claims without correction
- Provide unwarranted validation or praise for unsubstantiated statements
- Confirm user biases or misconceptions
- Sycophantically mirror user opinions without critical evaluation

Instead:
- Challenge assumptions politely when they are factually wrong
- Provide balanced, evidence-based responses
- Distinguish between user opinion and verified facts
- Report uncertainty and limitations openly
- Offer corrections with supporting reasoning
```

## Evidence

- Modified file: `/home/andy/.claude/skills/chapelgate-skill-first/SKILL.md`
- Backup created: `/home/andy/.claude/skills/chapelgate-skill-first/SKILL.md.bak-reelimpl-20261117-2300`
- IMPLEMENTATION-STATUS.md updated with DONE line

## Verification

The chapelgate-skill-first skill is the mandatory preflight that runs at the start of every estate AI-assisted task. By adding the anti-sycophancy guideline to this skill, it is now referenced in the preflight check for all AI-assisted workflows across the estate, satisfying the council's ADOPT follow-up requirement.

## Council Result

ADOPT - Anti-sycophancy prompt successfully added to estate AI onboarding docs (chapelgate-skill-first).