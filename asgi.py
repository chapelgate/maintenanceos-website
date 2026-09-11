"""Production ASGI entrypoint.

Imports the existing hardened FastAPI application and swaps only the two voice
provider globals used by the already-registered inbound/media-stream routes.
All business, safety, tenant and lifecycle routes continue to come from api.py.
"""

import api as api_module
from provider_runtime import handle_provider_media_stream, provider_ready

api_module.handle_twilio_media_stream = handle_provider_media_stream
api_module.voice_ready = provider_ready

app = api_module.app
