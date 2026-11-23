# Dell Hosting - Business Evidence Wallet

## Target URL
https://dell-t5820.taild4745e.ts.net/

## SHA
0aa1d93b1525353ec26f39491c4e8f20fd4d8a75 (PR #1523)

## How to start
1. PostgreSQL must be running: `systemctl --user status postgresql.service` or `pg:start`
2. Node application: `systemctl --user status ew-dell-hosting.service`
3. Tailscale serve: `/home/andy/tailscale/tailscale --socket=/home/andy/tailscale/tailscaled.sock serve --bg https://127.0.0.1:8080`

## How to stop
1. Stop Node application: `systemctl --user stop ew-dell-hosting.service`
2. Stop PostgreSQL: `pg:stop` or `systemctl --user stop postgresql.service`
3. Stop Tailscale serve: `/home/andy/tailscale/tailscale --socket=/home/andy/tailscale/tailscaled.sock serve --https=443 off`

## Seed credentials
Encrypted credentials at: /home/andy/chapelgate/factory-tasks/ew-dell-hosting-20261121/out/seed-credentials.env (mode 600)