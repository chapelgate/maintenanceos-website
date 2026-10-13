Symptom: webkit-a11y color-contrast on run 38428439309, head ce360de. Two failing assertions, both axe on /create/ (iPhone 13 and Desktop Safari).

- Current step `li[aria-current=step]` and its "Step 1" label: #e6eef6 on #e2f3f6, ratio 1.02. Expected 4.5:1.
- Steps 2–5 (`text-muted`) and their step labels: #a9b8c9 on #f3f4f5, ratio 1.83. Expected 4.5:1.

The earlier PREVIEW chip (#92400e on #0A1728, 2.53:1) is already #fcd34d and is not in these failures.

Cause: `.create-step-chrome-bar` was `rgb(255 255 255 / 95%)` over the card, so light text sat on a near-white bar. The current step's `bg-accent-subtle` (12% #67E8F9) blended that bar to #e2f3f6.

Fix: bar background `rgb(10 23 40 / 95%)`, the design bg. #E6EEF6 and #A9B8C9 then clear 4.5:1.
