#!/usr/bin/env bash
# Regression test for task 26/27: add-promise.sh with concurrent append test
# Tests: 2 writers, no duplicate IDs

set -euo pipefail

H='/home/andy/chapelgate'
P="$H/dell-services/call-accountability/promises.tsv"
SCRIPT="$H/dell-services/call-accountability/add-promise.sh"

# Backup original
cp "$P" /tmp/promises-test-backup.tsv

# Get IDs before test
ids_before=$(grep '^D[0-9]' "$P" | cut -f1 | sort -u)
count_before=$(echo "$ids_before" | grep -c '^D')
echo "IDs before: $count_before"

# Run two concurrent writers
"$SCRIPT" "2026-11-25 10:00" "file:factory-tasks/test-concurrent-1/out/RESULT.md" "concurrent test 1" &
"$SCRIPT" "2026-11-25 11:00" "file:factory-tasks/test-concurrent-2/out/RESULT.md" "concurrent test 2" &
wait

# Get IDs after test
ids_after=$(grep '^D[0-9]' "$P" | cut -f1 | sort -u)
count_after=$(echo "$ids_after" | grep -c '^D')
echo "IDs after: $count_after"

# Check that new IDs were added (should be 2 more)
new_ids_count=$((count_after - count_before))
if [ "$new_ids_count" -ne 2 ]; then
  echo "FAIL: Expected 2 new IDs, got $new_ids_count"
  # Restore before exit
  mv /tmp/promises-test-backup.tsv "$P"
  exit 1
fi

# Check that the 2 new IDs don't duplicate each other or existing ones
# Get the new IDs
new_ids=$(comm -13 <(echo "$ids_before") <(echo "$ids_after") | sort)
new_ids_list=$(echo "$new_ids" | tr '\n' ' ')
echo "New IDs: $new_ids_list"

new_count=$(echo "$new_ids" | grep -c '^D')
if [ "$new_count" -ne 2 ]; then
  echo "FAIL: Expected 2 unique new IDs, got $new_count"
  mv /tmp/promises-test-backup.tsv "$P"
  exit 1
fi

# Validate with validate-promises.py
python3 "$H/dell-services/call-accountability/validate-promises.py" "$P"

# Restore original
mv /tmp/promises-test-backup.tsv "$P"

echo "All concurrent write tests passed!"