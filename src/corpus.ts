import fs from "node:fs";
import path from "node:path";
import {
  DOC_GLOBS,
  corpusRelativePath,
  getCorpora,
  getGuidesRoot,
  normalizeCorpusPath,
  type CorpusDef,
  type DocArea,
} from "./config.js";
import { assertInsideRoot, toRelative } from "./paths.js";

export type DocEntry = {
  relativePath: string;
  absolutePath: string;
  title: string;
  /** Corpus id (guides sub-areas use user-guide / admin-guide / root). */
  area: DocArea;
  corpus: string;
  sizeBytes: number;
  modifiedAt: string;
};

export type CorpusSummary = {
  id: string;
  label: string;
  root: string;
  kind: CorpusDef["kind"];
  present: boolean;
  docCount: number;
  areas?: Record<string, number>;
};

function guidesAreaFor(relativePath: string): DocArea {
  if (relativePath.startsWith("user-guide/")) {
    return "user-guide";
  }
  if (relativePath.startsWith("admin-guide/")) {
    return "admin-guide";
  }
  return "root";
}

function titleFromMarkdown(absolutePath: string, fallback: string): string {
  try {
    const head = fs.readFileSync(absolutePath, "utf8").slice(0, 2000);
    const m = head.match(/^#\s+(.+)$/m);
    if (m?.[1]) {
      return m[1].trim();
    }
  } catch {
    // ignore
  }
  return fallback;
}

function walkGuidesMarkdown(dir: string, root: string, out: DocEntry[]): void {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".")) {
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkGuidesMarkdown(full, root, out);
      continue;
    }
    if (!entry.isFile() || !entry.name.toLowerCase().endsWith(".md")) {
      continue;
    }
    const st = fs.statSync(full);
    const relativePath = toRelative(full, root);
    out.push({
      relativePath,
      absolutePath: full,
      title: titleFromMarkdown(full, entry.name),
      area: guidesAreaFor(relativePath),
      corpus: "guides",
      sizeBytes: st.size,
      modifiedAt: st.mtime.toISOString(),
    });
  }
}

function pushTreeDocFile(
  out: DocEntry[],
  seen: Set<string>,
  absolutePath: string,
  corpus: CorpusDef,
): void {
  if (!fs.existsSync(absolutePath) || !fs.statSync(absolutePath).isFile()) {
    return;
  }
  if (!absolutePath.toLowerCase().endsWith(".md")) {
    return;
  }
  const base = path.basename(absolutePath);
  if (base.startsWith("_")) {
    return;
  }
  const relativePath = corpusRelativePath(absolutePath, corpus);
  const key = relativePath.toLowerCase();
  if (seen.has(key)) {
    return;
  }
  const st = fs.statSync(absolutePath);
  out.push({
    relativePath,
    absolutePath,
    title: titleFromMarkdown(absolutePath, base),
    area: corpus.id,
    corpus: corpus.id,
    sizeBytes: st.size,
    modifiedAt: st.mtime.toISOString(),
  });
  seen.add(key);
}

/** Dependency and build output folders when a corpus root is a full git repo. */
const TREE_CORPUS_SKIP_DIRS = new Set([
  "node_modules",
  "vendor",
  "site",
  "public",
  ".venv",
  "venv",
  "dist",
  "build",
  "coverage",
]);

function walkTreeCorpus(
  dir: string,
  corpus: CorpusDef,
  out: DocEntry[],
  seen: Set<string>,
): void {
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".") || entry.name.startsWith("_")) {
      continue;
    }
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (TREE_CORPUS_SKIP_DIRS.has(entry.name.toLowerCase())) {
        continue;
      }
      walkTreeCorpus(full, corpus, out, seen);
      continue;
    }
    if (!entry.isFile() || !entry.name.toLowerCase().endsWith(".md")) {
      continue;
    }
    pushTreeDocFile(out, seen, full, corpus);
  }
}

function loadGuidesCorpus(out: DocEntry[]): void {
  const root = getGuidesRoot();
  assertInsideRoot(root, root);
  if (!fs.existsSync(root)) {
    throw new Error(`Guides corpus root does not exist: ${root}`);
  }

  for (const dirName of DOC_GLOBS.directories) {
    const dir = path.join(root, dirName);
    if (fs.existsSync(dir)) {
      walkGuidesMarkdown(dir, root, out);
    }
  }

  for (const fileName of DOC_GLOBS.rootFiles) {
    const full = path.join(root, fileName);
    if (!fs.existsSync(full) || !fs.statSync(full).isFile()) {
      continue;
    }
    const st = fs.statSync(full);
    const relativePath = toRelative(full, root);
    out.push({
      relativePath,
      absolutePath: full,
      title: titleFromMarkdown(full, fileName),
      area: "root",
      corpus: "guides",
      sizeBytes: st.size,
      modifiedAt: st.mtime.toISOString(),
    });
  }
}

function matchesFilter(doc: DocEntry, filter: DocArea | "all"): boolean {
  if (filter === "all") {
    return true;
  }
  if (filter === "guides") {
    return doc.corpus === "guides";
  }
  if (filter === "user-guide" || filter === "admin-guide" || filter === "root") {
    return doc.area === filter;
  }
  return doc.corpus === filter || doc.area === filter;
}

export function listDocs(options?: {
  area?: DocArea | "all";
  corpus?: DocArea | "all";
}): DocEntry[] {
  const out: DocEntry[] = [];
  loadGuidesCorpus(out);

  const seen = new Set(out.map((d) => d.relativePath.toLowerCase()));
  for (const corpus of getCorpora()) {
    if (corpus.kind !== "tree") {
      continue;
    }
    if (!fs.existsSync(corpus.root) || !fs.statSync(corpus.root).isDirectory()) {
      continue;
    }
    walkTreeCorpus(corpus.root, corpus, out, seen);
  }

  const filter = options?.corpus ?? options?.area ?? "all";
  const filtered = out.filter((d) => matchesFilter(d, filter));
  filtered.sort((a, b) => a.relativePath.localeCompare(b.relativePath));
  return filtered;
}

/** Summary of every configured corpus and how many Markdown docs are loaded. */
export function listCorpora(): {
  corpora: CorpusSummary[];
  totalDocs: number;
} {
  const docs = listDocs({ area: "all" });
  const byCorpus = new Map<string, DocEntry[]>();
  for (const doc of docs) {
    const list = byCorpus.get(doc.corpus) ?? [];
    list.push(doc);
    byCorpus.set(doc.corpus, list);
  }

  const corpora: CorpusSummary[] = getCorpora().map((c) => {
    const present =
      fs.existsSync(c.root) &&
      (c.kind === "guides" || fs.statSync(c.root).isDirectory());
    const entries = byCorpus.get(c.id) ?? [];
    const summary: CorpusSummary = {
      id: c.id,
      label: c.label,
      root: c.root,
      kind: c.kind,
      present,
      docCount: entries.length,
    };
    if (c.kind === "guides") {
      summary.areas = {
        "user-guide": entries.filter((d) => d.area === "user-guide").length,
        "admin-guide": entries.filter((d) => d.area === "admin-guide").length,
        root: entries.filter((d) => d.area === "root").length,
      };
    }
    return summary;
  });

  return {
    corpora,
    totalDocs: docs.length,
  };
}

export function findDocEntry(relativePath: string): DocEntry | undefined {
  const norm = normalizeCorpusPath(relativePath);
  return listDocs().find((d) => d.relativePath.replace(/\\/g, "/") === norm);
}

export function readDocText(absolutePath: string): string {
  return fs.readFileSync(absolutePath, "utf8");
}
