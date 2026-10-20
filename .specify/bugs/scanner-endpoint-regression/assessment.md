# Assessment

PR #333 (2a33266) made src/config/site.ts read NEXT_PUBLIC_ONBOARDING_SCAN_ENDPOINT and removed the test guards that kept the public scan same-origin. The production rebuild at 19:33 BST on 20 Oct 2026 baked in https://seahorse-app-4oasq.ondigitalocean.app/onboarding-scan/v1/onboarding/scan, which returns POST 400 and OPTIONS 405. The homepage scanner failed for visitors. Same-origin /api/website/scan returned POST 200.
