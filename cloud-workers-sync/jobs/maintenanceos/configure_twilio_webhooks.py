"""Cloud/Render entry point for Twilio voice webhook configuration.

Closed mode (ENABLE_PUBLIC_PROVIDER_INGRESS=false) skips mutation and exits 0.
Incomplete live configuration fails closed with a non-zero exit.
"""

from provider_webhooks import main


if __name__ == "__main__":
    raise SystemExit(main())
