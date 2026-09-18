/**
 * Paragon Knowledge MCP App - compact branded result card in the agent thread.
 */
import {
  App,
  applyDocumentTheme,
  applyHostFonts,
  applyHostStyleVariables,
  type McpUiHostContext,
} from "@modelcontextprotocol/ext-apps";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import logoHeaderDark from "../../assets/paragon-logo-header-dark.png";
import logoHeaderWhite from "../../assets/paragon-logo-header-white.png";
import "./chrome.css";

type SearchHit = {
  relativePath?: string;
  title?: string;
  area?: string;
  matchIn?: string;
  snippet?: string;
  unavailable?: boolean;
  unreadDiagrams?: boolean;
  diagramOcr?: { notice?: string; unreadCount?: number };
};

type SearchPayload = {
  view?: "search";
  query?: string;
  hits?: SearchHit[];
  scannedDocs?: number;
};

type JobStatusPayload = {
  view?: "job_status";
  status?: string;
  message?: string;
  jobId?: string | null;
  inputPath?: string;
  outputPath?: string;
  inputDir?: string;
  outputDir?: string;
  progress?: {
    index?: number;
    total?: number;
    counts?: Record<string, number>;
    lastSource?: string;
    lastStatus?: string;
  };
  counts?: Record<string, number>;
};

type ConvertPayload = {
  view?: "convert_result" | "convert_progress";
  status?: string;
  message?: string;
  jobId?: string;
  profile?: string;
  inputPath?: string;
  outputPath?: string;
  inputDir?: string;
  outputDir?: string;
  chars?: number;
  reason?: string;
  limitations?: string;
};

type ResultPayload = {
  view?: "result" | string;
  panelTitle?: string;
  title?: string;
  text?: string;
  relativePath?: string;
  message?: string;
  [key: string]: unknown;
};

type AppPayload = SearchPayload | JobStatusPayload | ConvertPayload | ResultPayload;

const PREVIEW_CHARS = 4000;

const statusEl = document.getElementById("status")!;
const bodyEl = document.getElementById("body")!;
const logoDarkEl = document.getElementById("logo-dark") as HTMLImageElement;
const logoLightEl = document.getElementById("logo-light") as HTMLImageElement;
logoDarkEl.src = logoHeaderWhite;
logoLightEl.src = logoHeaderDark;

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function truncate(value: string, max = PREVIEW_CHARS): string {
  if (value.length <= max) {
    return value;
  }
  return `${value.slice(0, max)}\n…`;
}

function parsePayload(result: CallToolResult): AppPayload | null {
  if (result.structuredContent && typeof result.structuredContent === "object") {
    return result.structuredContent as AppPayload;
  }
  const text = result.content?.find((c) => c.type === "text");
  if (!text || text.type !== "text" || typeof text.text !== "string") {
    return null;
  }
  try {
    return JSON.parse(text.text) as AppPayload;
  } catch {
    return { view: "result", text: text.text };
  }
}

function isSearchPayload(payload: AppPayload): payload is SearchPayload {
  return payload.view === "search" || Array.isArray((payload as SearchPayload).hits);
}

function isJobPayload(payload: AppPayload): payload is JobStatusPayload {
  return payload.view === "job_status" || payload.view === "convert_progress";
}

function isConvertResultPayload(payload: AppPayload): payload is ConvertPayload {
  return payload.view === "convert_result";
}

