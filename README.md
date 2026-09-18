# ParaDOCS — Cursor Team Marketplace

ParaDOCS is a Cursor plugin for converting Word and PDF sources to Markdown and for consistent technical documentation authoring. It ships a bundled convert MCP, reusable rules, and the `paragon-tech-docs` skill.

Repository: [github.com/paragon-cursor/paradocs](https://github.com/paragon-cursor/paradocs)

## What you get

- **`paradocs-convert` MCP** — convert `.docx` / `.pdf` to Markdown without installing ParaDOCS separately or mapping a path to `paradocs.py`.
- **MCP Apps chrome** — branded ParaDOCS progress and result panel in the agent thread.
- **ParaDOCS rules** for structure, style, terminology, and documentation quality.
- **`paragon-tech-docs` skill** for guided technical documentation authoring.
- **Team Marketplace packaging** with the ParaDOCS logo and metadata.

## Install from the Paragon Team Marketplace

1. Open Cursor team settings and go to **Team Marketplace**.
2. Find **ParaDOCS** in the Paragon marketplace and enable it for yourself or **Everyone** in the team.
3. Reopen Cursor and confirm **paradocs-convert** is connected under MCP tools.
4. Ask the agent to convert a document — specify the source file or folder and where Markdown should be written.

Python 3.10+ must be installed locally. The plugin creates `.paradocs-venv/` on first convert and installs bundled Python dependencies automatically.

### Optional plugin variable

- **`PARADOCS_DEFAULT_OUTPUT_DIR`** — default output folder when you omit `outputPath` / `outputDir` in convert tool calls.

## Example agent prompts

- “Convert `/path/to/spec.docx` to Markdown at `/path/to/output/spec.md` using ParaDOCS.”
- “Batch-convert everything under `/path/to/sources` into `/path/to/markdown` with the Main profile.”
- “What ripping profiles does ParaDOCS ship?”

## Repository layout

- `.cursor-plugin/` — plugin and marketplace manifests.
- `mcp.json` — bundled convert MCP registration.
- `engine/` — Python convert CLI, requirements, and bundled ripping profiles.
- `dist/` — prebuilt MCP server and MCP Apps UI (committed for marketplace installs).
- `rules/` — Cursor rules for documentation authoring.
- `skills/paragon-tech-docs/` — the technical documentation skill.
- `docs/` — plugin and MCP references.

## Build (maintainers)

```bash
npm install
npm run build
```

Produces `dist/index.js` (convert MCP) and `dist/ui/mcp-app.html` (Apps chrome).

Optional Paragon Knowledge server: `npm run build:server:knowledge` → `dist/knowledge/index.js` (requires corpus env vars; not shipped by default).

## Scope

The default Team Marketplace install is **convert + rules + skill**. Optional Paragon Knowledge read/search code lives under `src/knowledge/` for separate pilots — see [docs/Paragon-Knowledge-MCP-Overview.md](docs/Paragon-Knowledge-MCP-Overview.md).

For a detailed description of the packaged experience, see [docs/ParaDOCS-Plugin-Overview.md](docs/ParaDOCS-Plugin-Overview.md).
