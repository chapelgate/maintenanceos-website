# Fix
Change the tests/test_staged_voice_routes.py staged_routes fixture to a per-test SQLite file (tmp_path) with NullPool, check_same_thread=False and timeout=15, plus engine.dispose() on teardown. Every session now has its own connection and only sees committed data, as in production. No sleeps were added and no assertions were weakened. No production code changes.
