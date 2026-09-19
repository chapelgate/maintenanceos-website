# USH provider matrix & release gates (MaintenanceOS)

**Control plane:** `https://68.183.44.222` (droplet `chapelgate-ush-1`)  
**Observed 2026-09-18:** `/health` → `status=ok`, providers include `digitalocean`, `twilio`, `openai`, `workload-identity`; `digitalocean.adapter_class=live_http`, `profile=DO_USH_DEPLOY`.

| Provider | Role | Active for MOS deploy? | Notes |
| --- | --- | --- | --- |
| GitHub | Source of truth | yes (code) | Not a USH secret provider |
| DigitalOcean | MaintenanceOS runtime | **required** | Vaulted in USH; MOS uses workload identity |
| Twilio | Voice / webhooks | required for live PSTN | Obtain via USH — no secret-retry loop |
| OpenAI / Gemini | Voice model | Lane A uses OpenAI | Via USH when brokered |
| Resend | Async email only | optional | Must not block voice |
| Render | Legacy validation | **no** | Rollback evidence only until DO passes |

## Release gates

1. USH reachable + kill_switch false  
2. DigitalOcean adapter registered (`live_http`) + vault profile present  
3. MOS durable Ed25519 workload identity present + auto-refresh via `/v1/auth/workload` (never permanent 3600s `issue_token` bearer)  
4. Cross-project isolation: foreign Chapelgate apps denied MOS DO deploy without explicit policy  
5. `n2-secrets-retry` permanently disabled  
6. Cursor Cloud Agent must **not** hold `DIGITALOCEAN_TOKEN`  
7. Progressive concurrency on DO: N=2 → 5 → 10 → 25 after readiness  
8. Twilio cutover only after DO readiness; Render retained as rollback until then  

Machine check: `python3 -m ush_client` and `python3 scripts/ush_do_broker.py`.