function renderSearch(payload: SearchPayload & { totalHits?: number }): void {
  const hits = Array.isArray(payload.hits) ? payload.hits : [];
  const total =
    typeof payload.totalHits === "number" && payload.totalHits > hits.length
      ? payload.totalHits
      : hits.length;
  const unavailableOnly = hits.length > 0 && hits.every((h) => h.unavailable);
  const unavailableCount = hits.filter((h) => h.unavailable).length;
  const unreadDiagramCount = hits.filter((h) => h.unreadDiagrams).length;

  if (unavailableOnly) {
    statusEl.textContent =
      unavailableCount === 1 ? "Document unavailable" : `${unavailableCount} unavailable`;
  } else if (unavailableCount > 0 || unreadDiagramCount > 0) {
    const bits = [`${total} hit${total === 1 ? "" : "s"}`];
    if (unavailableCount > 0) {
      bits.push(`${unavailableCount} unavailable`);
    }
    if (unreadDiagramCount > 0) {
      bits.push(`${unreadDiagramCount} with unread diagrams`);
    }
    statusEl.textContent = bits.join(" · ");
  } else {
    const q = payload.query ? ` for "${payload.query}"` : "";
    const shown =
      total > hits.length ? `${hits.length} of ${total} hits` : `${total} hit${total === 1 ? "" : "s"}`;
    statusEl.textContent = `${shown}${q}`;
  }

  if (hits.length === 0) {
    bodyEl.innerHTML = `<p class="muted">No matching documents.</p>`;
    return;
  }

  if (unavailableOnly) {
    bodyEl.innerHTML = hits
      .map(
        (hit) => `
      <article class="notice">
        <p class="hit-title">${escapeHtml(hit.title ?? "Unavailable document")}</p>
        <p class="hit-meta">${escapeHtml(hit.relativePath ?? "")}</p>
        <p>${escapeHtml(hit.snippet ?? "")}</p>
      </article>`,
      )
      .join('<div style="height:8px"></div>');
    return;
  }

  bodyEl.innerHTML = `<ul class="hit-list">${hits
    .map((hit) => {
      const cls = [
        "hit",
        hit.unavailable ? "unavailable" : "",
        hit.unreadDiagrams ? "unread-diagrams" : "",
      ]
        .filter(Boolean)
        .join(" ");
      const meta = [
        hit.area,
        hit.matchIn,
        hit.unreadDiagrams ? "unread diagrams" : "",
        hit.relativePath,
      ]
        .filter(Boolean)
        .join(" · ");
      return `
        <li class="${cls}">
          <p class="hit-title">${escapeHtml(hit.title ?? hit.relativePath ?? "Untitled")}</p>
          <p class="hit-meta">${escapeHtml(meta)}</p>
          <p class="hit-snippet">${escapeHtml(hit.snippet ?? "")}</p>
        </li>`;
    })
    .join("")}</ul>`;
}

function renderJob(payload: JobStatusPayload | ConvertPayload): void {
  const status = (payload.status ?? "idle").toLowerCase();
  const isBatch = Boolean(payload.inputDir || payload.progress?.total);
  statusEl.textContent =
    status === "idle"
      ? "Convert job idle"
      : isBatch && payload.progress?.total
        ? `Converting ${payload.progress.index ?? 0}/${payload.progress.total}`
        : `Convert: ${payload.status ?? "unknown"}`;

  const badgeClass =
    status === "completed" || status === "ok"
      ? "job-badge completed"
      : status === "failed"
        ? "job-badge failed"
        : status === "running" || status === "queued"
          ? "job-badge running"
          : "job-badge idle";

  const paths: string[] = [];
  if (payload.inputPath) {
    paths.push(`Source: ${payload.inputPath}`);
  }
  if (payload.outputPath) {
    paths.push(`Output: ${payload.outputPath}`);
  }
  if (payload.inputDir) {
    paths.push(`Input folder: ${payload.inputDir}`);
  }
  if (payload.outputDir) {
    paths.push(`Output folder: ${payload.outputDir}`);
  }

  const counts = payload.progress?.counts ?? payload.counts;
  const countsLine =
    counts && Object.keys(counts).length
      ? `<p class="job-meta">${escapeHtml(
          Object.entries(counts)
            .map(([k, v]) => `${k}: ${v}`)
            .join(" · "),
        )}</p>`
      : "";

  const jobId = payload.jobId
    ? `<p class="job-id">Job ID: ${escapeHtml(String(payload.jobId))}</p>`
    : "";
  const profile = payload.profile
    ? `<p class="job-meta">Profile: ${escapeHtml(String(payload.profile))}</p>`
    : "";

  bodyEl.innerHTML = `
    <div class="job-panel">
      <div class="${badgeClass}">${escapeHtml(payload.status ?? "idle")}</div>
      <p class="job-message">${escapeHtml(payload.message ?? "No convert jobs yet.")}</p>
      ${profile}
      ${paths.map((line) => `<p class="job-meta">${escapeHtml(line)}</p>`).join("")}
      ${countsLine}
      ${jobId}
    </div>`;
}

