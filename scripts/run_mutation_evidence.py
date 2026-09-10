import argparse
import json
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path


EXCLUDE_DIRS = {".venv", "evidence", ".pytest_cache", "__pycache__"}
EXCLUDE_FILES = {".env", "maintenanceos_v1.db"}

MUTATIONS = {
    "critical-latch-bypass": {
        "file": "safety_controls.py",
        "old": "return bool((state and state.active) or (work_order and _flags(work_order.safety_flags)))",
        "new": "return False",
        "pytest": ["tests/test_lifecycle_integrity.py", "tests/test_state_machine.py", "tests/test_acceptance_local.py", "tests/test_red_team_corpus.py", "-q"],
        "harness": True,
    },
    "false-action-bypass": {
        "file": "voice_policy.py",
        "old": "    unverified_claims = detect_action_claims(text) - set(verified_actions or ())\n    if unverified_claims:\n        return False, \"unverified_action_confirmation:\" + \",\".join(sorted(unverified_claims))\n    return True, \"\"",
        "new": "    return True, \"\"",
        "pytest": ["tests/test_voice_action_claims.py", "tests/test_voice_bridge.py", "tests/test_acceptance_local.py", "-q"],
        "harness": True,
    },
    "tenant-filter-bypass": {
        "file": "export_csv.py",
        "old": "rows=s.query(WorkOrder).filter_by(client_id=client_id).order_by(WorkOrder.id).all()",
        "new": "rows=s.query(WorkOrder).order_by(WorkOrder.id).all()",
        "pytest": ["tests/test_tenant_isolation_extended.py", "tests/test_api_boundaries.py", "-q"],
        "harness": False,
    },
    "approval-rbac-bypass": {
        "file": "operations.py",
        "old": "return user if user and user.active and user.client_id==client_id and user.role in roles else None",
        "new": "return user if user and user.active else None",
        "pytest": ["tests/test_contractor_operations.py", "tests/test_tenant_isolation_extended.py", "tests/test_lifecycle_integrity.py", "-q"],
        "harness": False,
    },
}


def copy_source(root: Path, destination: Path) -> None:
    def ignore(directory, names):
        ignored = []
        for name in names:
            path = Path(directory) / name
            if path.is_dir() and name in EXCLUDE_DIRS:
                ignored.append(name)
            elif name in EXCLUDE_FILES or name.endswith(".pyc"):
                ignored.append(name)
        return ignored

    shutil.copytree(root, destination, ignore=ignore)


def mutate(workspace: Path, spec: dict) -> str:
    path = workspace / spec["file"]
    text = path.read_text(encoding="utf-8")
    if spec["old"] not in text:
        raise RuntimeError(f"Mutation anchor not found in {spec['file']}")
    mutated = text.replace(spec["old"], spec["new"], 1)
    path.write_text(mutated, encoding="utf-8", newline="")
    return "\n".join([
        f"--- {spec['file']}",
        f"+++ {spec['file']} (mutated)",
        f"-{spec['old']}",
        f"+{spec['new']}",
        "",
    ])


def run_command(command, cwd: Path, stdout_path: Path) -> int:
    process = subprocess.run(
        command,
        cwd=str(cwd),
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
    )
    stdout_path.write_text(process.stdout, encoding="utf-8")
    return process.returncode


def main():
    parser = argparse.ArgumentParser(description="Run local mutation evidence in disposable source copies.")
    parser.add_argument("--root", type=Path, default=Path.cwd())
    parser.add_argument("--evidence-dir", type=Path, required=True)
    parser.add_argument("--python", default=sys.executable)
    parser.add_argument("--scenario-input", type=Path)
    args = parser.parse_args()

    root = args.root.resolve()
    evidence_dir = args.evidence_dir.resolve()
    mutation_root = evidence_dir / "mutations-current"
    mutation_root.mkdir(parents=True, exist_ok=True)
    results = {
        "generated_at_local": datetime.now().isoformat(timespec="seconds"),
        "root": str(root),
        "disposable_only": True,
        "mutations": {},
    }
    for name, spec in MUTATIONS.items():
        case_dir = mutation_root / name
        workspace = case_dir / "workspace"
        if case_dir.exists():
            shutil.rmtree(case_dir)
        case_dir.mkdir(parents=True)
        copy_source(root, workspace)
        diff = mutate(workspace, spec)
        (case_dir / "mutation.diff").write_text(diff, encoding="utf-8")
        pytest_output = case_dir / "mutation-test-output.txt"
        exit_code = run_command([args.python, "-m", "pytest", *spec["pytest"]], workspace, pytest_output)
        (case_dir / "mutation-exit-code.txt").write_text(f"{exit_code}\n", encoding="ascii")
        case_result = {
            "pytest_exit_code": exit_code,
            "pytest_detected_mutation": exit_code != 0,
            "pytest_output": str(pytest_output.relative_to(evidence_dir)),
            "mutation_diff": str((case_dir / "mutation.diff").relative_to(evidence_dir)),
        }
        if spec["harness"]:
            harness_json = case_dir / "harness-mutation-results.json"
            harness_summary = case_dir / "harness-mutation-summary.txt"
            harness_input = args.scenario_input.resolve() if args.scenario_input else None
            command = [
                args.python,
                "acceptance_harness.py",
                "--json-output",
                str(harness_json),
                "--summary-output",
                str(harness_summary),
                "--stop-on-hard-failure",
            ]
            if harness_input:
                command.extend(["--input", str(harness_input)])
            harness_exit = run_command(command, workspace, case_dir / "harness-mutation-output.txt")
            (case_dir / "harness-exit-code.txt").write_text(f"{harness_exit}\n", encoding="ascii")
            case_result["harness_exit_code"] = harness_exit
            case_result["harness_detected_mutation"] = harness_exit != 0
        results["mutations"][name] = case_result

    detected = all(
        item["pytest_detected_mutation"] and item.get("harness_detected_mutation", True)
        for item in results["mutations"].values()
    )
    results["detected_mutations"] = sum(
        1 for item in results["mutations"].values()
        if item["pytest_detected_mutation"] and item.get("harness_detected_mutation", True)
    )
    results["total_mutations"] = len(MUTATIONS)
    results["passed"] = detected
    (evidence_dir / "mutation-summary-current.json").write_text(json.dumps(results, indent=2), encoding="utf-8")
    raise SystemExit(0 if detected else 1)


if __name__ == "__main__":
    main()
