#!/usr/bin/env python3
"""Batch-convert Word/PDF under Technical Architecture SharePoint sync to Markdown.

Uses ParaDOCS venv libs (docx2python, pymupdf4llm). Text-only; YAML metadata front matter.
Resume-safe: skips when the target .md already exists.
"""
from __future__ import annotations

import json
import os
import re
import sys
import traceback
import zipfile
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

_SCRIPTS_DIR = Path(__file__).resolve().parent
if str(_SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS_DIR))
from _local_env import load_env_local, require_env

load_env_local()
SOURCE_ROOT = Path(require_env("PARAGON_TECH_ARCH_SOURCE"))
# Markdown corpus lives in Technical Documentation (not the MCP package).
OUT_ROOT = Path(require_env("PARAGON_TECH_ARCH_CORPUS"))
LOG_PATH = OUT_ROOT / "_convert_log.jsonl"
SUMMARY_PATH = OUT_ROOT / "_SUMMARY.txt"
EXTENSIONS = {".docx", ".docm", ".pdf", ".doc"}
SKIP_NAME_PREFIXES = ("~$",)  # Office lock files


def refresh_failures_list() -> None:
    """Keep _FAILURES.md / _failures.jsonl current for post-batch triage."""
    try:
        from update_failures_list import write_failures_report

        write_failures_report()
    except Exception:
        pass


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def yaml_quote(value: str) -> str:
    if value is None:
        value = ""
    value = str(value).replace("\r\n", "\n").replace("\r", "\n")
    value = value.replace("\\", "\\\\").replace('"', '\\"')
    value = value.replace("\n", "\\n")
    return f'"{value}"'


def write_front_matter(meta: dict[str, str], body: str) -> str:
    lines = ["---"]
    for key in ("author", "created_on", "last_edited", "last_editor", "source_file"):
        lines.append(f"{key}: {yaml_quote(meta.get(key, ''))}")
    lines.append("---")
    lines.append("")
    body = (body or "").strip()
    if body:
        lines.append(body)
        lines.append("")
    return "\n".join(lines)


def log_event(event: dict) -> None:
    event.setdefault("ts", utc_now())
    with LOG_PATH.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(event, ensure_ascii=False) + "\n")


def file_times(path: Path) -> tuple[str, str]:
    st = path.stat()
    created = datetime.fromtimestamp(st.st_ctime, tz=timezone.utc).strftime(
        "%Y-%m-%dT%H:%M:%SZ"
    )
    modified = datetime.fromtimestamp(st.st_mtime, tz=timezone.utc).strftime(
        "%Y-%m-%dT%H:%M:%SZ"
    )
    return created, modified


def normalize_dt(raw: str | None) -> str:
    if not raw:
        return ""
    s = str(raw).strip()
    if not s:
        return ""
    m = re.match(
        r"D:(\d{4})(\d{2})(\d{2})(\d{2})?(\d{2})?(\d{2})?",
        s,
    )
    if m:
        y, mo, d = m.group(1), m.group(2), m.group(3)
        hh = m.group(4) or "00"
        mm = m.group(5) or "00"
        ss = m.group(6) or "00"
        return f"{y}-{mo}-{d}T{hh}:{mm}:{ss}Z"
    if s.endswith("Z") or "+" in s[10:] or s.endswith("z"):
        return s.replace("z", "Z")
    if "T" in s:
        return s if s.endswith("Z") else s + ("Z" if len(s) == 19 else "")
    return s


