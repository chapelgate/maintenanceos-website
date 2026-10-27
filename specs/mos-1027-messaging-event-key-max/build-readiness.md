# Build readiness

Every group below carries exactly one status word on its own line, with a reason of at least ten characters: APPLIES, NOT_APPLICABLE or ALREADY_COVERED. A group marked APPLIES names where it is handled.

## 1. Traffic and resilience
Status: APPLIES
Reason: messaging_inbound rejects overlong MessageSid and never embeds body into event_key.

## 2. Performance
Status: NOT_APPLICABLE
Reason: single hash or length check on the inbound path; no new queries.

## 3. Data and consistency
Status: NOT_APPLICABLE
Reason: no schema or migration; rejects or hashes keys before ChannelEventIdentity write.

## 4. Messaging and async
Status: APPLIES
Reason: Twilio inbound MessageSid/event_key contract bounded at the public messaging endpoint.

## 5. Security
Status: APPLIES
Reason: overlong MessageSid cannot reach create_from_channel; body no longer inflates idempotency keys.

## 6. Delivery
Status: APPLIES
Reason: FEATURE Spec Kit under specs/mos-1027-messaging-event-key-max/; ready PR; rollback by reverting slice commits.

## 7. Operations
Status: APPLIES
Reason: ValueError from create_from_channel maps to HTTP 400 on the matched messaging path.

## 8. Runtime hygiene
Status: APPLIES
Reason: invalid event keys never reach persistence on the covered path.
