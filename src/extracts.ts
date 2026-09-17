import { listDocs, readDocText, findDocEntry } from "./corpus.js";
import {
  analyzeDiagramOcr,
  diagramOcrPayload,
  shouldSurfaceUnreadDiagrams,
} from "./diagramOcr.js";
import { NotFoundError } from "./paths.js";
import { MAX_TEXT_CHARS } from "./config.js";

function findDoc(relativePath: string) {
  const hit = findDocEntry(relativePath);
  if (!hit) {
    throw new NotFoundError(`Doc not found: ${relativePath}`);
  }
  return hit;
}

function truncate(text: string): { text: string; truncated: boolean } {
  if (text.length <= MAX_TEXT_CHARS) {
    return { text, truncated: false };
  }
  return {
    text: text.slice(0, MAX_TEXT_CHARS) + `\n\n[truncated at ${MAX_TEXT_CHARS} characters]`,
    truncated: true,
  };
}

export function getGuidePage(relativePath: string) {
  const doc = findDoc(relativePath);
  const raw = readDocText(doc.absolutePath);
  const diagramStatus = analyzeDiagramOcr(doc.absolutePath, raw);
  const surface = shouldSurfaceUnreadDiagrams(null, diagramStatus);
  const { text, truncated } = truncate(raw);
  const textWithNotice =
    surface && diagramStatus.notice ? `${diagramStatus.notice}\n\n${text}` : text;
  return {
    relativePath: doc.relativePath,
    absolutePath: doc.absolutePath,
    title: doc.title,
    corpus: doc.corpus,
    area: doc.area,
    truncated,
    fullLength: raw.length,
    text: textWithNotice,
    ...(surface
      ? { diagramOcr: diagramOcrPayload(diagramStatus, { includeNotice: true }) }
      : {}),
  };
}

/** Pull a useful slice: from an H2 heading through the next H2, or whole file if short. */
function sectionByHeading(text: string, headingPattern: RegExp): string | null {
  const lines = text.split(/\r?\n/);
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (headingPattern.test(lines[i] ?? "")) {
      start = i;
      break;
    }
  }
  if (start < 0) {
    return null;
  }
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (/^##\s+/.test(lines[i] ?? "")) {
      end = i;
      break;
    }
  }
  return lines.slice(start, end).join("\n").trim();
}

export function getApprovedPluginsAndMcps() {
  const doc = findDoc("user-guide/06-Approved-plugins-and-MCPs.md");
  const text = readDocText(doc.absolutePath);
  return {
    relativePath: doc.relativePath,
    title: doc.title,
    text: truncate(text).text,
    note: "Full User Guide page 06 (approved plugins and MCPs).",
  };
}

export function getApprovedModels() {
  const doc = findDoc("user-guide/05-Approved-models.md");
  const text = readDocText(doc.absolutePath);
  return {
    relativePath: doc.relativePath,
    title: doc.title,
    text: truncate(text).text,
  };
}

export function getNacSummary() {
  const doc = findDoc("user-guide/08-Network-Access-Controls.md");
  const text = readDocText(doc.absolutePath);
  return {
    relativePath: doc.relativePath,
    title: doc.title,
    text: truncate(text).text,
    note: "User-facing NAC summary. Admin Guide §3.2 is authoritative for the full pattern table.",
  };
}

export function getChangeFormInfo() {
  const doc = findDoc("user-guide/04-Cursor-Change-Form.md");
  const text = readDocText(doc.absolutePath);
  return {
    relativePath: doc.relativePath,
    title: doc.title,
    text: truncate(text).text,
  };
}

export function getGovernanceAi02() {
  // Prefer user-guide copy for staff-facing; admin-guide has a copy too
  const ug = listDocs().find((d) => d.relativePath === "user-guide/AI02-Business-Use-of-Artificial-Intelligence.md");
  const ag = listDocs().find((d) => d.relativePath === "admin-guide/AI02-Business-Use-of-Artificial-Intelligence.md");
  const doc = ug ?? ag;
  if (!doc) {
    throw new NotFoundError("AI02 document not found under user-guide/ or admin-guide/");
  }
  const text = readDocText(doc.absolutePath);
  return {
    relativePath: doc.relativePath,
    title: doc.title,
    text: truncate(text).text,
    alsoAt: ug && ag && ug.relativePath !== ag.relativePath ? ag.relativePath : undefined,
  };
}

export function getAdminOverview() {
  const doc = findDoc("admin-guide/CursorAI-Administration.md");
  const text = readDocText(doc.absolutePath);
  // Prefer opening + first sections rather than dumping the whole huge admin guide by default
  const intro = sectionByHeading(text, /^#\s+/) ?? text.slice(0, 8000);
  const { text: body, truncated } = truncate(intro.length < 12000 ? text.slice(0, 12000) : intro);
  return {
    relativePath: doc.relativePath,
    title: doc.title,
    truncated: truncated || text.length > body.length,
    text: body,
    note: "Admin Guide is large; use get_doc with a path or search_docs for specific sections.",
  };
}
