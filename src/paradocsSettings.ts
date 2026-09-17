import fs from "node:fs";
import os from "node:os";
import path from "node:path";

export type ParadocsSettingsPaths = {
  dataDir: string;
  settingsFile: string;
  profilesFile: string;
  prefsFile: string;
};

export type ParadocsProfileSummary = {
  name: string;
  isDefault: boolean;
  keyCount: number;
  /** Small set of operator-facing values for pickers / MCP Apps panels. */
  highlights: Record<string, unknown>;
};

const HIGHLIGHT_KEYS = [
  "pdf_header_footer_mode",
  "docx_header_footer_mode",
  "pdf_edge_detection_enabled",
  "pdf_flag_scanned_content",
  "strip_placeholder_images",
  "dedupe_identical_assets",
  "paragon_markdown_rules_master",
  "paragon_tier1_wrap_body_80",
  "document360_front_matter_enabled",
  "vale_lint_after_rip",
  "ado_attach_work_item_images",
] as const;

function readJsonObject(filePath: string): Record<string, unknown> | undefined {
  if (!fs.existsSync(filePath)) {
    return undefined;
  }
  try {
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as unknown;
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      return raw as Record<string, unknown>;
    }
  } catch {
    // ignore malformed
  }
  return undefined;
}

function normalizeProfileName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}

/**
 * Resolve the ParaDOCS data directory (contains settings.json + profiles).
 *
 * Env:
 * - `PARAGON_PARADOCS_DATA_DIR` - absolute path to `ParaDOCS_Data_<user>`
 * - `PARAGON_PARADOCS_REPO` - Technical Documentation repo; uses
 *   `ParaDOCS_Data_<current OS user>` only (set DATA_DIR to override)
 */
export function resolveParadocsDataDir(): string {
  const fromEnv = process.env.PARAGON_PARADOCS_DATA_DIR?.trim();
  if (fromEnv) {
    return path.resolve(fromEnv);
  }

  const fromRepo = process.env.PARAGON_PARADOCS_REPO?.trim();
  if (!fromRepo) {
    throw new Error(
      "Set PARAGON_PARADOCS_REPO or PARAGON_PARADOCS_DATA_DIR (MCP env, shell, or gitignored .env.local; see examples/local.env.example).",
    );
  }
  const repo = path.resolve(fromRepo);
  // Only the current user's folder (or an explicit env override). Do not pick
  // another ParaDOCS_Data_* directory - that can load the wrong settings.
  return path.join(repo, `ParaDOCS_Data_${os.userInfo().username}`);
}

export function getParadocsSettingsPaths(
  dataDir = resolveParadocsDataDir(),
): ParadocsSettingsPaths {
  return {
    dataDir,
    settingsFile: path.join(dataDir, "settings.json"),
    profilesFile: path.join(dataDir, "settings_profiles.json"),
    prefsFile: path.join(dataDir, "settings_profile_prefs.json"),
  };
}

function highlightsFrom(settings: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of HIGHLIGHT_KEYS) {
    if (key in settings) {
      out[key] = settings[key];
    }
  }
  return out;
}

function readProfilesMap(
  profilesFile: string,
): Record<string, Record<string, unknown>> {
  const raw = readJsonObject(profilesFile);
  if (!raw) {
    return {};
  }
  const out: Record<string, Record<string, unknown>> = {};
  for (const [name, payload] of Object.entries(raw)) {
    if (typeof name !== "string" || !name.trim()) {
      continue;
    }
    if (payload && typeof payload === "object" && !Array.isArray(payload)) {
      out[normalizeProfileName(name)] = payload as Record<string, unknown>;
    }
  }
  return out;
}

function readDefaultProfileName(
  prefsFile: string,
  profileNames: string[],
): string {
  const prefs = readJsonObject(prefsFile);
  const raw = prefs?.default_profile_name;
  if (typeof raw !== "string" || !raw.trim()) {
    return "";
  }
  const want = normalizeProfileName(raw).toLowerCase();
  const hit = profileNames.find((n) => n.toLowerCase() === want);
  return hit ?? "";
}

/** List named ParaDOCS Settings profiles (same store as the desktop Profiles menu). */
export function listSettingsProfiles(): {
  dataDir: string;
  paths: ParadocsSettingsPaths;
  present: boolean;
  defaultProfile: string;
  activeSettingsPresent: boolean;
  profiles: ParadocsProfileSummary[];
} {
  const paths = getParadocsSettingsPaths();
  const present = fs.existsSync(paths.dataDir);
  const profilesMap = readProfilesMap(paths.profilesFile);
  const names = Object.keys(profilesMap).sort((a, b) =>
    a.localeCompare(b, undefined, { sensitivity: "base" }),
  );
  const defaultProfile = readDefaultProfileName(paths.prefsFile, names);
  const profiles: ParadocsProfileSummary[] = names.map((name) => ({
    name,
    isDefault: defaultProfile.toLowerCase() === name.toLowerCase(),
    keyCount: Object.keys(profilesMap[name] ?? {}).length,
    highlights: highlightsFrom(profilesMap[name] ?? {}),
  }));

  return {
    dataDir: paths.dataDir,
    paths,
    present,
    defaultProfile,
    activeSettingsPresent: fs.existsSync(paths.settingsFile),
    profiles,
  };
}

/**
 * Read active settings.json or a named profile from settings_profiles.json.
 *
 * @param profile - Profile name, or `"active"` / omit for current settings.json
 */
export function getSettingsProfile(profile?: string): {
  source: "active" | "profile";
  name: string;
  dataDir: string;
  path: string;
  defaultProfile: string;
  settings: Record<string, unknown>;
  highlights: Record<string, unknown>;
} {
  const paths = getParadocsSettingsPaths();
  if (!fs.existsSync(paths.dataDir)) {
    throw new Error(
      `ParaDOCS data directory not found: ${paths.dataDir}. ` +
        `Set PARAGON_PARADOCS_DATA_DIR or PARAGON_PARADOCS_REPO.`,
    );
  }

  const profilesMap = readProfilesMap(paths.profilesFile);
  const names = Object.keys(profilesMap);
  const defaultProfile = readDefaultProfileName(paths.prefsFile, names);
  const want = normalizeProfileName(profile ?? "active");

  if (!want || want.toLowerCase() === "active") {
    const settings = readJsonObject(paths.settingsFile);
    if (!settings) {
      throw new Error(`Active settings not found: ${paths.settingsFile}`);
    }
    return {
      source: "active",
      name: "active",
      dataDir: paths.dataDir,
      path: paths.settingsFile,
      defaultProfile,
      settings,
      highlights: highlightsFrom(settings),
    };
  }

  const canonical =
    names.find((n) => n.toLowerCase() === want.toLowerCase()) ?? "";
  if (!canonical) {
    const available = names.length ? names.join(", ") : "(none)";
    throw new Error(
      `Settings profile not found: "${want}". Available: ${available}`,
    );
  }

  return {
    source: "profile",
    name: canonical,
    dataDir: paths.dataDir,
    path: paths.profilesFile,
    defaultProfile,
    settings: profilesMap[canonical] ?? {},
    highlights: highlightsFrom(profilesMap[canonical] ?? {}),
  };
}
