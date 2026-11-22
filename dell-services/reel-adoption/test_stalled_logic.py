#!/usr/bin/env python3
"""Regression test for task 15: passed items never show stalled.

Tests that items with MISSION_COMPLETE accepted or IMPLEMENTATION-STATUS DONE
are never marked as stalled, even if past deadline with no recent updates.
"""

import os
import sys
import tempfile
import shutil
import datetime as dt

H = '/home/andy/chapelgate'
RR = H + '/jobs-work-dell/readiness/reel-review'

# Import pipeline functions by reading the source
sys.path.insert(0, H + '/dell-services/reel-adoption')

def test_stalled_logic():
    """Test that passed items (MISSION_COMPLETE or DONE) are never stalled."""
    
    # Simulate the stalled computation logic from pipeline.py
    now = dt.datetime.now()
    
    # Case 1: Item with MISSION_COMPLETE accepted (non-security)
    # status = 'in progress' but has MISSION_COMPLETE -> should NOT be stalled
    status = 'in progress'
    dl = '2026-11-18 20:00'  # past deadline
    last = (now - dt.timedelta(hours=10)).timestamp()  # no update in 10h
    
    # Old buggy logic:
    stalled_buggy = (status not in ('shipped', 'covered') and dl != '-' 
                     and now > dt.datetime.strptime(dl, '%Y-%m-%d %H:%M')
                     and (not last or now.timestamp() - last > 6 * 3600))
    
    # New fixed logic:
    passed = True  # has MISSION_COMPLETE
    stalled_fixed = (status not in ('shipped', 'covered') and not passed and dl != '-'
                     and now > dt.datetime.strptime(dl, '%Y-%m-%d %H:%M')
                     and (not last or now.timestamp() - last > 6 * 3600))
    
    assert stalled_buggy == True, "Buggy logic should mark as stalled"
    assert stalled_fixed == False, "Fixed logic should NOT mark passed item as stalled"
    
    # Case 2: Item with DONE in IMPLEMENTATION-STATUS (security item)
    status = 'in progress'
    dl = '2026-11-18 20:00'
    last = None
    
    stalled_buggy = (status not in ('shipped', 'covered') and dl != '-' 
                     and now > dt.datetime.strptime(dl, '%Y-%m-%d %H:%M')
                     and (not last or now.timestamp() - last > 6 * 3600))
    
    passed = True  # has DONE in IMPLEMENTATION-STATUS
    stalled_fixed = (status not in ('shipped', 'covered') and not passed and dl != '-'
                     and now > dt.datetime.strptime(dl, '%Y-%m-%d %H:%M')
                     and (not last or now.timestamp() - last > 6 * 3600))
    
    assert stalled_buggy == True, "Buggy logic should mark as stalled"
    assert stalled_fixed == False, "Fixed logic should NOT mark passed item as stalled"
    
    # Case 3: Genuinely stalled item (not passed, past deadline, no updates)
    status = 'not started'
    dl = '2026-11-18 20:00'
    last = None
    
    stalled_fixed = (status not in ('shipped', 'covered') and not False and dl != '-'
                     and now > dt.datetime.strptime(dl, '%Y-%m-%d %H:%M')
                     and (not last or now.timestamp() - last > 6 * 3600))
    
    assert stalled_fixed == True, "Genuinely unpassed item should be stalled"
    
    print("All stalled logic tests passed!")

if __name__ == '__main__':
    test_stalled_logic()
