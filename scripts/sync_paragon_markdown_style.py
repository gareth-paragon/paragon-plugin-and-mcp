#!/usr/bin/env python3
"""Sync bundled Paragon_Markdown_Style_Rules.md from GitLab cursor-test (canonical).

Usage:
  python scripts/sync_paragon_markdown_style.py
  python scripts/sync_paragon_markdown_style.py --check   # exit 1 if drift
  python scripts/sync_paragon_markdown_style.py --dry-run

Source resolution (first that exists):
  1. PARAGON_CURSOR_DOCS_ROOT / Paragon_Markdown_Style_Rules.md
  2. Sibling ../cursor-test/Paragon_Markdown_Style_Rules.md relative to this repo
"""
from __future__ import annotations

import argparse
import hashlib
import os
import shutil
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[1]
DEST = REPO_ROOT / "docs" / "Paragon_Markdown_Style_Rules.md"
CANONICAL_NAME = "Paragon_Markdown_Style_Rules.md"


def resolve_source() -> Path | None:
    env_root = (os.environ.get("PARAGON_CURSOR_DOCS_ROOT") or "").strip()
    candidates: list[Path] = []
    if env_root:
        candidates.append(Path(env_root) / CANONICAL_NAME)
    candidates.append(REPO_ROOT.parent / "cursor-test" / CANONICAL_NAME)
    for path in candidates:
        if path.is_file():
            return path.resolve()
    return None


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check",
        action="store_true",
        help="Exit 0 if bundled copy matches source; 1 if missing or drifted",
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Report what would change without writing",
    )
    args = parser.parse_args()

    source = resolve_source()
    if source is None:
        print(
            "ERROR: canonical style guide not found. Set PARAGON_CURSOR_DOCS_ROOT "
            "to the cursor-test clone, or place cursor-test as a sibling of this repo.",
            file=sys.stderr,
        )
        return 2

    src_hash = sha256_file(source)
    dest_exists = DEST.is_file()
    dest_hash = sha256_file(DEST) if dest_exists else None

    print(f"Source: {source}")
    print(f"Dest:   {DEST}")
    print(f"Source SHA256: {src_hash}")
    if dest_exists:
        print(f"Dest   SHA256: {dest_hash}")
    else:
        print("Dest: (missing)")

    in_sync = dest_exists and dest_hash == src_hash

    if args.check:
        if in_sync:
            print("OK: bundled style guide matches cursor-test.")
            return 0
        print("DRIFT: bundled style guide differs from cursor-test (or is missing).")
        return 1

    if in_sync:
        print("Already in sync; nothing to do.")
        return 0

    if args.dry_run:
        print("Dry-run: would copy source -> dest.")
        return 0

    DEST.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, DEST)
    print(f"Copied. New dest SHA256: {sha256_file(DEST)}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
