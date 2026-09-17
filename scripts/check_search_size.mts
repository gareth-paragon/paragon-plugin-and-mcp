/**
 * Confirm Benton-style search stays small enough for Apps UI + chip logo.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { loadEnvLocal } from "../src/loadEnvLocal.ts";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
loadEnvLocal(repoRoot);

for (const name of ["PARAGON_CURSOR_DOCS_ROOT", "PARAGON_PARADOCS_REPO"] as const) {
  if (!process.env[name]?.trim()) {
    console.error(`Set ${name} (or add it to .env.local; see examples/local.env.example).`);
    process.exit(1);
  }
}

const transport = new StdioClientTransport({
  command: "npx",
  args: ["tsx", "src/index.ts"],
  cwd: repoRoot,
  env: { ...process.env },
});

const client = new Client({ name: "search-size-check", version: "0.0.1" });
await client.connect(transport);

const call = await client.callTool({
  name: "search_docs",
  arguments: { query: "Project Benton", contentSearch: true },
});

const content = (call as { content?: Array<{ type: string; text?: string }> }).content ?? [];
const types = content.map((c) => c.type);
const textPart = content.find((c) => c.type === "text");
const n = textPart?.text ? textPart.text.length : 0;
const sc = (call as { structuredContent?: Record<string, unknown> }).structuredContent;
const hits = Array.isArray(sc?.hits) ? sc.hits.length : 0;

console.log("content types", types.join(", "));
console.log("content chars", n);
console.log("hits in payload", hits, "totalHits", sc?.totalHits);
console.log("hitsTruncated", sc?.hitsTruncated);

await client.close();
process.exit(types.includes("image") && n > 0 && n < 12_000 ? 0 : 1);
