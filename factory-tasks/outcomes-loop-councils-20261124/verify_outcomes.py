#!/usr/bin/env python3
"""verify_outcomes.py - Verify hash chain and OUTCOME.json validity for council outcomes.

Run by council-outcomes.timer and council-outcomes-weekly.timer first.
On failure: append loud 'COUNCIL OUTCOMES CHAIN BROKEN' to FAILURE-LOG.md and refuse
to compute or report accuracy.
STEER.md §4d requirement.
"""
import os, sys, json, hashlib, datetime, subprocess

C = '/home/andy/chapelgate'
OUT = os.path.join(C, 'jobs-work-dell', 'readiness')
TSV = os.path.join(OUT, 'COUNCIL-OUTCOMES.tsv')
FAILURE_LOG = os.path.join(OUT, 'FAILURE-LOG.md')
BRIEF = os.path.join(C, 'factory-tasks', 'outcomes-loop-councils-20261124', 'BRIEF.md')
GENESIS_HASH = hashlib.sha256("chapelgate-council-outcomes-genesis".encode()).hexdigest()


def verify_hash_chain():
    """Verify the hash chain integrity of COUNCIL-OUTCOMES.tsv.
    
    Returns (valid, error_message, head_hash_or_None)
    """
    if not os.path.exists(TSV):
        return False, "COUNCIL-OUTCOMES.tsv does not exist", None
    
    with open(TSV, 'r') as f:
        lines = [l.strip() for l in f if l.strip()]
    
    if not lines:
        return False, "COUNCIL-OUTCOMES.tsv is empty", None
    
    prev_hash = GENESIS_HASH
    start_idx = 0
    
    # Skip genesis line if present
    if lines[0].startswith('genesis|'):
        # Genesis line: genesis|<hash>
        genesis_parts = lines[0].split('|', 1)
        if len(genesis_parts) == 2:
            try:
                prev_hash = genesis_parts[1]
            except:
                pass
        start_idx = 1
    
    for i, line in enumerate(lines[start_idx:], start=start_idx):
        parts = line.rsplit('|', 1)
        if len(parts) != 2:
            return False, f"Line {i+1}: malformed (expected content|hash format)", None
        
        row_content, row_hash = parts
        
        # Verify hash: sha256(prev_hash + row_content)
        expected_hash = hashlib.sha256((prev_hash + row_content).encode()).hexdigest()
        
        if row_hash != expected_hash:
            return False, f"Line {i+1}: hash mismatch (expected {expected_hash[:16]}..., got {row_hash[:16]}...", None
        
        prev_hash = row_hash
    
    return True, "OK", prev_hash


def verify_outcome_json(council_out_dir):
    """Verify that OUTCOME.json exists and is valid JSON in a council output directory."""
    outcome_path = os.path.join(council_out_dir, 'OUTCOME.json')
    if not os.path.exists(outcome_path):
        return False, f"OUTCOME.json not found at {outcome_path}"
    
    try:
        with open(outcome_path, 'r') as f:
            data = json.load(f)
        # Check required fields per BRIEF.md §1
        required = ['decision', 'tier', 'sha', 'evidence', 'reviewers', 'decided_at']
        for field in required:
            if field not in data:
                return False, f"OUTCOME.json missing required field: {field}"
        return True, "Valid OUTCOME.json"
    except json.JSONDecodeError as e:
        return False, f"OUTCOME.json invalid JSON: {e}"
    except Exception as e:
        return False, f"OUTCOME.json read error: {e}"


def log_chain_broken(reason):
    """Append loud 'COUNCIL OUTCOMES CHAIN BROKEN' entry to FAILURE-LOG.md."""
    ts = datetime.datetime.now().isoformat()
    with open(FAILURE_LOG, 'a') as f:
        f.write(f"\n- {ts} | verify_outcomes.py | COUNCIL OUTCOMES CHAIN BROKEN: {reason} | verify-on-read failed, refusing accuracy computation\n")


