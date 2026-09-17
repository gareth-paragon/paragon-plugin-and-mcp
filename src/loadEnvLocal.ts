import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Load KEY=VALUE pairs from `.env.local` at the package root into `process.env`
 * when the key is not already set. Ignores comments and blank lines.
 */
export function loadEnvLocal(packageRoot?: string): void {
  const root =
    packageRoot ??
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const envPath = path.join(root, ".env.local");
  if (!fs.existsSync(envPath)) {
    return;
  }
  const text = fs.readFileSync(envPath, "utf8");
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }
    const eq = trimmed.indexOf("=");
    if (eq <= 0) {
      continue;
    }
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!key || process.env[key]?.trim()) {
      continue;
    }
    process.env[key] = value;
  }
}
