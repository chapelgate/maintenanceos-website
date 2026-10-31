# Fix — mos-1187

Replace datetime.utcnow() with datetime.now(timezone.utc) in the four remainder files. Emit generated_at with .isoformat().replace("+00:00", "Z").
