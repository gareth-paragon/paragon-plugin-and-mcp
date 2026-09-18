import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));

function findRepoRoot(start: string): string {
  let dir = path.resolve(start);
  for (let i = 0; i < 6; i++) {
    if (
      fs.existsSync(path.join(dir, "package.json")) &&
      fs.existsSync(path.join(dir, "engine", "convert_cli.py"))
    ) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }
  return path.resolve(start, "..", "..");
}

const REPO_ROOT = findRepoRoot(HERE);

export function getRepoRoot(): string {
  return REPO_ROOT;
}

export function getEngineDir(): string {
  return path.join(REPO_ROOT, "engine");
}

export function getProfilesDir(): string {
  return path.join(getEngineDir(), "profiles");
}

export function getConvertCliPath(): string {
  return path.join(getEngineDir(), "convert_cli.py");
}

export function getVenvDir(): string {
  const fromEnv = process.env.PARADOCS_VENV_DIR?.trim();
  if (fromEnv) {
    return path.resolve(fromEnv);
  }
  return path.join(REPO_ROOT, ".paradocs-venv");
}

export function getVenvPython(): string {
  const venv = getVenvDir();
  const win = path.join(venv, "Scripts", "python.exe");
  const unix = path.join(venv, "bin", "python3");
  if (fs.existsSync(win)) {
    return win;
  }
  if (fs.existsSync(unix)) {
    return unix;
  }
  return unix;
}

export function getDefaultOutputDir(): string | undefined {
  const fromEnv = process.env.PARADOCS_DEFAULT_OUTPUT_DIR?.trim();
  return fromEnv ? path.resolve(fromEnv) : undefined;
}
