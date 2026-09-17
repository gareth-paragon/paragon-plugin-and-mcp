import {
  registerAppResource,
  registerAppTool,
  RESOURCE_MIME_TYPE,
} from "@modelcontextprotocol/ext-apps/server";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/** Shared MCP Apps View for branded Paragon Knowledge result cards. */
export const PARAGON_KNOWLEDGE_APP_URI = "ui://paragon-knowledge/app.html";

/** Tool / result metadata hosts use to mount the Apps View. */
export const APP_UI_META = {
  ui: { resourceUri: PARAGON_KNOWLEDGE_APP_URI },
  "ui/resourceUri": PARAGON_KNOWLEDGE_APP_URI,
} as const;

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FROM_SRC = HERE.endsWith(`${path.sep}src`) || HERE.endsWith("/src");
const REPO_ROOT = FROM_SRC ? path.join(HERE, "..") : path.join(HERE, "..");

/** Built single-file HTML (after `npm run build:ui`). */
export function resolveAppHtmlPath(): string {
  if (FROM_SRC) {
    return path.join(REPO_ROOT, "dist", "ui", "mcp-app.html");
  }
  return path.join(HERE, "ui", "mcp-app.html");
}

export function readAppHtml(): string {
  const file = resolveAppHtmlPath();
  if (!fs.existsSync(file)) {
    throw new Error(
      `MCP Apps UI bundle missing at ${file}. Run npm run build:ui (or npm run build) first.`,
    );
  }
  return fs.readFileSync(file, "utf8");
}

/**
 * Keep Apps/chat payloads small. Cursor dumps large tool results to a side file
 * and skips the Apps card (so the Paragon Knowledge header never appears).
 */
export const UI_TEXT_MAX_CHARS = 4000;
/** Soft cap for `content[0].text` so the host still mounts `ui://` widgets. */
export const CONTENT_CHAT_MAX_CHARS = 10_000;
/** Hits shown in Apps / chat (full search can return more internally). */
export const UI_SEARCH_MAX_HITS = 12;
export const UI_SNIPPET_MAX_CHARS = 160;

/** White wordmark chip (~2.6KB, 44px) so chat always has one logo even if Apps skips. */
let cachedChipB64: string | null = null;

export function logoImageContent(): { type: "image"; data: string; mimeType: "image/png" } {
  if (!cachedChipB64) {
    const file = path.join(REPO_ROOT, "assets", "paragon-logo-mcp-chip.png");
    if (!fs.existsSync(file)) {
      throw new Error(`Paragon logo chip missing at ${file}.`);
    }
    cachedChipB64 = fs.readFileSync(file).toString("base64");
  }
  return { type: "image", data: cachedChipB64, mimeType: "image/png" };
}

/** Prefer Overview / Document Scope for previews when truncating long TDDs. */
export function previewDocumentText(full: string, max = UI_TEXT_MAX_CHARS): string {
  const patterns = [
    /1\)\s*Overview[\s\S]{0,4500}?(?=Document Scope|Architecture Principles|\n2\)\s|\n2\s+Document Scope|$)/i,
    /##?\s*1\.?\s*Overview[\s\S]{0,4500}?(?=##\s*2|\n## |$)/i,
    /Document Scope[\s\S]{0,2500}?(?=Architecture Principles|\n3\s|\n## |$)/i,
  ];
  for (const re of patterns) {
    const m = full.match(re);
    if (m?.[0]) {
      const chunk = m[0].trim();
      return chunk.length > max ? `${chunk.slice(0, max)}\n…` : chunk;
    }
  }
  return full.length > max ? `${full.slice(0, max)}\n…` : full;
}

function slimHits(hits: unknown[]): {
  hits: unknown[];
  totalHits: number;
  hitsTruncated: boolean;
} {
  const totalHits = hits.length;
  const sliced = hits.slice(0, UI_SEARCH_MAX_HITS).map((raw) => {
    if (!raw || typeof raw !== "object") {
      return raw;
    }
    const h = { ...(raw as Record<string, unknown>) };
    if (typeof h.snippet === "string" && h.snippet.length > UI_SNIPPET_MAX_CHARS) {
      h.snippet = `${h.snippet.slice(0, UI_SNIPPET_MAX_CHARS)}…`;
    }
    return h;
  });
  return {
    hits: sliced,
    totalHits,
    hitsTruncated: totalHits > UI_SEARCH_MAX_HITS,
  };
}

export function slimStructuredForUi(
  payload: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = { ...payload };

  if (Array.isArray(out.hits)) {
    const slimmed = slimHits(out.hits);
    out.hits = slimmed.hits;
    out.totalHits = slimmed.totalHits;
    out.hitsTruncated = slimmed.hitsTruncated;
    if (slimmed.hitsTruncated && !out.note) {
      out.note = `Showing ${UI_SEARCH_MAX_HITS} of ${slimmed.totalHits} hits so the Paragon Knowledge card can render.`;
    }
  }

  if (typeof out.text === "string" && out.text.length > UI_TEXT_MAX_CHARS) {
    const fullLen =
      typeof out.fullLength === "number" ? out.fullLength : out.text.length;
    out.fullLength = fullLen;
    out.truncated = true;
    out.text = previewDocumentText(out.text, UI_TEXT_MAX_CHARS);
    if (!out.note) {
      out.note =
        "Preview only so the Paragon Knowledge card can render. Read absolutePath for the full Markdown.";
    }
  }
  return out;
}

/** Further shrink a payload until JSON fits under the chat Apps threshold. */
export function fitStructuredForChat(
  payload: Record<string, unknown>,
): Record<string, unknown> {
  let out = slimStructuredForUi(payload);
  let encoded = JSON.stringify(out);
  let hitCap = UI_SEARCH_MAX_HITS;
  while (encoded.length > CONTENT_CHAT_MAX_CHARS && hitCap > 3 && Array.isArray(out.hits)) {
    hitCap = Math.max(3, Math.floor(hitCap / 2));
    const hits = (payload.hits as unknown[]) ?? [];
    const totalHits = typeof out.totalHits === "number" ? out.totalHits : hits.length;
    out = {
      ...out,
      hits: hits.slice(0, hitCap).map((raw) => {
        if (!raw || typeof raw !== "object") {
          return raw;
        }
        const h = { ...(raw as Record<string, unknown>) };
        if (typeof h.snippet === "string") {
          h.snippet = `${h.snippet.slice(0, 80)}…`;
        }
        return h;
      }),
      totalHits,
      hitsTruncated: totalHits > hitCap,
      note: `Showing ${hitCap} of ${totalHits} hits so the Paragon Knowledge card can render.`,
    };
    encoded = JSON.stringify(out);
  }
  if (encoded.length > CONTENT_CHAT_MAX_CHARS && typeof out.text === "string") {
    out = {
      ...out,
      text: `${out.text.slice(0, 1500)}\n…`,
      truncated: true,
      note:
        "Preview only so the Paragon Knowledge card can render. Read absolutePath for the full Markdown.",
    };
  }
  return out;
}

export function registerParagonDocsAppResource(server: McpServer): void {
  registerAppResource(
    server,
    "Paragon Knowledge App",
    PARAGON_KNOWLEDGE_APP_URI,
    { mimeType: RESOURCE_MIME_TYPE },
    async () => ({
      contents: [
        {
          uri: PARAGON_KNOWLEDGE_APP_URI,
          mimeType: RESOURCE_MIME_TYPE,
          text: readAppHtml(),
        },
      ],
    }),
  );
}

export { registerAppTool };
