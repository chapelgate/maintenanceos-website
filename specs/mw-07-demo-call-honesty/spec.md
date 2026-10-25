# mw-07-demo-call-honesty

## Problem

`/demo` titled its timeline "What happens on the call" and step 1 said "Caller explains repair issue." That reads as a live telephone call. The page is a pre-launch scripted browser preview.

## Cause

The timeline copy was written as a phone script. The disclaimer underneath did not correct the heading.

## Acceptance

- The heading is "What the scripted preview does".
- Step 1 says a person describes a repair in the browser preview.
- The page still says it is not a live telephone call and does not assign a live number.
- The heading "What happens on the call" and the sentence "Caller explains" are gone.
- `node --test scripts/demo-call-honesty.test.mjs` exits 0.
