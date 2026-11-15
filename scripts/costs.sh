#!/usr/bin/env bash
# costs.sh — Parse opencode session usage per suite per run into COSTS.csv
# with estimated cost (free tiers 0, Codex/Claude at published rates noted as estimates).
# Output: /home/andy/chapelgate/estate-artifacts/COSTS.csv
# Also appends per-product totals for dashboard display.

set -euo pipefail

ARTIFACTS_DIR="/home/andy/chapelgate/estate-artifacts"
COSTS_FILE="$ARTIFACTS_DIR/COSTS.csv"

mkdir -p "$ARTIFACTS_DIR"

csv_header="suite,timestamp,model_id,tokens_input,tokens_output,tokens_reasoning,tokens_cache_read,tokens_cache_write,cost_estimate,notes"
printf '%s\n' "$csv_header" > "$COSTS_FILE"

OPENCODE_DB="/home/andy/.local/share/opencode/opencode.db"

python3 - <<'PYEOF' >> "$COSTS_FILE"
import sqlite3, os, re, json, collections

OPENCODE_DB = "/home/andy/.local/share/opencode/opencode.db"

base = "/home/andy/chapelgate/factory-tasks"
suite_dirs = []
for d in os.listdir(base):
    full = os.path.join(base, d)
    if not os.path.isdir(full):
        continue
    if re.match(r'^(h25|rt15|sd|fa|ff|rr|slice)[0-9]', d):
        suite_dirs.append((d, full))

# Known rate estimates per 1M tokens (USD); free tiers at 0
RATES = {
    "estate-coding": 0.0,
    "cx/codex-auto-review": 0.0,
    "codex/codex-auto-review": 0.0,
    "groq/groq-compound": 0.0,
    "mistral/codestral-latest": 0.0,
}

def extract_model_id(raw):
    if not raw:
        return "unknown"
    raw = str(raw).strip()
    try:
        parsed = json.loads(raw)
        if isinstance(parsed, dict):
            return parsed.get("id", parsed.get("name", str(parsed)))
        return str(parsed)
    except Exception:
        return raw

# Per-product totals
product_totals = collections.defaultdict(lambda: {"tokens_in":0,"tokens_out":0,"cost":0.0,"count":0})

lines = []
for suite, suite_dir in sorted(suite_dirs):
    try:
        conn = sqlite3.connect(OPENCODE_DB)
        conn.row_factory = sqlite3.Row
        rows = conn.execute(
            "SELECT id, model, tokens_input, tokens_output, tokens_reasoning, tokens_cache_read, tokens_cache_write, cost, time_created FROM session WHERE directory LIKE ? ORDER BY time_created DESC LIMIT 20",
            (f"%{suite_dir}%",)
        ).fetchall()
        conn.close()
    except Exception:
        continue

    for row in rows:
        model_id = extract_model_id(row['model']) or 'unknown'
        tokens_in = row['tokens_input'] or 0
        tokens_out = row['tokens_output'] or 0
        tokens_reason = row['tokens_reasoning'] or 0
        tokens_cache_r = row['tokens_cache_read'] or 0
        tokens_cache_w = row['tokens_cache_write'] or 0
        cost = float(row['cost'] or 0)
        time_created = row['time_created'] or 0

        if cost > 0:
            estimated_cost = round(cost, 6)
            notes = f"model={model_id} rates_at=recorded"
        elif model_id in RATES:
            estimated_cost = 0.0
            notes = f"model={model_id} rates_at=published_free_tier_0"
        else:
            estimated_cost = round((tokens_in + tokens_out + tokens_reason + tokens_cache_r + tokens_cache_w) * 0.001 / 1_000_000, 6)
            notes = f"model={model_id} rates_at=estimated_claudex"

        # Aggregate per product total
        product = suite
        pt = product_totals[product]
        pt["tokens_in"] += tokens_in
        pt["tokens_out"] += tokens_out
        pt["cost"] += estimated_cost
        pt["count"] += 1

        lines.append(f"{suite},{time_created},{model_id},{tokens_in},{tokens_out},{tokens_reason},{tokens_cache_r},{tokens_cache_w},{estimated_cost},{notes}")

for l in lines:
    print(l)

# Per-product totals section (for dashboard display)
print("")
print("# Per-product total costs (for dashboard)")
print("product,total_tokens_in,total_tokens_out,session_count,total_cost_estimate_usd")
for product in sorted(product_totals):
    pt = product_totals[product]
    print(f"{product},{pt['tokens_in']},{pt['tokens_out']},{pt['count']},{round(pt['cost'],6)}")
PYEOF

echo "COSTS.csv written to $COSTS_FILE"
wc -l "$COSTS_FILE"