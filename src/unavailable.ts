import fs from "node:fs";
import path from "node:path";
import { getTreeCorpusRoots } from "./config.js";

export type UnavailableDoc = {
  title: string;
  source_file: string;
  reason: string;
};

const REASON_LABEL: Record<string, string> = {
  sharepoint_online_only:
    "the SharePoint/OneDrive file was online-only (not downloaded locally) at conversion time",
  legacy_doc_skipped:
    "legacy .doc conversion is deferred for this test MCP (Word COM dialogs)",
  convert_failed: "conversion failed",
};

function unavailablePaths(): string[] {
  return getTreeCorpusRoots().map((dir) => path.join(dir, "_unavailable.json"));
}

export function loadUnavailableDocs(): UnavailableDoc[] {
  const out: UnavailableDoc[] = [];
  const seen = new Set<string>();
  for (const file of unavailablePaths()) {
    if (!fs.existsSync(file)) {
      continue;
    }
    try {
      const raw = JSON.parse(fs.readFileSync(file, "utf8")) as {
        docs?: UnavailableDoc[];
      };
      if (!Array.isArray(raw.docs)) {
        continue;
      }
      for (const doc of raw.docs) {
        const key = `${doc.title}\0${doc.source_file}\0${doc.reason}`.toLowerCase();
        if (seen.has(key)) {
          continue;
        }
        seen.add(key);
        out.push(doc);
      }
    } catch {
      // ignore malformed unavailable indexes
    }
  }
  return out;
}

/** True if query meaningfully matches an unavailable document title. */
export function titleMatchesQuery(title: string, query: string): boolean {
  const t = title.toLowerCase();
  const q = query.trim().toLowerCase();
  if (!q || q.length < 3) {
    return false;
  }
  if (t.includes(q)) {
    return true;
  }
  if (q.length >= 8 && q.includes(t) && t.length >= 8) {
    return true;
  }
  const tokens = t
    .split(/[^a-z0-9]+/i)
    .map((x) => x.toLowerCase())
    .filter((x) => x.length >= 4 && !/^\d+$/.test(x));
  if (tokens.length === 0) {
    return false;
  }
  const hits = tokens.filter((tok) => q.includes(tok));
  return hits.length >= 2 && hits.join("").length >= 8;
}

export function unavailableNotice(doc: UnavailableDoc): string {
  const why = REASON_LABEL[doc.reason] ?? doc.reason;
  return (
    `Not available in this MCP corpus. A Technical Architecture library document ` +
    `titled "${doc.title}" matched your search, but its body was not converted ` +
    `(${why}). Source: ${doc.source_file}. Open it in SharePoint, or ask an admin ` +
    `to download/convert it for the corpus.`
  );
}
