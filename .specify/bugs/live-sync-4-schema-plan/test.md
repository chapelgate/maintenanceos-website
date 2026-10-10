# Test
Docs-only change. The schema comparison was verified by producing both schemas with the same read-only script (live: sqlite mode=ro on /var/lib/maintenanceos/maintenanceos.db; main: create_all on a throwaway DB at b3c165e) and diffing columns, types, NOT NULL, PK and unique indexes for every table. The full pytest suite is unaffected (no Python files changed).
