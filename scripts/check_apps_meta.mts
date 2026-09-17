/**
 * Diagnose MCP Apps wiring: tools/list _meta + resources/list + resources/read.
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

const client = new Client({ name: "apps-meta-check", version: "0.0.1" });
await client.connect(transport);

const tools = await client.listTools();
const withUi = tools.tools.filter((t) => {
  const meta = t._meta as Record<string, unknown> | undefined;
  const ui = meta?.ui as { resourceUri?: string } | undefined;
  return Boolean(ui?.resourceUri || meta?.["ui/resourceUri"]);
});
console.log(`tools: ${tools.tools.length}, with UI meta: ${withUi.length}`);
for (const t of withUi.slice(0, 3)) {
  console.log(`  ${t.name}: ${JSON.stringify(t._meta)}`);
}
if (withUi.length !== tools.tools.length) {
  const missing = tools.tools.filter((t) => !withUi.some((u) => u.name === t.name)).map((t) => t.name);
  console.log(`MISSING UI META: ${missing.join(", ")}`);
}

const resources = await client.listResources();
console.log(`resources: ${resources.resources.length}`);
for (const r of resources.resources) {
  console.log(`  ${r.uri} mime=${r.mimeType}`);
}

const uri = "ui://paragon-knowledge/app.html";
const read = await client.readResource({ uri });
const text = read.contents[0] && "text" in read.contents[0] ? String(read.contents[0].text) : "";
console.log(`resources/read ${uri}: ${text.length} chars`);

const call = await client.callTool({ name: "list_corpora", arguments: {} });
const content = (call as { content?: Array<{ type: string }> }).content ?? [];
console.log(
  `list_corpora content types: ${content.map((c) => c.type).join(", ")}`,
);

await client.close();
process.exit(withUi.length === tools.tools.length && text.length > 1000 ? 0 : 1);
