# Assessment: demo tabs miss the sticky header, and /create accepts unsafe website URLs

- `/demo/#demo` and `/demo/#launch` put the hash on the inner panel. That panel exists only for the selected tab, so a native hash jump often leaves the tab list under the sticky header or never selects the matching tab.
- The tab list itself had `tabIndex={0}` and handled arrows on the container, so Home, End, and the arrows did not move focus onto the selected tab.
- `/create` step 1 treated any `http://` URL with a dotted host as public, including `10.*`, `192.168.*`, `172.16`–`31.*`, and `127.*`. `localhost` failed only because it has no dot, and the message was the generic invalid-URL line.

Verdict: verified against the current demo tabs and create-form source before the fix.
