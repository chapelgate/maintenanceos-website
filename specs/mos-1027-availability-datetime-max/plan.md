# Plan
1. Add AVAILABILITY_DATETIME_TEXT_MAX=32 near AVAILABILITY_SLOT_MAX_DAYS.
2. Reject overlong start/end in availability_submit before strptime.
3. Add focused tests.