def main():
    """Main entry point. Returns 0 if verification passes, 1 if fails."""
    # Check COUNCIL-OUTCOMES.tsv chain
    if os.path.exists(TSV):
        valid, msg, head_hash = verify_hash_chain()
        if not valid:
            log_chain_broken(msg)
            print(f"VERIFICATION FAILED: {msg}")
            sys.exit(1)
        print(f"Chain verified OK. Head: {head_hash[:16]}...")
    else:
        # No TSV yet - that's OK for fresh start, but create genesis marker
        with open(TSV, 'w') as f:
            f.write(f"genesis|{GENESIS_HASH}\n")
        print("Created genesis COUNCIL-OUTCOMES.tsv")
    
    # Check OUTCOME.json in council output directories
    # Only scan directories that are under jobs-work-dell/readiness and have OUTCOME.json or VERDICT.md
    import fnmatch
    council_dirs = []
    
    # Walk the OUT directory looking for council outcome directories
    # Criteria: has OUTCOME.json, or has VERDICT.md + has a related SHA pattern
    for root, dirs, files in os.walk(OUT):
        # Skip .git and known non-council paths
        skip_dirs = ['.git', 'reel-review', 'reel-adoption', 'reel-cleaner', 
                     'reel-implement', 'reel-monitor', 'reel-review', 'videos',
                     'security', 'tools-councils', 'tools-review-v2', 'tenders',
                     'tender-drafts', 'tender-library', 'cso-fix-business-evidence-wallet-open-findings-20261121']
        if any(s in root.split('/') for s in skip_dirs):
            dirs.clear()
            continue
        
        # Check if this directory has OUTCOME.json
        if 'OUTCOME.json' in files:
            # Exclude known non-council test dirs
            exclude_parts = ['compliance', 'sales', 'model-preflight', 'model-scout',
                            'model-health', 'model-scout/staging', 'auto-heal', 'mc-benchmark',
                            'focus3-parked-list', 'completion-anomaly', 'copy-guard',
                            'board-standing', 'onboard-prompt', 'ask-ai', 'prompt-compress',
                            'adoption-diff', 'eggbot-watchdog', 'prompt-compress', 
                            'shop', 'spdc-archive', 'trial-sandbox']
            if any(ex in root for ex in exclude_parts):
                # Still include if it has OUTCOME.json and looks like a council dir
                pass
            
            council_dirs.append(root)
        
        # Also include directories with VERDICT.md (they may need OUTCOME.json check)
        if 'VERDICT.md' in files:
            council_dirs.append(root)
    
    # Deduplicate
    seen = set()
    council_dirs = [d for d in council_dirs if not (d in seen or seen.add(d))]
    
    # Check each unique directory for OUTCOME.json validity
    for council_dir in council_dirs:
        # Only check OUTCOME.json if it exists in this directory
        outcome_path = os.path.join(council_dir, 'OUTCOME.json')
        if os.path.exists(outcome_path):
            outcome_valid, outcome_msg = verify_outcome_json(council_dir)
            if not outcome_valid:
                # Back up as .bak-outcomes-loop-<ts>
                import shutil
                ts2 = datetime.datetime.now().strftime('%Y%m%d-%H%M%S')
                bak = council_dir + f'.bak-outcomes-loop-{ts2}'
                try:
                    shutil.copytree(council_dir, bak)
                    print(f"Backed up {council_dir} to {bak}")
                except Exception as e:
                    print(f"Backup failed: {e}")
                
                # py_compile check on check.py (brief §1 says back up as .bak-outcomes-loop-<ts>, py_compile, atomic mv)
                check_py = os.path.join(council_dir, 'check.py')
                if os.path.exists(check_py):
                    bak_check = bak + '/check.py'
                    import py_compile
                    try:
                        py_compile.compile(check_py, bak_check + '.pyc', doraise=True)
                        print(f"Compiled check.py to {bak_check}.pyc")
                    except Exception as e:
                        print(f"py_compile failed: {e}")
                
                # Log the failure
                log_chain_broken(f"OUTCOME.json invalid in {council_dir}: {outcome_msg}")
                print(f"VERIFICATION FAILED in {council_dir}: {outcome_msg}")
                sys.exit(1)
    
    print("All council outcomes verified successfully")
    sys.exit(0)


if __name__ == '__main__':
    main()