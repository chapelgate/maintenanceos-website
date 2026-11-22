#!/usr/bin/env bash
# add-promise.sh - add a promise to promises.tsv with flock, id computation, validation
# Usage: add-promise.sh <due> <check> <what>
#   due    : YYYY-MM-DD HH:MM
#   check  : file:<path> | glob:<pattern> | unit-ran:<unit>
#   what   : description of promise
set -euo pipefail

H='/home/andy/chapelgate'
P="$H/dell-services/call-accountability/promises.tsv"
LOCK="$H/dell-services/call-accountability/promises.tsv.lock"

if [ "$#" -ne 3 ]; then
  echo "Usage: $0 <due YYYY-MM-DD HH:MM> <check> <what>" >&2
  exit 1
fi

due="$1"
check="$2"
what="$3"

exec 9>"$LOCK"
flock 9

# Compute max id + 1
max_id=0
while IFS= read -r line; do
  if [[ "$line" =~ ^D([0-9]+)[[:space:]] ]]; then
    id_num="${BASH_REMATCH[1]}"
    if [ "$id_num" -gt "$max_id" ]; then
      max_id="$id_num"
    fi
  fi
done < "$P"

new_id=$((max_id + 1))
new_id_padded="D$(printf '%03d' "$new_id")"

# Validate date format YYYY-MM-DD HH:MM (no T separator)
if [[ ! "$due" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}[[:space:]][0-9]{2}:[0-9]{2}$ ]]; then
  echo "ERROR: invalid date format '$due' (expected YYYY-MM-DD HH:MM)" >&2
  exit 1
fi

# Validate no T separator
if [[ "$due" == *T* ]]; then
  echo "ERROR: ISO 'T' separator found in date field: $due" >&2
  exit 1
fi

# Validate 4 tab-separated fields
printf '%s\t%s\t%s\t%s\n' "$new_id_padded" "$due" "$check" "$what" > /tmp/promise-candidate.tsv
fields=$(awk -F'\t' '{print NF}' /tmp/promise-candidate.tsv)
if [ "$fields" -ne 4 ]; then
  echo "ERROR: expected 4 tab-separated fields, got $fields" >&2
  exit 1
fi

# Append to promises.tsv
printf '%s\t%s\t%s\t%s\n' "$new_id_padded" "$due" "$check" "$what" >> "$P"

# Run validate-promises.py
python3 "$H/dell-services/call-accountability/validate-promises.py" "$P"

exec 9>&-
