"""Load gitignored `.env.local` from the plugin package root into os.environ."""
from __future__ import annotations

import os
import sys
from pathlib import Path

_PACKAGE_ROOT = Path(__file__).resolve().parent.parent
_ENV_FILE = _PACKAGE_ROOT / ".env.local"


def load_env_local() -> None:
    if not _ENV_FILE.is_file():
        return
    for raw in _ENV_FILE.read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip().strip('"').strip("'")
        if not key or os.environ.get(key, "").strip():
            continue
        os.environ[key] = value


def require_env(name: str) -> str:
    value = (os.environ.get(name) or "").strip()
    if value:
        return value
    print(
        f"ERROR: set {name} (or add it to {_ENV_FILE.name}; "
        f"see examples/local.env.example).",
        file=sys.stderr,
    )
    sys.exit(1)
