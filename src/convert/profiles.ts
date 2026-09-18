import fs from "node:fs";
import path from "node:path";
import { getProfilesDir } from "./paths.js";
import { getProfileEngine, listProfilesEngine } from "./engine.js";

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

function highlightsFrom(settings: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of HIGHLIGHT_KEYS) {
    if (key in settings) {
      out[key] = settings[key];
    }
  }
  return out;
}

export async function listBundledProfiles(): Promise<{
  profilesDir: string;
  profiles: Array<{
    name: string;
    path: string;
    keyCount: number;
    isDefault: boolean;
    highlights: Record<string, unknown>;
  }>;
}> {
  const profilesDir = getProfilesDir();
  const engine = await listProfilesEngine();
  const rawProfiles = Array.isArray(engine.profiles) ? engine.profiles : [];
  const profiles = rawProfiles.map((item) => {
    const row = item as Record<string, unknown>;
    const name = String(row.name ?? "");
    const profilePath = String(row.path ?? path.join(profilesDir, `${name}.json`));
    let settings: Record<string, unknown> = {};
    if (fs.existsSync(profilePath)) {
      try {
        settings = JSON.parse(fs.readFileSync(profilePath, "utf8")) as Record<string, unknown>;
      } catch {
        settings = {};
      }
    }
    return {
      name,
      path: profilePath,
      keyCount: typeof row.keyCount === "number" ? row.keyCount : Object.keys(settings).length,
      isDefault: Boolean(row.isDefault) || name.toLowerCase() === "default",
      highlights: highlightsFrom(settings),
    };
  });

  return { profilesDir, profiles };
}

export async function getBundledProfile(profile?: string): Promise<{
  name: string;
  path: string;
  settings: Record<string, unknown>;
  highlights: Record<string, unknown>;
}> {
  const data = await getProfileEngine(profile);
  const settings = (data.settings as Record<string, unknown> | undefined) ?? {};
  return {
    name: String(data.name ?? profile ?? "default"),
    path: String(data.path ?? ""),
    settings,
    highlights: highlightsFrom(settings),
  };
}
