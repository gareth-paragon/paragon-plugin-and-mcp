#!/usr/bin/env python3
"""Second pass: extract images from source Word/PDF, OCR with Tesseract, append to .md.

Resume-safe: skips files that already have ocr_pass: true in front matter.
Does not interrupt the text conversion batch; only updates existing .md files.
"""
from __future__ import annotations

import json
import os
import re
import subprocess
import sys
import tempfile
import traceback
import zipfile
from datetime import datetime, timezone
from pathlib import Path

_SCRIPTS_DIR = Path(__file__).resolve().parent
if str(_SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS_DIR))
from _local_env import load_env_local, require_env

load_env_local()
SOURCE_ROOT = Path(require_env("PARAGON_TECH_ARCH_SOURCE"))
OUT_ROOT = Path(require_env("PARAGON_TECH_ARCH_CORPUS"))
LOG_PATH = OUT_ROOT / "_ocr_log.jsonl"
SUMMARY_PATH = OUT_ROOT / "_OCR_SUMMARY.txt"
MARKER = "## Extracted diagram text"
OCR_DONE_KEY = "ocr_pass: true"
# Skip tiny logos / icons (bytes and pixels)
MIN_BYTES = 8_000
MIN_SIDE = 120
MAX_IMAGES_PER_DOC = 40
TESSERACT = "tesseract"


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def log_event(event: dict) -> None:
    event.setdefault("ts", utc_now())
    OUT_ROOT.mkdir(parents=True, exist_ok=True)
    with LOG_PATH.open("a", encoding="utf-8") as fh:
        fh.write(json.dumps(event, ensure_ascii=False) + "\n")


def parse_front_matter(text: str) -> tuple[dict[str, str], str, str]:
    """Return (meta, fm_raw_including_dashes, body)."""
    if not text.startswith("---"):
        return {}, "", text
    m = re.match(r"^---\r?\n(.*?)\r?\n---\r?\n?(.*)$", text, re.DOTALL)
    if not m:
        return {}, "", text
    fm_body, rest = m.group(1), m.group(2)
    meta: dict[str, str] = {}
    for line in fm_body.splitlines():
        if ":" not in line:
            continue
        k, v = line.split(":", 1)
        meta[k.strip()] = v.strip().strip('"').replace('\\"', '"')
    fm_raw = f"---\n{fm_body}\n---"
    return meta, fm_raw, rest


def set_ocr_pass(fm_raw: str) -> str:
    if OCR_DONE_KEY in fm_raw:
        return fm_raw
    # Insert before closing ---
    if fm_raw.endswith("---"):
        return fm_raw[:-3] + f"{OCR_DONE_KEY}\n---"
    return fm_raw + f"\n{OCR_DONE_KEY}\n"


def already_done(text: str) -> bool:
    return OCR_DONE_KEY in text or f"\n{MARKER}\n" in text or text.startswith(MARKER)


def ocr_image(path: Path) -> str:
    try:
        proc = subprocess.run(
            [TESSERACT, str(path), "stdout", "--psm", "6"],
            capture_output=True,
            text=True,
            encoding="utf-8",
            errors="replace",
            timeout=120,
            check=False,
        )
    except FileNotFoundError:
        raise RuntimeError("tesseract not on PATH")
    except subprocess.TimeoutExpired:
        return ""
    if proc.returncode not in (0,):
        # tesseract often returns 0; non-zero still may have partial text
        pass
    return (proc.stdout or "").strip()


def extract_docx_images(src: Path, asset_dir: Path) -> list[Path]:
    saved: list[Path] = []
    with zipfile.ZipFile(src) as zf:
        media = [
            n
            for n in zf.namelist()
            if n.startswith("word/media/") and not n.endswith("/")
        ]
        media.sort()
        for i, name in enumerate(media):
            if len(saved) >= MAX_IMAGES_PER_DOC:
                break
            data = zf.read(name)
            if len(data) < MIN_BYTES:
                continue
            ext = Path(name).suffix.lower() or ".bin"
            if ext in {".emf", ".wmf", ".bin"}:
                continue
            out = asset_dir / f"img_{i:03d}{ext}"
            out.write_bytes(data)
            saved.append(out)
    return saved


