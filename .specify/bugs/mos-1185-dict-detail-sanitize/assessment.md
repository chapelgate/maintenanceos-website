# Assessment: mos-1185-dict-detail-sanitize

## Bug
`sanitize_http_detail` returned non-string details unchanged. FastAPI `HTTPException(detail=dict)` therefore leaked emails, bearer tokens and other secret substrings through the global exception handler.

## Evidence
Reproduced on main `430ac02a`:
```
HTTPException(400, {"email": "a@b.co", "token": "Bearer secrettoken", "ok": 1})
→ response detail unchanged with raw email and Bearer token
```

## Scope
- `http_error_text.py` recursive structure sanitize
- Tests locking dict/list redaction and handler behaviour
- No voice/deploy/nginx/frozen paths
