"""Bundled ParaDOCS text conversion (Word/PDF → Markdown).

Text-only rip suitable for MCP convert tools. Does not require Word COM or
external paradocs.py. Legacy .doc files are skipped unless Word COM is present.
"""
from __future__ import annotations

import json
import os
import re
import traceback
import zipfile
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

EXTENSIONS = {".docx", ".docm", ".pdf", ".doc"}
SKIP_NAME_PREFIXES = ("~$",)


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def yaml_quote(value: str) -> str:
    if value is None:
        value = ""
    value = str(value).replace("\r\n", "\n").replace("\r", "\n")
    value = value.replace("\\", "\\\\").replace('"', '\\"')
    value = value.replace("\n", "\\n")
    return f'"{value}"'


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


def file_times(path: Path) -> tuple[str, str]:
    st = path.stat()
    created = datetime.fromtimestamp(st.st_ctime, tz=timezone.utc).strftime(
        "%Y-%m-%dT%H:%M:%SZ"
    )
    modified = datetime.fromtimestamp(st.st_mtime, tz=timezone.utc).strftime(
        "%Y-%m-%dT%H:%M:%SZ"
    )
    return created, modified


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


def write_front_matter(meta: dict[str, str], body: str, settings: dict[str, Any]) -> str:
    lines: list[str] = []
    if settings.get("document360_front_matter_enabled", True):
        lines.append("---")
        keys = ["author", "created_on", "last_edited", "last_editor", "source_file"]
        for key in keys:
            if key == "source_file" and not settings.get("document360_include_source_file", True):
                continue
            if key == "author" and not settings.get("document360_include_author", True):
                continue
            if key in ("created_on",) and not settings.get("document360_include_created", True):
                continue
            if key in ("last_edited", "last_editor") and not settings.get(
                "document360_include_last_updated", True
            ):
                continue
            lines.append(f"{key}: {yaml_quote(meta.get(key, ''))}")
        lines.append("---")
        lines.append("")
    body = (body or "").strip()
    if body:
        lines.append(body)
        lines.append("")
    return "\n".join(lines)


def resolve_output_path(src: Path, output: Path | None, output_dir: Path | None) -> Path:
    if output is not None:
        return output
    if output_dir is not None:
        return output_dir / f"{src.stem}.md"
    return src.with_suffix(".md")


def convert_one(
    src: Path,
    *,
    output: Path | None = None,
    output_dir: Path | None = None,
    source_root: Path | None = None,
    settings: dict[str, Any] | None = None,
    overwrite: bool = False,
) -> dict[str, Any]:
    settings = settings or {}
    if any(src.name.startswith(p) for p in SKIP_NAME_PREFIXES):
        return {
            "status": "skipped",
            "reason": "temp_lock",
            "source": str(src.resolve()),
        }

    dest = resolve_output_path(src, output, output_dir)
    if dest.exists() and dest.stat().st_size > 0 and not overwrite:
        return {
            "status": "skipped",
            "reason": "exists",
            "source": str(src.resolve()),
            "output": str(dest.resolve()),
        }

    ext = src.suffix.lower()
    if ext not in EXTENSIONS:
        return {
            "status": "skipped",
            "reason": "unsupported",
            "source": str(src.resolve()),
        }

    if ext == ".doc":
        return {
            "status": "skipped",
            "reason": "legacy_doc_unsupported",
            "source": str(src.resolve()),
            "message": "Legacy .doc requires Word COM; use .docx or convert offline.",
        }

    try:
        if ext in {".docx", ".docm"}:
            meta = meta_from_docx(src)
            body = extract_docx_text(src)
        elif ext == ".pdf":
            meta = meta_from_pdf(src)
            body = extract_pdf_text(src)
        else:
            return {
                "status": "skipped",
                "reason": "unsupported",
                "source": str(src.resolve()),
            }

        if source_root:
            try:
                rel = src.resolve().relative_to(source_root.resolve()).as_posix()
            except ValueError:
                rel = src.name
        else:
            rel = src.name
        meta["source_file"] = rel

        md = write_front_matter(meta, body, settings)
        dest.parent.mkdir(parents=True, exist_ok=True)
        tmp = dest.with_suffix(".md.tmp")
        tmp.write_text(md, encoding="utf-8", errors="replace")
        tmp.replace(dest)
        return {
            "status": "ok",
            "source": str(src.resolve()),
            "output": str(dest.resolve()),
            "chars": len(body),
            "author": meta.get("author", ""),
            "last_editor": meta.get("last_editor", ""),
        }
    except Exception as exc:
        return {
            "status": "failed",
            "source": str(src.resolve()),
            "output": str(dest.resolve()),
            "error": f"{type(exc).__name__}: {exc}",
            "traceback": traceback.format_exc()[-2000:],
        }


def iter_sources(root: Path, *, recursive: bool = True) -> list[Path]:
    files: list[Path] = []
    if root.is_file():
        if root.suffix.lower() in EXTENSIONS:
            files.append(root)
        return files
    if not root.is_dir():
        return files
    if recursive:
        for dirpath, _dirnames, filenames in os.walk(root):
            for name in filenames:
                p = Path(dirpath) / name
                if p.suffix.lower() in EXTENSIONS:
                    files.append(p)
    else:
        for p in root.iterdir():
            if p.is_file() and p.suffix.lower() in EXTENSIONS:
                files.append(p)
    files.sort(key=lambda p: str(p).lower())
    return files


def convert_folder(
    input_dir: Path,
    output_dir: Path,
    *,
    settings: dict[str, Any] | None = None,
    overwrite: bool = False,
    recursive: bool = True,
    progress_cb=None,
) -> dict[str, Any]:
    files = iter_sources(input_dir, recursive=recursive)
    counts = {"ok": 0, "skipped": 0, "failed": 0}
    results: list[dict[str, Any]] = []
    total = len(files)

    for i, src in enumerate(files, 1):
        rel_parent = Path(".")
        try:
            rel = src.resolve().relative_to(input_dir.resolve())
            rel_parent = rel.parent
        except ValueError:
            rel_parent = Path(".")

        out_dir = output_dir / rel_parent
        item = convert_one(
            src,
            output_dir=out_dir,
            source_root=input_dir,
            settings=settings,
            overwrite=overwrite,
        )
        results.append(item)
        status = item.get("status", "failed")
        if status in counts:
            counts[status] += 1
        else:
            counts["failed"] += 1
        if progress_cb:
            progress_cb(
                {
                    "index": i,
                    "total": total,
                    "counts": dict(counts),
                    "last": item,
                }
            )

    return {
        "status": "completed",
        "inputDir": str(input_dir.resolve()),
        "outputDir": str(output_dir.resolve()),
        "total": total,
        "counts": counts,
        "results": results,
        "finishedAt": utc_now(),
    }


def load_settings(profile_path: Path | None, profiles_dir: Path) -> tuple[str, dict[str, Any]]:
    default_path = profiles_dir / "default.json"
    default_settings: dict[str, Any] = {}
    if default_path.exists():
        default_settings = json.loads(default_path.read_text(encoding="utf-8"))

    if not profile_path:
        return "default", default_settings

    name = profile_path.stem
    if profile_path.exists():
        profile_settings = json.loads(profile_path.read_text(encoding="utf-8"))
        merged = {**default_settings, **profile_settings}
        return name, merged

    candidate = profiles_dir / f"{name}.json"
    if candidate.exists():
        profile_settings = json.loads(candidate.read_text(encoding="utf-8"))
        merged = {**default_settings, **profile_settings}
        return name, merged

    return name, default_settings
