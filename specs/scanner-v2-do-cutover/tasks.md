# Tasks

- [ ] Reproduce and record provider-side route failure.
- [ ] Run read-only DigitalOcean preflight and identify exact app, namespace, function URL and ingress state.
- [ ] Verify the existing credential paths and avoid creating a permanent new credential.
- [ ] Preserve rollback snapshot and provider-state evidence.
- [ ] Deploy exact verified Scanner V2 image to existing droplet with persistent state.
- [ ] Establish trusted HTTPS without a new domain/service.
- [ ] Verify direct runtime health, scan and restart/resume behaviour.
- [ ] Deploy/configure the existing `website/scan` Function to the DigitalOcean runtime.
- [ ] Repair existing App ingress only if preflight proves it is the failing layer.
- [ ] Verify direct Function and same-origin live scans.
- [ ] Run real-site and mobile browser acceptance.
- [ ] Re-run full regression gates and exact deployed-SHA verification.
- [ ] Record final freeze evidence and remove temporary deployment credential material.
