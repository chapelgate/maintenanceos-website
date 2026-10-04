# Test

Verdict: pending verification.

Required proof:
- exact candidate Docker image builds;
- container `GET /health` returns 200 with `ingestEnabled=true` and `scannerV2Enabled=true` when explicitly enabled for the local smoke;
- inside the image, `import("playwright")` succeeds and Chromium can launch/close headlessly;
- inside the image, `import("pdfjs-dist/legacy/build/pdf.mjs")` succeeds;
- existing repository / accessibility / build / browser gates remain green;
- Chapelgate Estate Gate passes the BUG route.
