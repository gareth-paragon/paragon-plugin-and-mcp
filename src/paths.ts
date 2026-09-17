import fs from "node:fs";
import path from "node:path";
import { getRepoRoot } from "./config.js";

export class PathEscapeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PathEscapeError";
  }
}

export class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotFoundError";
  }
}

function normalize(p: string): string {
  return path.resolve(p).replace(/[/\\]+$/, "").toLowerCase();
}

export function assertInsideRoot(absolutePath: string, root = getRepoRoot()): string {
  const resolved = path.resolve(absolutePath);
  const rootNorm = normalize(root);
  const pathNorm = normalize(resolved);
  const sep = path.sep;
  const inside = pathNorm === rootNorm || pathNorm.startsWith(rootNorm + sep) || pathNorm.startsWith(rootNorm + "/");
  if (!inside) {
    throw new PathEscapeError(`Path escapes allowed root: ${absolutePath}`);
  }
  return resolved;
}

export function resolveRelative(relativePath: string, root = getRepoRoot()): string {
  const cleaned = relativePath.replace(/^[/\\]+/, "");
  return assertInsideRoot(path.join(root, cleaned), root);
}

export function toRelative(absolutePath: string, root = getRepoRoot()): string {
  const abs = assertInsideRoot(absolutePath, root);
  return path.relative(root, abs).split(path.sep).join("/");
}

export function ensureReadableFile(absolutePath: string): void {
  let st: fs.Stats;
  try {
    st = fs.statSync(absolutePath);
  } catch {
    throw new NotFoundError(`File not found: ${absolutePath}`);
  }
  if (!st.isFile()) {
    throw new NotFoundError(`Not a file: ${absolutePath}`);
  }
}
