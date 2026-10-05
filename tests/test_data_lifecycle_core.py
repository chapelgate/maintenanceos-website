from datetime import datetime, timedelta

import pytest

from data_lifecycle import (
    LifecycleHold,
    LifecyclePolicy,
    LifecyclePolicyError,
    LifecycleRecord,
    TenantLifecycleError,
    plan_lifecycle,
)


NOW = datetime(2030, 1, 31, 12, 0, 0)


def record(client_id=1, data_class="transcript", record_id="1", age_days=40, subject_id="resident-1"):
    return LifecycleRecord(
        client_id=client_id,
        data_class=data_class,
        record_id=record_id,
        reference_at=NOW - timedelta(days=age_days),
        subject_id=subject_id,
    )


def test_missing_retention_policy_fails_closed():
    with pytest.raises(LifecyclePolicyError, match="retention_missing:transcript"):
        plan_lifecycle(
            [record()],
            client_id=1,
            action="erasure",
            policy=LifecyclePolicy(retention={}),
            now=NOW,
        )


def test_policy_uses_only_caller_supplied_duration():
    rec = record(age_days=10)
    keep = plan_lifecycle(
        [rec], client_id=1, action="erasure",
        policy=LifecyclePolicy(retention={"transcript": timedelta(days=11)}), now=NOW,
    )
    erase = plan_lifecycle(
        [rec], client_id=1, action="erasure",
        policy=LifecyclePolicy(retention={"transcript": timedelta(days=9)}), now=NOW,
    )
    assert keep[0].action == "retain"
    assert erase[0].action == "erase"


def test_active_hold_blocks_erasure_but_not_export():
    rec = record()
    hold = LifecycleHold(client_id=1, scope="subject", scope_id="resident-1")
    erasure = plan_lifecycle(
        [rec], client_id=1, action="erasure",
        policy=LifecyclePolicy(retention={"transcript": timedelta(days=1)}),
        now=NOW, holds=[hold],
    )
    export = plan_lifecycle(
        [rec], client_id=1, action="export",
        policy=LifecyclePolicy(retention={}),
        now=NOW, holds=[hold],
    )
    assert (erasure[0].action, erasure[0].reason) == ("retain", "active_hold")
    assert export[0].action == "export"


def test_preservation_class_never_silently_erased():
    decision = plan_lifecycle(
        [record(data_class="safety_audit")],
        client_id=1,
        action="erasure",
        policy=LifecyclePolicy(
            retention={"safety_audit": timedelta(days=1)},
            preserve_classes=frozenset({"safety_audit"}),
        ),
        now=NOW,
    )[0]
    assert decision.action == "preserve_minimal"
    assert decision.reason == "preservation_class"


def test_cross_tenant_record_fails_closed():
    with pytest.raises(TenantLifecycleError, match="cross_tenant_record"):
        plan_lifecycle(
            [record(client_id=2)],
            client_id=1,
            action="export",
            policy=LifecyclePolicy(retention={}),
            now=NOW,
        )


def test_other_tenant_hold_cannot_change_this_tenant_decision():
    decision = plan_lifecycle(
        [record(client_id=1)],
        client_id=1,
        action="erasure",
        policy=LifecyclePolicy(retention={"transcript": timedelta(days=1)}),
        now=NOW,
        holds=[LifecycleHold(client_id=2, scope="tenant", scope_id="2")],
    )[0]
    assert decision.action == "erase"


def test_output_order_is_stable_by_class_then_record_id():
    records = [
        record(data_class="zeta", record_id="2"),
        record(data_class="alpha", record_id="9"),
        record(data_class="alpha", record_id="1"),
    ]
    decisions = plan_lifecycle(
        records,
        client_id=1,
        action="export",
        policy=LifecyclePolicy(retention={}),
        now=NOW,
    )
    assert [(x.data_class, x.record_id) for x in decisions] == [
        ("alpha", "1"),
        ("alpha", "9"),
        ("zeta", "2"),
    ]
