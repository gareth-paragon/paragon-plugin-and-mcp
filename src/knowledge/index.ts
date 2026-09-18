#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import {
  KNOWLEDGE_APP_UI_META,
  fitStructuredForChat,
  logoImageContent,
  registerAppTool,
  registerParagonDocsAppResource,
} from "../appsUi.js";
import { getRepoRoot, MAX_TEXT_CHARS, type DocArea } from "../config.js";
import { loadEnvLocal } from "../loadEnvLocal.js";

loadEnvLocal();
import { findDocEntry, listCorpora, listDocs, readDocText } from "../corpus.js";
import {
  getAdminOverview,
  getApprovedModels,
  getApprovedPluginsAndMcps,
  getChangeFormInfo,
  getGovernanceAi02,
  getGuidePage,
  getNacSummary,
} from "../extracts.js";
import { NotFoundError, PathEscapeError, resolveRelative, toRelative, ensureReadableFile } from "../paths.js";
import { getSettingsProfile, listSettingsProfiles } from "../paradocsSettings.js";
import {
  analyzeDiagramOcr,
  diagramOcrPayload,
  shouldSurfaceUnreadDiagrams,
} from "../diagramOcr.js";
import { docMetadata, searchDocs } from "../search.js";

function textResult(payload: unknown) {
  const structured =
    typeof payload === "object" && payload !== null
      ? ({ ...(payload as Record<string, unknown>) } as Record<string, unknown>)
      : { view: "result", text: String(payload) };

  const ui = fitStructuredForChat(structured);
  const text = JSON.stringify(ui, null, 2);

  return {
    content: [logoImageContent(), { type: "text" as const, text }],
    structuredContent: ui,
    _meta: { ...KNOWLEDGE_APP_UI_META },
  };
}

function errorResult(err: unknown) {
  const message = err instanceof Error ? err.message : String(err);
  return {
    content: [logoImageContent(), { type: "text" as const, text: `Error: ${message}` }],
    isError: true,
    _meta: { ...KNOWLEDGE_APP_UI_META },
  };
}

const corpusFilterSchema = z
  .string()
  .optional()
  .describe(
    "Corpus or guides area filter. Default all. Examples: all, guides, user-guide, admin-guide, root, tech-arch, abbey-view.",
  );

const server = new McpServer({
  name: "paragon-knowledge",
  version: "0.3.3",
});

registerParagonDocsAppResource(server);

registerAppTool(
  server,
  "list_corpora",
  {
    title: "List documentation corpora",
    description:
      "Summarise which documentation corpora are configured and currently loaded (id, label, root path, doc counts). Use this when asked what docs the MCP has. For individual page paths, use list_docs.",
    inputSchema: {},
    _meta: KNOWLEDGE_APP_UI_META,
  },
  async () => {
    try {
      return textResult({ view: "result", panelTitle: "Corpora", ...listCorpora() });
    } catch (err) {
      return errorResult(err);
    }
  },
);

registerAppTool(
  server,
  "list_docs",
  {
    title: "List documentation pages",
    description:
      "List Markdown pages in the loaded corpus. Optional corpus filter: all, guides, user-guide, admin-guide, root, tech-arch, abbey-view. For a high-level inventory of corpora, prefer list_corpora.",
    inputSchema: {
      corpus: corpusFilterSchema,
      area: corpusFilterSchema.describe("Alias of corpus (kept for compatibility)."),
    },
    _meta: KNOWLEDGE_APP_UI_META,
  },
  async ({ corpus, area }) => {
    try {
      const filter = (corpus ?? area ?? "all") as DocArea | "all";
      const docs = listDocs({ corpus: filter });
      return textResult({
        view: "result",
        panelTitle: "Document list",
        guidesRoot: getRepoRoot(),
        corpus: filter,
        count: docs.length,
        docs: docs.map(docMetadata),
      });
    } catch (err) {
      return errorResult(err);
    }
  },
);

registerAppTool(
  server,
  "get_doc",
  {
    title: "Get a documentation page",
    description:
      "Return a documentation page by corpus path (e.g. tech-arch/..., user-guide/...). Large pages return a preview (Overview when present) plus absolutePath so the Paragon Knowledge card can render; read absolutePath for the full Markdown. When the page has embedded diagrams/images that OCR could not read, includes diagramOcr.notice (also prepended to text) so agents can warn that visual content may be missing. Legacy external/<corpus>/... paths are accepted.",
    inputSchema: {
      relativePath: z
        .string()
        .describe("Corpus path, e.g. user-guide/....md, tech-arch/....md, abbey-view/....md"),
    },
    _meta: KNOWLEDGE_APP_UI_META,
  },
  async ({ relativePath }) => {
    try {
      const page = getGuidePage(relativePath);
      return textResult({ view: "result", panelTitle: page.title ?? "Document", ...page });
    } catch (err) {
      return errorResult(err);
    }
  },
);

