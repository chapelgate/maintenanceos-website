# Next Human-Approved Inputs

Do not paste credentials, tokens, resident data, addresses, or access codes into
chat. Use the approved test-environment secret store and synthetic fixtures only.

The next external stage, after local acceptance, requires separate owner approval
to configure an isolated deployment. At that boundary the operator must provide or
approve, through secure channels:

- dedicated test OpenAI project/service credentials and confirmed model access;
- dedicated Twilio test account/number and staffed test human-transfer number;
- test-only HTTPS/WSS hostname and ingress controls;
- managed test database, secret store, logging/alerting, and backup owner;
- synthetic tenant, caller, property, contractor, and approval data;
- named observer, rollback owner, call window, and stop conditions.

Configuring that environment is not approval to place a call. The dedicated test
number must be proven distinct from the live business number, and the first call
requires its own explicit authorisation.
