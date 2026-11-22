#!/usr/bin/env python3
"""Validate promises.tsv: date format YYYY-MM-DD HH:MM, column count, no ISO 'T' separator."""

import sys
import re

def validate(filepath):
    errors = []
    warnings = []

    with open(filepath, 'r') as f:
        lines = f.readlines()

    if not lines:
        errors.append("File is empty")
        return errors, warnings

    # Check header
    header = lines[0].strip()
    if header.startswith('# id'):
        lines = lines[1:]  # skip header
    else:
        errors.append("Missing expected header line starting with '# id'")
        return errors, warnings

    # Expected column count: 4 (id, due, check, what)
    expected_cols = 4

    for i, line in enumerate(lines, start=2):
        line = line.rstrip('\n')
        if not line.strip():
            continue  # skip blank lines

        parts = line.split('\t')
        if len(parts) < expected_cols:
            errors.append(f"Line {i}: expected {expected_cols} columns, got {len(parts)}: {line[:100]}")
            continue

        rec_id = parts[0]
        due_str = parts[1]

        # Validate date format: YYYY-MM-DD HH:MM (NO 'T' separator)
        if re.search(r'T', due_str):
            errors.append(f"Line {i}: ISO 'T' separator found in date field (should be space): {due_str}")
        elif not re.match(r'^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$', due_str):
            errors.append(f"Line {i}: invalid date format (expected YYYY-MM-DD HH:MM): {due_str}")

        # Validate column count consistency
        if len(parts) > expected_cols:
            warnings.append(f"Line {i}: extra columns beyond {expected_cols}: {line[:100]}")

    if errors:
        return errors, warnings
    return errors, warnings

if __name__ == '__main__':
    if len(sys.argv) != 2:
        print(f"Usage: {sys.argv[0]} <promises.tsv filepath>", file=sys.stderr)
        sys.exit(1)
    errors, warnings = validate(sys.argv[1])
    if errors:
        for e in errors:
            print(f"ERROR: {e}", file=sys.stderr)
    else:
        print("All promises.tsv entries valid.")
    sys.exit(1 if errors else 0)