function renderConvertResult(payload: ConvertPayload): void {
  const status = (payload.status ?? "unknown").toLowerCase();
  statusEl.textContent =
    status === "ok"
      ? "Conversion complete"
      : status === "skipped"
        ? "Conversion skipped"
        : "Conversion failed";

  const badgeClass =
    status === "ok"
      ? "job-badge completed"
      : status === "skipped"
        ? "job-badge idle"
        : "job-badge failed";

  bodyEl.innerHTML = `
    <div class="job-panel">
      <div class="${badgeClass}">${escapeHtml(payload.status ?? "unknown")}</div>
      <p class="job-message">${escapeHtml(payload.message ?? "")}</p>
      ${
        payload.outputPath
          ? `<p class="job-meta"><strong>Output</strong> ${escapeHtml(payload.outputPath)}</p>`
          : ""
      }
      ${
        payload.inputPath
          ? `<p class="job-meta"><strong>Source</strong> ${escapeHtml(payload.inputPath)}</p>`
          : ""
      }
      ${
        payload.profile
          ? `<p class="job-meta"><strong>Profile</strong> ${escapeHtml(payload.profile)}</p>`
          : ""
      }
      ${
        typeof payload.chars === "number"
          ? `<p class="job-meta">${payload.chars.toLocaleString()} characters extracted</p>`
          : ""
      }
      ${
        payload.limitations
          ? `<article class="notice"><p>${escapeHtml(payload.limitations)}</p></article>`
          : ""
      }
    </div>`;
}

function previewBody(payload: ResultPayload): string {
  if (typeof payload.text === "string" && payload.text.trim()) {
    return truncate(payload.text);
  }
  if (typeof payload.message === "string" && payload.message.trim()) {
    return truncate(payload.message);
  }
  const { view: _v, panelTitle: _p, ...rest } = payload;
  try {
    return truncate(JSON.stringify(rest, null, 2));
  } catch {
    return "Result received.";
  }
}

function renderGeneric(payload: ResultPayload): void {
  const title =
    (typeof payload.panelTitle === "string" && payload.panelTitle) ||
    (typeof payload.title === "string" && payload.title) ||
    "Result";
  const diagram = payload.diagramOcr as
    | { notice?: string; unreadCount?: number }
    | undefined;
  statusEl.textContent =
    diagram && typeof diagram.unreadCount === "number" && diagram.unreadCount > 0
      ? `${title} · unread diagrams`
      : title;

  const meta =
    typeof payload.relativePath === "string" && payload.relativePath
      ? `<p class="hit-meta">${escapeHtml(payload.relativePath)}</p>`
      : "";
  const diagramBanner =
    diagram && typeof diagram.notice === "string" && diagram.notice
      ? `<article class="notice diagram-ocr"><p>${escapeHtml(diagram.notice)}</p></article>`
      : "";

  bodyEl.innerHTML = `
    <div class="result-panel">
      ${meta}
      ${diagramBanner}
      <pre class="result-pre">${escapeHtml(previewBody(payload))}</pre>
    </div>`;
}

function renderResult(result: CallToolResult): void {
  if (result.isError) {
    statusEl.textContent = "Error";
    const text = result.content?.find((c) => c.type === "text");
    const msg =
      text && text.type === "text" && typeof text.text === "string"
        ? text.text
        : "Tool returned an error.";
    bodyEl.innerHTML = `<article class="notice"><p>${escapeHtml(msg)}</p></article>`;
    return;
  }

  const payload = parsePayload(result);
  if (!payload) {
    statusEl.textContent = "Ready";
    bodyEl.innerHTML = `<p class="muted">No structured result to display.</p>`;
    return;
  }

  if (isConvertResultPayload(payload)) {
    renderConvertResult(payload);
    return;
  }

  if (isJobPayload(payload)) {
    renderJob(payload);
    return;
  }

  if (isSearchPayload(payload)) {
    renderSearch(payload);
    return;
  }

  renderGeneric(payload as ResultPayload);
}

function handleHostContextChanged(ctx: McpUiHostContext): void {
  if (ctx.theme) {
    applyDocumentTheme(ctx.theme);
    document.documentElement.setAttribute("data-theme", ctx.theme);
  }
  if (ctx.styles?.variables) {
    applyHostStyleVariables(ctx.styles.variables);
  }
  if (ctx.styles?.css?.fonts) {
    applyHostFonts(ctx.styles.css.fonts);
  }
}

const app = new App({ name: "ParaDOCS Convert", version: "0.2.0" });

app.onteardown = async () => ({});
app.onerror = console.error;
app.onhostcontextchanged = handleHostContextChanged;

app.ontoolresult = (result) => {
  renderResult(result);
};

app.connect().then(() => {
  const ctx = app.getHostContext();
  if (ctx) {
    handleHostContextChanged(ctx);
  }
});
