/**
 * Confirm large get_doc responses stay small enough for Apps UI.
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

const client = new Client({ name: "get-doc-size-check", version: "0.0.1" });
await client.connect(transport);

const call = await client.callTool({
  name: "get_doc",
  arguments: {
    relativePath:
      "tech-arch/General/Client/Skipton/Outbound - Project Sappho/TDD/Skipton Outbound Project Sappho TDD v1.1.md",
  },
});

const content = (call as { content?: Array<{ type: string; text?: string }> }).content ?? [];
const textPart = content.find((c) => c.type === "text");
const n = textPart?.text ? textPart.text.length : 0;
const sc = (call as { structuredContent?: Record<string, unknown> }).structuredContent;

console.log("content chars", n);
console.log("has absolutePath", Boolean(sc?.absolutePath));
console.log("truncated", sc?.truncated);
console.log(
  "preview has Overview",
  typeof sc?.text === "string" && /Overview/i.test(String(sc.text)),
);
console.log("meta", JSON.stringify((call as { _meta?: unknown })._meta ?? {}));

await client.close();
process.exit(n > 0 && n < 12_000 ? 0 : 1);