def extract_pdf_images(src: Path, asset_dir: Path) -> list[Path]:
    import fitz

    saved: list[Path] = []
    doc = fitz.open(src)
    try:
        seen: set[int] = set()
        idx = 0
        for page in doc:
            for img in page.get_images(full=True):
                xref = img[0]
                if xref in seen:
                    continue
                seen.add(xref)
                if len(saved) >= MAX_IMAGES_PER_DOC:
                    break
                try:
                    pix = fitz.Pixmap(doc, xref)
                    if pix.n >= 5:  # CMYK etc.
                        pix = fitz.Pixmap(fitz.csRGB, pix)
                    if pix.width < MIN_SIDE or pix.height < MIN_SIDE:
                        continue
                    out = asset_dir / f"img_{idx:03d}.png"
                    pix.save(str(out))
                    if out.stat().st_size < MIN_BYTES:
                        out.unlink(missing_ok=True)
                        continue
                    saved.append(out)
                    idx += 1
                except Exception:
                    continue
            if len(saved) >= MAX_IMAGES_PER_DOC:
                break
    finally:
        doc.close()
    return saved


def _file_inside_root(candidate: Path, root: Path) -> Path | None:
    """Return resolved file path only if it exists and stays under root."""
    try:
        resolved = candidate.resolve(strict=False)
        root_resolved = root.resolve(strict=False)
        if not resolved.is_file():
            return None
        if not resolved.is_relative_to(root_resolved):
            return None
        return resolved
    except (OSError, ValueError):
        return None


def resolve_source(meta: dict[str, str], md_path: Path) -> Path | None:
    rel = (meta.get("source_file") or "").replace("/", "\\").strip()
    if rel:
        contained = _file_inside_root(SOURCE_ROOT / rel, SOURCE_ROOT)
        if contained is not None:
            return contained
    # Fallback: mirror path under SOURCE_ROOT with office extensions
    try:
        rel_md = md_path.relative_to(OUT_ROOT)
    except ValueError:
        return None
    stem = rel_md.with_suffix("")
    for ext in (".docx", ".docm", ".pdf", ".doc"):
        contained = _file_inside_root(SOURCE_ROOT / (str(stem) + ext), SOURCE_ROOT)
        if contained is not None:
            return contained
    return None


