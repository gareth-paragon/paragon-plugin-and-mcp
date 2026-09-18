#!/usr/bin/env python3
"""CLI entry for bundled ParaDOCS convert engine (JSON on stdout)."""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

ENGINE_DIR = Path(__file__).resolve().parent
if str(ENGINE_DIR) not in sys.path:
    sys.path.insert(0, str(ENGINE_DIR))

from paradocs_convert import convert_folder, convert_one, load_settings  # noqa: E402


def emit(payload: dict) -> None:
    print(json.dumps(payload, ensure_ascii=False), flush=True)


def resolve_profile(profiles_dir: Path, profile: str | None) -> tuple[str, dict]:
    if not profile or profile.lower() in {"default", "active"}:
        return load_settings(None, profiles_dir)
    return load_settings(profiles_dir / f"{profile}.json", profiles_dir)


def cmd_convert_file(args: argparse.Namespace) -> int:
    profiles_dir = Path(args.profiles_dir)
    profile_name, settings = resolve_profile(profiles_dir, args.profile)
    src = Path(args.input).expanduser().resolve()
    if not src.exists():
        emit({"status": "failed", "error": f"Input not found: {src}"})
        return 1

    output = Path(args.output).expanduser().resolve() if args.output else None
    result = convert_one(
        src,
        output=output,
        settings=settings,
        overwrite=args.overwrite,
    )
    result["profile"] = profile_name
    emit(result)
    return 0 if result.get("status") in {"ok", "skipped"} else 1


def cmd_convert_folder(args: argparse.Namespace) -> int:
    profiles_dir = Path(args.profiles_dir)
    profile_name, settings = resolve_profile(profiles_dir, args.profile)
    input_dir = Path(args.input_dir).expanduser().resolve()
    output_dir = Path(args.output_dir).expanduser().resolve()

    if not input_dir.exists():
        emit({"status": "failed", "error": f"Input directory not found: {input_dir}"})
        return 1

    progress_path = Path(args.progress_file).expanduser() if args.progress_file else None

    def progress_cb(state: dict) -> None:
        if not progress_path:
            return
        payload = {
            "profile": profile_name,
            "inputDir": str(input_dir),
            "outputDir": str(output_dir),
            **state,
        }
        progress_path.write_text(json.dumps(payload, ensure_ascii=False), encoding="utf-8")

    result = convert_folder(
        input_dir,
        output_dir,
        settings=settings,
        overwrite=args.overwrite,
        recursive=not args.no_recursive,
        progress_cb=progress_cb,
    )
    result["profile"] = profile_name
    emit(result)
    return 0 if result.get("counts", {}).get("failed", 0) == 0 else 1


def cmd_list_profiles(args: argparse.Namespace) -> int:
    profiles_dir = Path(args.profiles_dir)
    profiles = []
    if profiles_dir.is_dir():
        for path in sorted(profiles_dir.glob("*.json")):
            name = path.stem
            try:
                settings = json.loads(path.read_text(encoding="utf-8"))
                key_count = len(settings) if isinstance(settings, dict) else 0
            except Exception:
                key_count = 0
            profiles.append(
                {
                    "name": name,
                    "path": str(path.resolve()),
                    "keyCount": key_count,
                    "isDefault": name.lower() == "default",
                }
            )
    emit({"status": "ok", "profilesDir": str(profiles_dir.resolve()), "profiles": profiles})
    return 0


def cmd_get_profile(args: argparse.Namespace) -> int:
    profiles_dir = Path(args.profiles_dir)
    profile_name, settings = resolve_profile(profiles_dir, args.profile)
    path = profiles_dir / f"{profile_name}.json"
    emit(
        {
            "status": "ok",
            "name": profile_name,
            "path": str(path.resolve()) if path.exists() else str(profiles_dir / "default.json"),
            "settings": settings,
        }
    )
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description="ParaDOCS bundled convert CLI")
    parser.add_argument(
        "--profiles-dir",
        default=str(ENGINE_DIR / "profiles"),
        help="Directory containing bundled settings profiles (*.json)",
    )
    sub = parser.add_subparsers(dest="command", required=True)

    p_file = sub.add_parser("convert-file")
    p_file.add_argument("--input", required=True)
    p_file.add_argument("--output")
    p_file.add_argument("--profile", default="default")
    p_file.add_argument("--overwrite", action="store_true")
    p_file.set_defaults(func=cmd_convert_file)

    p_folder = sub.add_parser("convert-folder")
    p_folder.add_argument("--input-dir", required=True)
    p_folder.add_argument("--output-dir", required=True)
    p_folder.add_argument("--profile", default="default")
    p_folder.add_argument("--overwrite", action="store_true")
    p_folder.add_argument("--no-recursive", action="store_true")
    p_folder.add_argument(
        "--progress-file",
        help="Optional path to write JSON progress snapshots during batch convert",
    )
    p_folder.set_defaults(func=cmd_convert_folder)

    p_list = sub.add_parser("list-profiles")
    p_list.set_defaults(func=cmd_list_profiles)

    p_get = sub.add_parser("get-profile")
    p_get.add_argument("--profile", default="default")
    p_get.set_defaults(func=cmd_get_profile)

    args = parser.parse_args()
    try:
        return args.func(args)
    except Exception as exc:
        emit({"status": "failed", "error": f"{type(exc).__name__}: {exc}"})
        return 1


if __name__ == "__main__":
    sys.exit(main())