def meta_from_docx(path: Path) -> dict[str, str]:
    created_fs, modified_fs = file_times(path)
    meta = {
        "author": "",
        "created_on": created_fs,
        "last_edited": modified_fs,
        "last_editor": "",
    }
    try:
        with zipfile.ZipFile(path) as zf:
            if "docProps/core.xml" not in zf.namelist():
                return meta
            root = ET.fromstring(zf.read("docProps/core.xml"))
    except Exception:
        return meta

    def text(tag: str) -> str:
        el = root.find(tag)
        return (el.text or "").strip() if el is not None else ""

    author = text("{http://purl.org/dc/elements/1.1/}creator")
    last_editor = text(
        "{http://schemas.openxmlformats.org/package/2006/metadata/core-properties}lastModifiedBy"
    )
    created = normalize_dt(text("{http://purl.org/dc/terms/}created"))
    modified = normalize_dt(text("{http://purl.org/dc/terms/}modified"))
    if author:
        meta["author"] = author
    if last_editor:
        meta["last_editor"] = last_editor
    if created:
        meta["created_on"] = created
    if modified:
        meta["last_edited"] = modified
    return meta


def meta_from_pdf(path: Path) -> dict[str, str]:
    created_fs, modified_fs = file_times(path)
    meta = {
        "author": "",
        "created_on": created_fs,
        "last_edited": modified_fs,
        "last_editor": "",
    }
    try:
        import fitz  # pymupdf

        doc = fitz.open(path)
        try:
            info = doc.metadata or {}
        finally:
            doc.close()
    except Exception:
        return meta
    author = (info.get("author") or "").strip()
    created = normalize_dt(info.get("creationDate") or info.get("created"))
    modified = normalize_dt(info.get("modDate") or info.get("modified"))
    if author:
        meta["author"] = author
    if created:
        meta["created_on"] = created
    if modified:
        meta["last_edited"] = modified
    return meta


def meta_from_doc_com(path: Path) -> dict[str, str]:
    created_fs, modified_fs = file_times(path)
    meta = {
        "author": "",
        "created_on": created_fs,
        "last_edited": modified_fs,
        "last_editor": "",
    }
    try:
        import win32com.client  # type: ignore

        word = win32com.client.DispatchEx("Word.Application")
        word.Visible = False
        word.DisplayAlerts = 0
        doc = word.Documents.Open(str(path), ReadOnly=True)
        try:
            props = doc.BuiltInDocumentProperties

            def prop(name: str) -> str:
                try:
                    return str(props(name).Value).strip()
                except Exception:
                    return ""

            author = prop("Author")
            last_editor = prop("Last Author")
            created = prop("Creation Date")
            modified = prop("Last Save Time")
            if author:
                meta["author"] = author
            if last_editor:
                meta["last_editor"] = last_editor
            if created:
                meta["created_on"] = normalize_dt(created)
            if modified:
                meta["last_edited"] = normalize_dt(modified)
        finally:
            doc.Close(False)
            word.Quit()
    except Exception:
        pass
    return meta


def extract_docx_text(path: Path) -> str:
    from docx2python import docx2python

    with docx2python(str(path)) as content:
        text = content.text or ""
    return text


def extract_pdf_text(path: Path) -> str:
    import fitz  # pymupdf

    doc = fitz.open(path)
    try:
        parts: list[str] = []
        for page in doc:
            parts.append(page.get_text("text") or "")
        return "\n\n".join(parts)
    finally:
        doc.close()


def extract_doc_text(path: Path) -> tuple[str, dict[str, str]]:
    import win32com.client  # type: ignore

    created_fs, modified_fs = file_times(path)
    meta = {
        "author": "",
        "created_on": created_fs,
        "last_edited": modified_fs,
        "last_editor": "",
    }
    word = win32com.client.DispatchEx("Word.Application")
    word.Visible = False
    word.DisplayAlerts = 0
    doc = word.Documents.Open(str(path), ReadOnly=True)
    try:
        props = doc.BuiltInDocumentProperties

        def prop(name: str) -> str:
            try:
                return str(props(name).Value).strip()
            except Exception:
                return ""

        author = prop("Author")
        last_editor = prop("Last Author")
        created = prop("Creation Date")
        modified = prop("Last Save Time")
        if author:
            meta["author"] = author
        if last_editor:
            meta["last_editor"] = last_editor
        if created:
            meta["created_on"] = normalize_dt(created)
        if modified:
            meta["last_edited"] = normalize_dt(modified)
        text = doc.Content.Text or ""
    finally:
        doc.Close(False)
        word.Quit()
    return text, meta