registerAppTool(
  server,
  "search_docs",
  {
    title: "Search documentation",
    description:
      "Fast keyword search across all loaded corpora (guides, tech-arch, abbey-view, …). Title matches for Technical Architecture library docs that could not be converted return an unavailable notice (not full body text). When a hit has diagrams OCR could not read and that gap looks relevant to the query (or the OCR gap is large), the hit includes unreadDiagrams / diagramOcr.notice. Hosts that support MCP Apps render a branded Paragon Knowledge result card.",
    inputSchema: {
      query: z.string().describe("Keyword or phrase"),
      corpus: corpusFilterSchema,
      area: corpusFilterSchema.describe("Alias of corpus (kept for compatibility)."),
      contentSearch: z
        .boolean()
        .optional()
        .describe("Search file contents (default true). Set false for path/title only."),
    },
    _meta: KNOWLEDGE_APP_UI_META,
  },
  async ({ query, corpus, area, contentSearch }) => {
    try {
      const filter = (corpus ?? area ?? "all") as DocArea | "all";
      const result = searchDocs(query, { corpus: filter, contentSearch });
      return textResult({
        view: "search",
        guidesRoot: getRepoRoot(),
        query,
        corpus: filter,
        ...result,
      });
    } catch (err) {
      return errorResult(err);
    }
  },
);

registerAppTool(
  server,
  "job_status",
  {
    title: "Convert job status",
    description:
      "Return ParaDOCS convert job status for a branded MCP Apps panel. Stub until convert_file / convert_folder land: reports idle when no job store exists. Hosts without MCP Apps still receive JSON text.",
    inputSchema: {
      jobId: z
        .string()
        .optional()
        .describe("Optional job id when convert tools start writing a job store."),
    },
    _meta: KNOWLEDGE_APP_UI_META,
  },
  async ({ jobId }) => {
    try {
      return textResult({
        view: "job_status",
        status: "idle",
        jobId: jobId ?? null,
        message:
          "No convert jobs are running. convert_file / convert_folder are not shipped yet; this panel is ready for job progress when those tools land.",
      });
    } catch (err) {
      return errorResult(err);
    }
  },
);

registerAppTool(
  server,
  "get_approved_plugins_and_mcps",
  {
    title: "Approved plugins and MCPs",
    description: "Return User Guide page 06: approved Team Marketplace plugins and MCP servers.",
    inputSchema: {},
    _meta: KNOWLEDGE_APP_UI_META,
  },
  async () => {
    try {
      const page = getApprovedPluginsAndMcps();
      return textResult({ view: "result", panelTitle: "Approved plugins and MCPs", ...page });
    } catch (err) {
      return errorResult(err);
    }
  },
);

registerAppTool(
  server,
  "get_approved_models",
  {
    title: "Approved models",
    description: "Return User Guide page 05: approved models.",
    inputSchema: {},
    _meta: KNOWLEDGE_APP_UI_META,
  },
  async () => {
    try {
      const page = getApprovedModels();
      return textResult({ view: "result", panelTitle: "Approved models", ...page });
    } catch (err) {
      return errorResult(err);
    }
  },
);

registerAppTool(
  server,
  "get_nac_summary",
  {
    title: "Network Access Controls summary",
    description: "Return User Guide page 08 (NAC). Points to Admin Guide for the authoritative table.",
    inputSchema: {},
    _meta: KNOWLEDGE_APP_UI_META,
  },
  async () => {
    try {
      const page = getNacSummary();
      return textResult({ view: "result", panelTitle: "NAC summary", ...page });
    } catch (err) {
      return errorResult(err);
    }
  },
);

registerAppTool(
  server,
  "get_change_form_info",
  {
    title: "Cursor Change Form",
    description: "Return User Guide page 04: how to request MCP/plugin/NAC and other changes.",
    inputSchema: {},
    _meta: KNOWLEDGE_APP_UI_META,
  },
  async () => {
    try {
      const page = getChangeFormInfo();
      return textResult({ view: "result", panelTitle: "Cursor Change Form", ...page });
    } catch (err) {
      return errorResult(err);
    }
  },
);

