import fs from "node:fs";
import path from "node:path";

/** Formats OCR skips (EMF/WMF) or empty Tesseract output. */
const MEDIA_EXT_RE =
  /\.(?:png|jpe?g|gif|bmp|tif{1,2}|emf|wmf|svg)$/i;

/** Queries where unread diagrams are likely material to the answer. */
const DIAGRAM_RELEVANT_RE =
  /\b(diagram|figure|architecture|topo(?:logy)?|network\s+(?:diagram|drawing|map)|schematic|flow\s*charts?|flowchart|drawing|illustration|visio|embedded\s+images?|ocr)\b/i;

export type DiagramOcrStatus = {
  /** True when front matter or an OCR section indicates a pass ran. */
  ocrPass: boolean;
  /** Embedded media names referenced in convert placeholders. */
  mediaPlaceholders: string[];
  /** Image files under the sibling `.assets` folder. */
  assetImages: string[];
  /** Paths/names that have an OCR `###` block. */
  ocrBlocks: string[];
  /** Media/assets believed to lack usable OCR text. */
  unread: string[];
  unreadCount: number;
  /** Short agent-facing notice, or null when nothing to report. */
  notice: string | null;
};

function basenameKey(name: string): string {
  return path.basename(name).toLowerCase().replace(/\\/g, "/");
}

function listAssetImages(absolutePath: string): string[] {
  const dir = absolutePath.replace(/\.md$/i, ".assets");
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    return [];
  }
  try {
    return fs
      .readdirSync(dir)
      .filter((name) => MEDIA_EXT_RE.test(name))
      .map((name) => `${path.basename(dir)}/${name}`);
  } catch {
    return [];
  }
}

