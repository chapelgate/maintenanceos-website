"""Load contrib DigitalOcean adapter without requiring package install."""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path


def load_adapter():
    path = Path(__file__).resolve().parents[1] / "contrib" / "ush-digitalocean-adapter" / "digitalocean_adapter.py"
    name = "ush_do_adapter_contrib"
    spec = importlib.util.spec_from_file_location(name, path)
    assert spec and spec.loader
    mod = importlib.util.module_from_spec(spec)
    sys.modules[name] = mod
    spec.loader.exec_module(mod)
    return mod.DigitalOceanAdapter()
