# Plan

1. Keep the website voice function as the only public speech API. It tries Gemini, then Piper, then tells the page to use the browser voice.
2. Run Piper in its own container on the existing droplet. Caddy gains one route. The scanner container is unchanged.
3. The page reads `X-Voice-Engine` and shows Jenny (Dioco) when Piper spoke, because that dataset requires the name on a voice interface.