function mediaPlaceholdersFromText(text: string): string[] {
  const found = new Set<string>();
  // Convert placeholders: ----media/image6.emf---- or ----Image alt text---->x<----/media/image7.png----
  for (const m of text.matchAll(
    /media\/([^\s"'<>\]]+?\.(?:png|jpe?g|gif|bmp|tif{1,2}|emf|wmf|svg))/gi,
  )) {
    if (m[1]) {
      found.add(m[1].replace(/\\/g, "/"));
    }
  }
  return [...found];
}

function ocrBlocksFromText(text: string): string[] {
  const idx = text.indexOf("## Extracted diagram text");
  if (idx < 0) {
    return [];
  }
  const section = text.slice(idx);
  const blocks: string[] = [];
  for (const m of section.matchAll(/^###\s+`([^`]+)`/gm)) {
    if (m[1]) {
      blocks.push(m[1].replace(/\\/g, "/"));
    }
  }
  // Explicit unread list written by a newer OCR pass
  const unreadIdx = section.search(/^###\s+Unreadable or empty OCR\s*$/im);
  if (unreadIdx >= 0) {
    const unreadPart = section.slice(unreadIdx);
    for (const m of unreadPart.matchAll(/^- `([^`]+)`/gm)) {
      if (m[1] && !blocks.includes(m[1])) {
        // listed as unread intentionally; keep out of "has OCR" set
      }
    }
  }
  return blocks;
}

function explicitUnreadFromText(text: string): string[] {
  const idx = text.indexOf("## Extracted diagram text");
  if (idx < 0) {
    return [];
  }
  const section = text.slice(idx);
  const unreadIdx = section.search(/^###\s+Unreadable or empty OCR\s*$/im);
  if (unreadIdx < 0) {
    return [];
  }
  const unreadPart = section.slice(unreadIdx);
  const nextHeading = unreadPart.slice(1).search(/^###\s+/m);
  const chunk =
    nextHeading >= 0 ? unreadPart.slice(0, nextHeading + 1) : unreadPart;
  const out: string[] = [];
  for (const m of chunk.matchAll(/^- `([^`]+)`/gm)) {
    if (m[1]) {
      out.push(m[1].replace(/\\/g, "/"));
    }
  }
  return out;
}

function frontMatterUnreadCount(text: string): number | null {
  const head = text.slice(0, 800);
  const m = head.match(/^ocr_unread:\s*(\d+)\s*$/m);
  if (!m?.[1]) {
    return null;
  }
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

/**
 * Inspect a corpus Markdown page for diagrams/images that OCR did not capture.
 */
export function analyzeDiagramOcr(
  absolutePath: string,
  text: string,
): DiagramOcrStatus {
  const head = text.slice(0, 1200);
  const ocrPass =
    /ocr_pass:\s*true/i.test(head) || text.includes("## Extracted diagram text");
  const mediaPlaceholders = mediaPlaceholdersFromText(text);
  const assetImages = listAssetImages(absolutePath);
  const ocrBlocks = ocrBlocksFromText(text);
  const explicitUnread = explicitUnreadFromText(text);

  const ocrKeys = new Set(ocrBlocks.map(basenameKey));
  const unread = new Set<string>(explicitUnread);

  for (const media of mediaPlaceholders) {
    const base = basenameKey(media);
    const ext = path.extname(base).toLowerCase();
    // Vector/metafile embeds are skipped by the OCR extractor.
    if (ext === ".emf" || ext === ".wmf") {
      unread.add(media);
      continue;
    }
    if (!ocrKeys.has(base)) {
      unread.add(media);
    }
  }

  for (const asset of assetImages) {
    const base = basenameKey(asset);
    if (!ocrKeys.has(base)) {
      unread.add(asset);
    }
  }

  // Front-matter count from a newer OCR pass when lists are absent.
  const fmUnread = frontMatterUnreadCount(text);
  let unreadList = [...unread];
  if (unreadList.length === 0 && fmUnread && fmUnread > 0) {
    unreadList = [`(${fmUnread} embedded image(s) with no usable OCR text)`];
  }

  // Heuristic: OCR ran, media/assets imply diagrams, but almost no OCR blocks.
  if (
    unreadList.length === 0 &&
    ocrPass &&
    mediaPlaceholders.length + assetImages.length >= 2 &&
    ocrBlocks.length <= 1
  ) {
    const implied =
      mediaPlaceholders.length + assetImages.length - ocrBlocks.length;
    if (implied > 0) {
      unreadList = [
        `(about ${implied} embedded image(s) with little or no usable OCR text)`,
      ];
    }
  }

  const unreadCount =
    fmUnread && fmUnread > unreadList.length ? fmUnread : unreadList.length;

  let notice: string | null = null;
  if (unreadCount > 0) {
    const sample = unreadList.slice(0, 8).join(", ");
    const more =
      unreadList.length > 8 ? ` (+${unreadList.length - 8} more)` : "";
    notice =
      `NOTICE: This document has ${unreadCount} embedded diagram(s)/image(s) that could not be read with OCR` +
      ` (empty Tesseract output, skipped EMF/WMF, or missing extract). ` +
      `Visual content may be missing from search and get_doc answers; treat architecture/network claims as incomplete unless confirmed in prose.` +
      (sample ? ` Unreadable: ${sample}${more}.` : "");
  }

  return {
    ocrPass,
    mediaPlaceholders,
    assetImages,
    ocrBlocks,
    unread: unreadList,
    unreadCount,
    notice,
  };
}

/** True when the user query likely needs diagram content. */
export function querySuggestsDiagramNeed(query: string): boolean {
  return DIAGRAM_RELEVANT_RE.test(query.trim());
}

/**
 * Whether to surface an unread-diagram notice for this call.
 * get_doc passes query=null (always surface when present).
 * search surfaces when the query looks diagram-related, or when the OCR gap is large.
 */
export function shouldSurfaceUnreadDiagrams(
  query: string | null,
  status: DiagramOcrStatus,
): boolean {
  if (!status.notice || status.unreadCount <= 0) {
    return false;
  }
  if (query === null) {
    return true;
  }
  if (querySuggestsDiagramNeed(query)) {
    return true;
  }
  // Large visual gap on a TDD-style page: still warn even for prosaic queries.
  return status.unreadCount >= 2 && status.ocrBlocks.length <= 1;
}

export function diagramOcrPayload(
  status: DiagramOcrStatus,
  opts?: { includeNotice: boolean },
): Record<string, unknown> | null {
  if (status.unreadCount <= 0) {
    return null;
  }
  const includeNotice = opts?.includeNotice !== false;
  return {
    unreadCount: status.unreadCount,
    unreadSample: status.unread.slice(0, 12),
    ocrBlockCount: status.ocrBlocks.length,
    mediaPlaceholderCount: status.mediaPlaceholders.length,
    ...(includeNotice && status.notice ? { notice: status.notice } : {}),
  };
}
