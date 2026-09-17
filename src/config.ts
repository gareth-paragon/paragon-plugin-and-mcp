import path from "node:path";
import { fileURLToPath } from "node:url";

const MCP_PACKAGE_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function requireEnvPath(name: string): string {
  const fromEnv = process.env[name]?.trim();
  if (fromEnv) {
    return path.resolve(fromEnv);
  }
  throw new Error(
    `Set ${name} to a local folder path (MCP env, shell, or gitignored .env.local; see examples/local.env.example).`,
  );
}

/** Doc trees and root files for the guides corpus (relative to guides root). */
export const DOC_GLOBS = {
  directories: ["user-guide", "admin-guide"],
  rootFiles: ["README.md", "AGENTS.md", "Paragon_Markdown_Style_Rules.md"],
} as const;

export const MAX_TEXT_CHARS = 100_000;
export const SEARCH_SNIPPET_CHARS = 280;
export const SEARCH_MAX_HITS = 40;

export type CorpusKind = "guides" | "tree";

/** First-class documentation corpus (guides, tech-arch, abbey-view, …). */
export type CorpusDef = {
  id: string;
  label: string;
  root: string;
  kind: CorpusKind;
};

/**
 * Area filter for list/search.
 * Guides use user-guide / admin-guide / root; tree corpora use their corpus id.
 */
export type DocArea =
  | "user-guide"
  | "admin-guide"
  | "root"
  | "guides"
  | "tech-arch"
  | "abbey-view"
  | string;

export function getRepoRoot(): string {
  return requireEnvPath("PARAGON_CURSOR_DOCS_ROOT");
}

/** Alias for guides corpus root (cursor-test). */
export function getGuidesRoot(): string {
  return getRepoRoot();
}

/**
 * Technical Documentation repo root (corpora live under ``corpus/``).
 * Env `PARAGON_PARADOCS_REPO`.
 */
export function getParadocsRepoRoot(): string {
  return requireEnvPath("PARAGON_PARADOCS_REPO");
}

/** ``<Technical Documentation>/corpus`` — tech-arch + abbey-view Markdown trees. */
export function getCorpusRoot(): string {
  const fromEnv = process.env.PARAGON_DOCS_CORPUS_ROOT?.trim();
  if (fromEnv && fromEnv.length > 0) {
    return path.resolve(fromEnv);
  }
  return path.join(getParadocsRepoRoot(), "corpus");
}

function defaultTreeCorpora(): CorpusDef[] {
  const corpusRoot = getCorpusRoot();
  return [
    {
      id: "tech-arch",
      label: "Technical Architecture library",
      root: path.join(corpusRoot, "tech-arch"),
      kind: "tree",
    },
    {
      id: "abbey-view",
      label: "Abbey View wiki",
      root: path.join(corpusRoot, "abbey-view"),
      kind: "tree",
    },
  ];
}

/**
 * Parse `id=absPath` or bare absPath (id = basename), semicolon-separated.
 */
function parseCorpusDirList(raw: string): CorpusDef[] {
  const out: CorpusDef[] = [];
  const seen = new Set<string>();
  for (const part of raw.split(";")) {
    const token = part.trim();
    if (!token) {
      continue;
    }
    let id: string;
    let rootRaw: string;
    const eq = token.indexOf("=");
    if (eq > 0) {
      id = token.slice(0, eq).trim();
      rootRaw = token.slice(eq + 1).trim();
    } else {
      rootRaw = token;
      id = path.basename(path.resolve(rootRaw));
    }
    // Empty path after `id=` must not become process.cwd() via path.resolve("").
    if (!id || !rootRaw || seen.has(id.toLowerCase())) {
      continue;
    }
    const root = path.resolve(rootRaw);
    seen.add(id.toLowerCase());
    out.push({
      id,
      label: id,
      root,
      kind: "tree",
    });
  }
  return out;
}

/**
 * Tree corpora (Markdown directories).
 *
 * Env `PARAGON_CURSOR_CORPORA`: semicolon-separated `id=absolutePath` (or bare
 * absolute paths; id defaults to folder basename). When unset, defaults to
 * ``<PARAGON_PARADOCS_REPO>/corpus/tech-arch`` and ``.../abbey-view``.
 *
 * Legacy: `PARAGON_CURSOR_EXTRA_DOCS_DIR` is still read if `PARAGON_CURSOR_CORPORA`
 * is unset (same semicolon path list). Prefer `PARAGON_CURSOR_CORPORA`.
 */
export function getTreeCorpora(): CorpusDef[] {
  const preferred = process.env.PARAGON_CURSOR_CORPORA?.trim();
  if (preferred !== undefined) {
    if (preferred.length === 0) {
      return [];
    }
    return parseCorpusDirList(preferred);
  }
  const legacy = process.env.PARAGON_CURSOR_EXTRA_DOCS_DIR?.trim();
  if (legacy && legacy.length > 0) {
    return parseCorpusDirList(legacy);
  }
  return defaultTreeCorpora();
}

/** All corpora currently configured (guides + tree corpora). */
export function getCorpora(): CorpusDef[] {
  return [
    {
      id: "guides",
      label: "Paragon Cursor guides (User Guide, Admin Guide, root docs)",
      root: getGuidesRoot(),
      kind: "guides",
    },
    ...getTreeCorpora(),
  ];
}

/** Absolute roots for tree corpora (used for unavailable indexes, etc.). */
export function getTreeCorpusRoots(): string[] {
  return getTreeCorpora().map((c) => c.root);
}

/**
 * Virtual corpus path for a file under a tree corpus.
 * Example: `tech-arch/General/Foo.md`
 */
export function corpusRelativePath(
  absolutePath: string,
  corpus: CorpusDef,
): string {
  const rel = path.relative(corpus.root, absolutePath).split(path.sep).join("/");
  return `${corpus.id}/${rel}`;
}

/**
 * Normalize caller paths: accept legacy `external/<corpus>/...` as `<corpus>/...`.
 */
export function normalizeCorpusPath(relativePath: string): string {
  const norm = relativePath.replace(/\\/g, "/").replace(/^\/+/, "");
  if (norm.startsWith("external/")) {
    return norm.slice("external/".length);
  }
  return norm;
}

/** @internal used by path helpers / tests */
export function getMcpPackageRoot(): string {
  return MCP_PACKAGE_ROOT;
}