def process_md(md_path: Path) -> str:
    if md_path.name.startswith("_"):
        return "skipped"
    text = md_path.read_text(encoding="utf-8", errors="replace")
    if already_done(text):
        log_event({"status": "skipped", "reason": "ocr_done", "md": str(md_path)})
        return "skipped"

    meta, fm_raw, body = parse_front_matter(text)
    src = resolve_source(meta, md_path)
    if src is None:
        # Mark done so we do not retry forever
        new_fm = set_ocr_pass(fm_raw) if fm_raw else f"---\n{OCR_DONE_KEY}\n---"
        md_path.write_text(f"{new_fm}\n{body}".lstrip() if fm_raw else text + f"\n\n---\n{OCR_DONE_KEY}\n", encoding="utf-8")
        log_event({"status": "skipped", "reason": "no_source", "md": str(md_path)})
        return "skipped"

    ext = src.suffix.lower()
    if ext == ".doc":
        new_fm = set_ocr_pass(fm_raw) if fm_raw else f"---\n{OCR_DONE_KEY}\n---"
        md_path.write_text(f"{new_fm}\n\n{body.lstrip()}".rstrip() + "\n", encoding="utf-8")
        log_event({"status": "skipped", "reason": "legacy_doc", "md": str(md_path), "source": str(src)})
        return "skipped"

    asset_dir = md_path.with_suffix("").parent / (md_path.stem + ".assets")
    asset_dir.mkdir(parents=True, exist_ok=True)

    try:
        if ext in {".docx", ".docm"}:
            images = extract_docx_images(src, asset_dir)
        elif ext == ".pdf":
            images = extract_pdf_images(src, asset_dir)
        else:
            images = []
    except Exception as exc:
        log_event(
            {
                "status": "failed",
                "md": str(md_path),
                "source": str(src),
                "error": f"{type(exc).__name__}: {exc}",
                "traceback": traceback.format_exc()[-1500:],
            }
        )
        return "failed"

    blocks: list[str] = []
    unread: list[str] = []
    for img in images:
        text_ocr = ocr_image(img)
        rel_asset = img.relative_to(md_path.parent).as_posix()
        if not text_ocr or len(text_ocr) < 8:
            unread.append(rel_asset)
            continue
        blocks.append(f"### `{rel_asset}`\n\n{text_ocr}\n")

    # Strip previous marker section if partial
    if MARKER in body:
        body = body.split(MARKER)[0].rstrip()

    new_fm = set_ocr_pass(fm_raw) if fm_raw else f"---\n{OCR_DONE_KEY}\n---"
    # Counts for Paragon Knowledge MCP unread-diagram notices
    meta_lines = [
        f"ocr_images: {len(images)}",
        f"ocr_blocks: {len(blocks)}",
        f"ocr_unread: {len(unread)}",
    ]
    if new_fm.endswith("---"):
        insert = "\n".join(meta_lines) + "\n"
        # Avoid duplicating keys on re-run
        for key in ("ocr_images:", "ocr_blocks:", "ocr_unread:"):
            new_fm = re.sub(rf"^{re.escape(key)}.*\n", "", new_fm, flags=re.M)
        new_fm = new_fm[:-3] + insert + "---"

    parts = [new_fm, "", body.strip(), ""]
    if blocks or unread:
        parts.append(MARKER)
        parts.append("")
        parts.append(
            "_OCR text from embedded images (network diagrams etc.). Accuracy varies._"
        )
        parts.append("")
        parts.extend(blocks)
        if unread:
            parts.append("### Unreadable or empty OCR")
            parts.append("")
            parts.append(
                "The following embedded images produced no usable OCR text "
                "(fewer than 8 characters). Visual content may be missing from "
                "Paragon Knowledge search and get_doc answers:"
            )
            parts.append("")
            for rel in unread:
                parts.append(f"- `{rel}`")
            parts.append("")
    else:
        # Still mark done
        pass

    out = "\n".join(parts).rstrip() + "\n"
    tmp = md_path.with_suffix(".md.ocrtmp")
    tmp.write_text(out, encoding="utf-8", errors="replace")
    tmp.replace(md_path)

    log_event(
        {
            "status": "ok",
            "md": str(md_path),
            "source": str(src),
            "images": len(images),
            "ocr_blocks": len(blocks),
            "ocr_unread": len(unread),
        }
    )
    return "ok"


def iter_mds() -> list[Path]:
    files = [
        p
        for p in OUT_ROOT.rglob("*.md")
        if p.is_file() and not p.name.startswith("_")
    ]
    files.sort(key=lambda p: str(p).lower())
    return files


def main() -> int:
    OUT_ROOT.mkdir(parents=True, exist_ok=True)
    # Verify tesseract
    try:
        subprocess.run(
            [TESSERACT, "--version"],
            capture_output=True,
            check=False,
            timeout=30,
        )
    except FileNotFoundError:
        print("ERROR: tesseract not found on PATH", flush=True)
        return 2

    files = iter_mds()
    total = len(files)
    counts = {"ok": 0, "skipped": 0, "failed": 0}
    print(f"OCR second pass: {total} markdown files under {OUT_ROOT}", flush=True)

    for i, md in enumerate(files, 1):
        # Re-list growth: first pass may add files; we only process snapshot unless re-run
        status = process_md(md)
        counts[status] = counts.get(status, 0) + 1
        if i % 10 == 0 or status == "failed" or i == total:
            print(
                f"[{i}/{total}] ok={counts['ok']} skipped={counts['skipped']} "
                f"failed={counts['failed']} last={md.name} ({status})",
                flush=True,
            )

    summary = (
        f"Finished OCR pass: {utc_now()}\n"
        f"Output: {OUT_ROOT}\n"
        f"Candidates this run: {total}\n"
        f"ok: {counts['ok']}\n"
        f"skipped: {counts['skipped']}\n"
        f"failed: {counts['failed']}\n"
        f"Log: {LOG_PATH}\n"
        f"Re-run this script after text conversion finishes to catch new .md files.\n"
    )
    SUMMARY_PATH.write_text(summary, encoding="utf-8")
    print(summary, flush=True)
    return 0 if counts["failed"] == 0 else 1


if __name__ == "__main__":
    sys.exit(main())
