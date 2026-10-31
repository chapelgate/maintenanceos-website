import argparse
import json
import shutil
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parent


MUTATIONS = {
    "critical-latch-bypass": {
        "file": "safety_controls.py",
        "old": "def critical_safety_active(session, work_order_id: int) -> bool:\n    with session.no_autoflush:\n        work_order = session.get(WorkOrder, work_order_id)\n        state = session.get(CriticalSafetyState, work_order_id)\n    return bool((state and state.active) or (work_order and _flags(work_order.safety_flags)))\n",
        "new": "def critical_safety_active(session, work_order_id: int) -> bool:\n    return False\n",
        "pytest": ["tests/test_lifecycle_integrity.py", "tests/test_acceptance_local.py::test_at39_unresolved_critical_case_cannot_progress_or_close"],
        "harness": True,
    },
    "false-action-bypass": {
        "file": "voice_policy.py",
        "old": "def detect_action_claims(text: str) -> set[str]:\n    text = text or \"\"\n    claims = set()\n",
        "new": "def detect_action_claims(text: str) -> set[str]:\n    return set()\n    text = text or \"\"\n    claims = set()\n",
        "pytest": ["tests/test_voice_action_claims.py", "tests/test_acceptance_local.py::test_unverified_action_claim_audio_is_never_sent_and_transfers"],
        "harness": True,
    },
    "tenant-filter-bypass": {
        "file": "export_csv.py",
        "old": "rows=s.query(WorkOrder).filter_by(client_id=client_id).order_by(WorkOrder.id).all()",
        "new": "rows=s.query(WorkOrder).order_by(WorkOrder.id).all()",
        "pytest": ["tests/test_tenant_isolation_extended.py::test_work_order_export_requires_and_filters_tenant"],
        "harness": False,
    },
    "approval-rbac-bypass": {
        "file": "operations.py",
        "old": "return user if user and user.active and user.client_id==client_id and user.role in roles else None",
        "new": "return user if user and user.active else None",
        "pytest": ["tests/test_lifecycle_integrity.py::test_approval_rejection_requires_role_reason_and_audit", "tests/test_lifecycle_integrity.py::test_identity_hold_requires_authorised_reason_before_progression"],
        "harness": False,
    },
}


def ignore(_dir, names):
    ignored = {".venv", ".pytest_cache", "__pycache__", "evidence", ".codex"}
    return {name for name in names if name in ignored or name.startswith(".codex_disposable_")}


def copy_source(destination: Path) -> None:
    shutil.copytree(ROOT, destination, ignore=ignore)


def apply_mutation(workspace: Path, mutation: dict) -> str:
    target = workspace / mutation["file"]
    original = target.read_text(encoding="utf-8")
    if mutation["old"] not in original:
        raise RuntimeError(f"Mutation target not found in {mutation['file']}")
    mutated = original.replace(mutation["old"], mutation["new"], 1)
    target.write_text(mutated, encoding="utf-8")
    return f"--- {mutation['file']}\n+++ {mutation['file']} mutated\n@@\n-{mutation['old']}+{mutation['new']}"


def run_command(workspace: Path, args: list[str], stdout: Path, stderr: Path) -> int:
    with stdout.open("w", encoding="utf-8") as out, stderr.open("w", encoding="utf-8") as err:
        process = subprocess.run(args, cwd=workspace, stdout=out, stderr=err, text=True)
    return process.returncode


def run(output_dir: Path, python: str) -> dict:
    output_dir.mkdir(parents=True, exist_ok=True)
    results = []
    scenario_input = ROOT / "evidence" / "local-engineering-20260906-233336" / "acceptance-results.json"
    for name, mutation in MUTATIONS.items():
        mutation_dir = output_dir / name
        workspace = mutation_dir / "workspace"
        mutation_dir.mkdir(parents=True, exist_ok=True)
        copy_source(workspace)
        diff = apply_mutation(workspace, mutation)
        (mutation_dir / "mutation.diff").write_text(diff, encoding="utf-8")
        pytest_stdout = mutation_dir / "pytest.stdout.txt"
        pytest_stderr = mutation_dir / "pytest.stderr.txt"
        pytest_exit = run_command(
            workspace,
            [python, "-m", "pytest", "-q", *mutation["pytest"]],
            pytest_stdout,
            pytest_stderr,
        )
        harness_exit = None
        if mutation["harness"]:
            harness_stdout = mutation_dir / "harness.stdout.txt"
            harness_stderr = mutation_dir / "harness.stderr.txt"
            harness_exit = run_command(
                workspace,
                [
                    python,
                    "local_acceptance_harness.py",
                    "--input",
                    str(scenario_input),
                    "--output",
                    str(mutation_dir / "harness-results.json"),
                    "--stop-on-hard-failure",
                ],
                harness_stdout,
                harness_stderr,
            )
        detected = pytest_exit != 0 or (harness_exit is not None and harness_exit != 0)
        results.append(
            {
                "mutation": name,
                "pytest_exit_code": pytest_exit,
                "harness_exit_code": harness_exit,
                "detected": detected,
                "disposable_workspace": str(workspace),
            }
        )
    summary = {
        "generated_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "mutations": results,
        "passed": all(item["detected"] for item in results),
        "disposable_copies_only": True,
        "external_calls_permitted": False,
        "realtime_voice_enabled": False,
    }
    (output_dir / "mutation-summary.json").write_text(json.dumps(summary, indent=2, sort_keys=True), encoding="utf-8")
    return summary


def main() -> int:
    parser = argparse.ArgumentParser(description="Run local mutation-detection probes in disposable copies.")
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--python", default=sys.executable)
    args = parser.parse_args()
    summary = run(args.output_dir, args.python)
    print("Mutation detection:", "PASS" if summary["passed"] else "FAIL")
    return 0 if summary["passed"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
