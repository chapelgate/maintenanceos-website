# Assessment: no working DigitalOcean API route for the estate execution manager

- Symptom: Eggbot cannot list droplets. No doctl is installed on the laptop. The Universal Secrets Handler at 138.68.183.183 is unreachable (TCP 443 timeout from the laptop). The USH repo has no DIGITALOCEAN_ACCESS_TOKEN Actions secret, so its estate-bridge-do-dry-run.yml only reports `no_actions_secret`.
- The existing credential is the `DIGITALOCEAN_ACCESS_TOKEN` Actions secret in this repository (also present in holiday-let-operator, which is a protected product and not used).
- No workflow in this repository uses that secret.
- Need: a read-only, manually triggered inventory route that uses the existing secret and adds no new credential.
