#!/usr/bin/env python3
"""Rebuild _FAILURES.md and _failures.jsonl from convert/OCR logs."""
from __future__ import annotations

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path

_SCRIPTS_DIR = Path(__file__).resolve().parent
if str(_SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS_DIR))
from _local_env import load_env_local, require_env

load_env_local()
OUT_ROOT = Path(require_env("PARAGON_TECH_ARCH_CORPUS"))
SOURCE_ROOT = Path(require_env("PARAGON_TECH_ARCH_SOURCE"))
CONVERT_LOG = OUT_ROOT / "_convert_log.jsonl"
OCR_LOG = OUT_ROOT / "_ocr_log.jsonl"
FAILURES_MD = OUT_ROOT / "_FAILURES.md"
FAILURES_JSONL = OUT_ROOT / "_failures.jsonl"
UNAVAILABLE_JSON = OUT_ROOT / "_unavailable.json"


def _read_jsonl(path: Path) -> list[dict]:
    if not path.is_file():
        return []
    rows: list[dict] = []
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            rows.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    return rows


def _rel(source: str) -> str:
    try:
        return str(Path(source).relative_to(SOURCE_ROOT)).replace("\\", "/")
    except Exception:
        return source


def write_failures_report() -> tuple[int, int, int]:
    OUT_ROOT.mkdir(parents=True, exist_ok=True)
    convert_rows = _read_jsonl(CONVERT_LOG)
    ocr_rows = _read_jsonl(OCR_LOG)

    # Last log line per source wins so a later ok/exists resume clears earlier failures.
    latest_convert: dict[str, dict] = {}
    for row in convert_rows:
        src = row.get("source") or ""
        if src:
            latest_convert[src] = row

    failed: dict[str, dict] = {}
    deferred_doc: dict[str, dict] = {}
    for src, row in latest_convert.items():
        status = row.get("status")
        if status == "failed":
            failed[src] = row
        elif status == "skipped" and row.get("reason") == "skip_doc_no_com":
            deferred_doc[src] = row

    ocr_failed: dict[str, dict] = {}
    for row in ocr_rows:
        if row.get("status") == "failed":
            key = row.get("md") or row.get("source") or ""
            if key:
                ocr_failed[key] = row

    # Machine-readable unique convert failures
    with FAILURES_JSONL.open("w", encoding="utf-8") as fh:
        for src in sorted(failed.keys(), key=str.lower):
            fh.write(json.dumps(failed[src], ensure_ascii=False) + "\n")

    lines: list[str] = [
        "# Conversion failures",
        "",
        f"Generated: {datetime.now(timezone.utc).isoformat()}",
        f"Unique convert failures: {len(failed)}",
        f"Deferred legacy .doc (skipped): {len(deferred_doc)}",
        f"OCR failures: {len(ocr_failed)}",
        "",
        "Re-hydrate OneDrive/SharePoint online-only files (Always keep on this device),",
        "then re-run `scripts/convert_tech_arch_to_md.py` (resume-safe).",
        "",
        "## Convert failures",
        "",
        "| # | Type | Relative path | Error |",
        "| ---: | :--- | :--- | :--- |",
    ]
    for i, src in enumerate(sorted(failed.keys(), key=str.lower), 1):
        row = failed[src]
        ext = Path(src).suffix.lstrip(".").lower() or "?"
        rel = _rel(src).replace("|", "\\|")
        err = (row.get("error") or "").replace("|", "\\|").replace("\n", " ")
        if len(err) > 160:
            err = err[:157] + "..."
        lines.append(f"| {i} | {ext} | `{rel}` | {err} |")

    lines.extend(
        [
            "",
            "## Deferred (legacy .doc skipped - not hard failures)",
            "",
            f"Count: {len(deferred_doc)}",
            "",
        ]
    )
    for i, src in enumerate(sorted(deferred_doc.keys(), key=str.lower), 1):
        lines.append(f"{i}. `{_rel(src)}`")

    lines.extend(["", "## OCR failures", "", f"Count: {len(ocr_failed)}", ""])
    if not ocr_failed:
        lines.append("_None so far._")
    else:
        for key in sorted(ocr_failed.keys(), key=str.lower):
            err = ocr_failed[key].get("error") or ""
            lines.append(f"- `{key}`: {err}")

    lines.append("")
    FAILURES_MD.write_text("\n".join(lines), encoding="utf-8")

    # Compact index for MCP: title-match notices (not in corpus)
    unavailable: list[dict] = []
    seen_titles: set[str] = set()
    for src, row in sorted({**failed, **deferred_doc}.items(), key=lambda x: x[0].lower()):
        title = Path(src).stem
        key = title.casefold()
        if key in seen_titles:
            continue
        seen_titles.add(key)
        reason = "convert_failed"
        if row.get("status") == "skipped" and row.get("reason") == "skip_doc_no_com":
            reason = "legacy_doc_skipped"
        elif "Failed to open file" in (row.get("error") or ""):
            reason = "sharepoint_online_only"
        unavailable.append(
            {
                "title": title,
                "source_file": _rel(src),
                "reason": reason,
            }
        )
    UNAVAILABLE_JSON.write_text(
        json.dumps(
            {
                "generated": datetime.now(timezone.utc).isoformat(),
                "count": len(unavailable),
                "docs": unavailable,
            },
            indent=2,
            ensure_ascii=False,
        )
        + "\n",
        encoding="utf-8",
    )

    return len(failed), len(deferred_doc), len(ocr_failed)


def main() -> int:
    n_fail, n_doc, n_ocr = write_failures_report()
    print(
        f"Updated {FAILURES_MD} "
        f"(convert_failures={n_fail}, deferred_doc={n_doc}, ocr_failures={n_ocr})",
        flush=True,
    )
    print(f"Also wrote {FAILURES_JSONL}", flush=True)
    return 0


if __name__ == "__main__":
    sys.exit(main())
