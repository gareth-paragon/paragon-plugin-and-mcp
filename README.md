# ParaDOCS — Cursor Team Marketplace

ParaDOCS is a Cursor plugin for converting Word and PDF sources to Markdown and for consistent technical documentation authoring. It ships a bundled convert MCP, reusable rules, and the `paragon-tech-docs` skill.

Repository: [github.com/paragon-cursor/paradocs](https://github.com/paragon-cursor/paradocs)

## What you get

- **`paradocs-convert` MCP** — convert `.docx` / `.pdf` to Markdown without installing ParaDOCS separately or mapping a path to `paradocs.py`.
- **MCP Apps chrome** — branded ParaDOCS progress and result panel in the agent thread.
- **ParaDOCS rules** for structure, style, terminology, and documentation quality.
- **`paragon-tech-docs` skill** for guided technical documentation authoring.
- **Team Marketplace packaging** with the ParaDOCS logo and metadata.

## Prerequisites

Before you install or convert, confirm the following:

1. You are signed into Cursor on the Paragon team with **Team Marketplace** access to **ParaDOCS**.
2. **Python 3.10+** is installed on the machine, with **venv** support. Windows and macOS installers from [python.org](https://www.python.org/downloads/) usually include venv. On Linux you may need the `python3-venv` package (or your distro equivalent).
3. Outbound network is available on the **first convert only** if pip must install engine dependencies into the local `.paradocs-venv/` from PyPI. After that, convert runs locally without network access.
4. Optional: set **Configure → Default Markdown output folder** (`PARADOCS_DEFAULT_OUTPUT_DIR`) if you do not want Markdown written beside each source file.

### If you do not meet them

1. **No Python or version too old:** install Python 3.10+ from [python.org](https://www.python.org/downloads/) or an IT-approved package, reopen Cursor, and confirm `python --version` or `py -3 --version`.
2. **Linux missing venv:** install `python3-venv` (or the distro equivalent), then retry convert.
3. **First convert fails on pip or network:** allow outbound access to PyPI (or your company mirror) once, or ask IT; then retry convert.
4. **Plugin or MCP not showing:** enable **ParaDOCS** from **Team Marketplace**, choose **Reload Window**, and under **Customize → MCP** confirm **paradocs-convert** is **Connected**.
5. Do not install a separate `paradocs.py` or desktop ParaDOCS engine path. The convert engine is bundled with the plugin.

## Install from the Paragon Team Marketplace

1. Open Cursor team settings and go to **Team Marketplace**.
2. Find **ParaDOCS** in the Paragon marketplace and enable it for yourself or **Everyone** in the team.
3. Reopen Cursor and confirm **paradocs-convert** is **Connected** under **Customize → MCP**.
4. Ask the agent to convert a document — specify the source file or folder and where Markdown should be written.

See **Prerequisites** if install or first convert fails.

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