registerAppTool(
  server,
  "get_governance_ai02",
  {
    title: "AI02 governance policy",
    description: "Return AI02 Business Use of Artificial Intelligence (User Guide copy preferred).",
    inputSchema: {},
    _meta: KNOWLEDGE_APP_UI_META,
  },
  async () => {
    try {
      const page = getGovernanceAi02();
      return textResult({ view: "result", panelTitle: "AI02 governance", ...page });
    } catch (err) {
      return errorResult(err);
    }
  },
);

registerAppTool(
  server,
  "get_admin_guide_overview",
  {
    title: "Admin Guide overview",
    description:
      "Return the start of admin-guide/CursorAI-Administration.md. For deep topics, use search_docs or get_doc.",
    inputSchema: {},
    _meta: KNOWLEDGE_APP_UI_META,
  },
  async () => {
    try {
      const page = getAdminOverview();
      return textResult({ view: "result", panelTitle: "Admin Guide overview", ...page });
    } catch (err) {
      return errorResult(err);
    }
  },
);

registerAppTool(
  server,
  "list_settings_profiles",
  {
    title: "List ParaDOCS Settings profiles",
    description:
      "List named Settings profiles from the local ParaDOCS data directory (same Profiles menu as the desktop app). Returns profile names, default profile, and highlight toggles for each. Use before convert when choosing a --profile.",
    inputSchema: {},
    _meta: KNOWLEDGE_APP_UI_META,
  },
  async () => {
    try {
      return textResult({
        view: "result",
        panelTitle: "Settings profiles",
        ...listSettingsProfiles(),
      });
    } catch (err) {
      return errorResult(err);
    }
  },
);

registerAppTool(
  server,
  "get_settings_profile",
  {
    title: "Get ParaDOCS Settings profile",
    description:
      "Read full ParaDOCS settings. Omit profile (or pass active) for the current settings.json; pass a profile name (e.g. Main, Test) to read that snapshot from settings_profiles.json.",
    inputSchema: {
      profile: z
        .string()
        .optional()
        .describe(
          'Profile name from list_settings_profiles, or "active" / omit for current settings.json',
        ),
    },
    _meta: KNOWLEDGE_APP_UI_META,
  },
  async ({ profile }) => {
    try {
      const data = getSettingsProfile(profile);
      return textResult({
        view: "result",
        panelTitle: `Settings: ${data.name}`,
        ...data,
      });
    } catch (err) {
      return errorResult(err);
    }
  },
);

registerAppTool(
  server,
  "get_doc_metadata",
  {
    title: "Get doc metadata",
    description:
      "Return title, corpus, area, size, and modified time for one corpus path. Includes diagramOcr when embedded diagrams could not be read with OCR.",
    inputSchema: {
      relativePath: z.string(),
    },
    _meta: KNOWLEDGE_APP_UI_META,
  },
  async ({ relativePath }) => {
    try {
      const hit = findDocEntry(relativePath);
      if (hit) {
        const text = readDocText(hit.absolutePath);
        const diagramStatus = analyzeDiagramOcr(hit.absolutePath, text);
        const diagram =
          shouldSurfaceUnreadDiagrams(null, diagramStatus) &&
          diagramOcrPayload(diagramStatus, { includeNotice: true });
        return textResult({
          view: "result",
          panelTitle: "Document metadata",
          guidesRoot: getRepoRoot(),
          ...docMetadata(hit),
          absolutePath: hit.absolutePath,
          ...(diagram ? { diagramOcr: diagram } : {}),
        });
      }
      const absolutePath = resolveRelative(relativePath);
      ensureReadableFile(absolutePath);
      if (!absolutePath.toLowerCase().endsWith(".md")) {
        throw new NotFoundError(`Not a Markdown doc in corpus: ${relativePath}`);
      }
      const text = readDocText(absolutePath);
      const diagramStatus = analyzeDiagramOcr(absolutePath, text);
      const diagram =
        shouldSurfaceUnreadDiagrams(null, diagramStatus) &&
        diagramOcrPayload(diagramStatus, { includeNotice: true });
      return textResult({
        view: "result",
        panelTitle: "Document metadata",
        relativePath: toRelative(absolutePath),
        title: text.match(/^#\s+(.+)$/m)?.[1] ?? relativePath,
        chars: Math.min(text.length, MAX_TEXT_CHARS),
        ...(diagram ? { diagramOcr: diagram } : {}),
      });
    } catch (err) {
      if (err instanceof PathEscapeError || err instanceof NotFoundError) {
        return errorResult(err);
      }
      return errorResult(err);
    }
  },
);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
