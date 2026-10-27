# Plan
1. Add ANOMALY_REASONS_MAX = 2000 next to other invoice bounds in operations.py
2. Before Invoice create, if len(json.dumps(reasons)) > MAX return None
3. Tests for constant, source wiring, and behavioural refuse