def out_path_for(src: Path) -> Path:
    rel = src.relative_to(SOURCE_ROOT)
    return OUT_ROOT / rel.with_suffix(".md")


def convert_one(src: Path) -> str:
    if any(src.name.startswith(p) for p in SKIP_NAME_PREFIXES):
        log_event({"status": "skipped", "reason": "temp_lock", "source": str(src)})
        return "skipped"

    dest = out_path_for(src)
    if dest.exists() and dest.stat().st_size > 0:
        log_event(
            {
                "status": "skipped",
                "reason": "exists",
                "source": str(src),
                "dest": str(dest),
            }
        )
        return "skipped"

    rel = src.relative_to(SOURCE_ROOT).as_posix()
    ext = src.suffix.lower()

    try:
        if ext in {".docx", ".docm"}:
            meta = meta_from_docx(src)
            body = extract_docx_text(src)
        elif ext == ".pdf":
            meta = meta_from_pdf(src)
            body = extract_pdf_text(src)
        elif ext == ".doc":
            log_event(
                {
                    "status": "skipped",
                    "reason": "skip_doc_no_com",
                    "source": str(src),
                }
            )
            return "skipped"
        else:
            log_event(
                {
                    "status": "skipped",
                    "reason": "unsupported",
                    "source": str(src),
                }
            )
            return "skipped"

        meta["source_file"] = rel
        md = write_front_matter(meta, body)
        dest.parent.mkdir(parents=True, exist_ok=True)
        tmp = dest.with_suffix(".md.tmp")
        tmp.write_text(md, encoding="utf-8", errors="replace")
        tmp.replace(dest)
        log_event(
            {
                "status": "ok",
                "source": str(src),
                "dest": str(dest),
                "chars": len(body),
                "author": meta.get("author", ""),
                "last_editor": meta.get("last_editor", ""),
            }
        )
        return "ok"
    except Exception as exc:
        log_event(
            {
                "status": "failed",
                "source": str(src),
                "dest": str(dest),
                "error": f"{type(exc).__name__}: {exc}",
                "traceback": traceback.format_exc()[-2000:],
            }
        )
        refresh_failures_list()
        return "failed"


def iter_sources() -> list[Path]:
    files: list[Path] = []
    for dirpath, _dirnames, filenames in os.walk(SOURCE_ROOT):
        for name in filenames:
            p = Path(dirpath) / name
            if p.suffix.lower() in EXTENSIONS:
                files.append(p)
    files.sort(key=lambda p: str(p).lower())
    return files


def main() -> int:
    OUT_ROOT.mkdir(parents=True, exist_ok=True)
    files = iter_sources()
    total = len(files)
    counts = {"ok": 0, "skipped": 0, "failed": 0}
    print(f"Found {total} Word/PDF files under {SOURCE_ROOT}", flush=True)
    print(f"Output: {OUT_ROOT}", flush=True)

    for i, src in enumerate(files, 1):
        status = convert_one(src)
        counts[status] = counts.get(status, 0) + 1
        if i % 25 == 0 or status == "failed" or i == total:
            print(
                f"[{i}/{total}] ok={counts['ok']} skipped={counts['skipped']} "
                f"failed={counts['failed']} last={src.name} ({status})",
                flush=True,
            )

    refresh_failures_list()
    summary = (
        f"Finished: {utc_now()}\n"
        f"Source: {SOURCE_ROOT}\n"
        f"Output: {OUT_ROOT}\n"
        f"Total candidates: {total}\n"
        f"ok: {counts['ok']}\n"
        f"skipped: {counts['skipped']}\n"
        f"failed: {counts['failed']}\n"
        f"Log: {LOG_PATH}\n"
        f"Failures list: {OUT_ROOT / '_FAILURES.md'}\n"
    )
    SUMMARY_PATH.write_text(summary, encoding="utf-8")
    print(summary, flush=True)
    return 0 if counts["failed"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
