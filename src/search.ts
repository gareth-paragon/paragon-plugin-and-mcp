import { SEARCH_MAX_HITS, SEARCH_SNIPPET_CHARS, type DocArea } from "./config.js";
import { listDocs, readDocText, type DocEntry } from "./corpus.js";
import {
  analyzeDiagramOcr,
  diagramOcrPayload,
  shouldSurfaceUnreadDiagrams,
} from "./diagramOcr.js";
import {
  loadUnavailableDocs,
  titleMatchesQuery,
  unavailableNotice,
} from "./unavailable.js";

export type SearchHit = {
  relativePath: string;
  title: string;
  area: DocEntry["area"] | "unavailable";
  matchIn: "path" | "title" | "content" | "multiple" | "unavailable_title";
  snippet: string;
  unavailable?: boolean;
  /** Present when unread OCR diagrams are relevant to this query. */
  diagramOcr?: Record<string, unknown>;
  unreadDiagrams?: boolean;
};

function snippetAround(text: string, query: string): string {
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const idx = lower.indexOf(q);
  if (idx < 0) {
    return text.slice(0, SEARCH_SNIPPET_CHARS).replace(/\s+/g, " ").trim();
  }
  const start = Math.max(0, idx - 100);
  const end = Math.min(text.length, idx + query.length + 180);
  let snip = text.slice(start, end).replace(/\s+/g, " ").trim();
  if (start > 0) {
    snip = "…" + snip;
  }
  if (end < text.length) {
    snip = snip + "…";
  }
  if (snip.length > SEARCH_SNIPPET_CHARS) {
    snip = snip.slice(0, SEARCH_SNIPPET_CHARS) + "…";
  }
  return snip;
}

export function searchDocs(
  query: string,
  options?: {
    area?: DocArea | "all";
    corpus?: DocArea | "all";
    contentSearch?: boolean;
  },
): { hits: SearchHit[]; scannedDocs: number } {
  const q = query.trim();
  if (!q) {
    throw new Error("query must not be empty");
  }
  const qLower = q.toLowerCase();
  const filter = options?.corpus ?? options?.area ?? "all";
  const docs = listDocs({ corpus: filter });
  const contentSearch = options?.contentSearch !== false;
  const hits: SearchHit[] = [];

  for (const doc of docs) {
    if (hits.length >= SEARCH_MAX_HITS) {
      break;
    }
    const pathMatch = doc.relativePath.toLowerCase().includes(qLower);
    const titleMatch = doc.title.toLowerCase().includes(qLower);
    let contentMatch = false;
    let snippet = "";

    let text = "";
    if (contentSearch) {
      text = readDocText(doc.absolutePath);
      if (text.toLowerCase().includes(qLower)) {
        contentMatch = true;
        snippet = snippetAround(text, q);
      }
    }

    if (!pathMatch && !titleMatch && !contentMatch) {
      continue;
    }

    const matchCount = [pathMatch, titleMatch, contentMatch].filter(Boolean).length;
    let matchIn: SearchHit["matchIn"] = "content";
    if (matchCount > 1) {
      matchIn = "multiple";
    } else if (pathMatch) {
      matchIn = "path";
    } else if (titleMatch) {
      matchIn = "title";
    }

    if (!contentMatch) {
      snippet = titleMatch ? `Title: ${doc.title}` : `Path: ${doc.relativePath}`;
    }

    const hit: SearchHit = {
      relativePath: doc.relativePath,
      title: doc.title,
      area: doc.area,
      matchIn,
      snippet,
    };

    if (!text) {
      text = readDocText(doc.absolutePath);
    }
    const diagramStatus = analyzeDiagramOcr(doc.absolutePath, text);
    if (shouldSurfaceUnreadDiagrams(q, diagramStatus)) {
      const diagram = diagramOcrPayload(diagramStatus, { includeNotice: true });
      if (diagram) {
        hit.unreadDiagrams = true;
        hit.diagramOcr = diagram;
        if (diagramStatus.notice && !hit.snippet.includes("NOTICE:")) {
          hit.snippet = `${diagramStatus.notice} ${hit.snippet}`.trim();
        }
      }
    }

    hits.push(hit);
  }

  // Title-only notices for library docs that were not converted into the corpus
  const includeUnavailable =
    filter === "all" || filter === "tech-arch" || filter === "external";
  if (includeUnavailable) {
    for (const missing of loadUnavailableDocs()) {
      if (hits.length >= SEARCH_MAX_HITS) {
        break;
      }
      if (!titleMatchesQuery(missing.title, q)) {
        continue;
      }
      const already = hits.some(
        (h) =>
          h.title.toLowerCase() === missing.title.toLowerCase() ||
          h.relativePath.toLowerCase().includes(missing.title.toLowerCase()),
      );
      if (already) {
        continue;
      }
      hits.push({
        relativePath: `unavailable/${missing.source_file}`,
        title: missing.title,
        area: "unavailable",
        matchIn: "unavailable_title",
        unavailable: true,
        snippet: unavailableNotice(missing),
      });
    }
  }

  return { hits, scannedDocs: docs.length };
}

export function docMetadata(doc: DocEntry): Record<string, unknown> {
  return {
    relativePath: doc.relativePath,
    title: doc.title,
    corpus: doc.corpus,
    area: doc.area,
    sizeBytes: doc.sizeBytes,
    modifiedAt: doc.modifiedAt,
  };
}
