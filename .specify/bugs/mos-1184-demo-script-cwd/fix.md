# Fix — mos-1184-demo-script-cwd

1. `tests/test_landlord_demo_script.py`: resolve repo root from `__file__` via pathlib.
2. `demo_landlord_pilot.py`: import `init_db` and call it at the start of `main()`.
