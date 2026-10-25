# Andy synthetic demo script

WorkSmartOS marketing site, pre-launch, synthetic only. This script checks the static site. It does not sell, publish a price, turn on public launch, connect a calendar, deliver chat, or place a call.

Do not set NEXT_PUBLIC_PUBLIC_LAUNCH to true.
Do not call the golden phone line.
Do not enter a live customer record.

1. Open the homepage. Confirm the pre-launch banner is visible and the page does not offer a live phone number.
2. Open /demo/. Confirm the preview is scripted in the browser and says it is not a live telephone call.
3. Open /pricing/. Confirm no list price is published.
4. Open /status/. Confirm no uptime percentage is shown.
5. Open /contact/. Use the mailto path only. Do not expect a chat reply.
6. Open an unknown path. Confirm the page says it is not on the site.
7. Stop. Safari, iOS, keyboard, and assistive-technology passes stay physical checks and are not signed off here.

Passing this script does not mean the site is releasable and does not mean WCAG 2.2 AA is verified.
