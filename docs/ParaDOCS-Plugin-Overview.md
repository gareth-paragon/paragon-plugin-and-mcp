# ParaDOCS plugin overview

ParaDOCS is a Cursor plugin for converting Word and PDF sources to Markdown and for technical documentation authoring. It is distributed through the Paragon Team Marketplace and ships a bundled convert MCP, rules, and the `paragon-tech-docs` skill.

## Included

- **Convert MCP** (`paradocs-convert`) — Word/PDF → Markdown using a bundled Python engine (no separate ParaDOCS install or `paradocs.py` path).
- **MCP Apps chrome** — branded ParaDOCS panel for convert progress and results in the agent thread.
- **`rules/`** — structure, style, terminology, and documentation quality.
- **`skills/paragon-tech-docs/`** — guided technical documentation authoring.
- **`.cursor-plugin/`** manifests, **`mcp.json`**, bundled **`engine/`**, prebuilt **`dist/`**, and **`assets/logo.png`**.

## Install from the Team Marketplace

1. Open Cursor team settings and go to **Team Marketplace**.
2. Add or select the Paragon marketplace sourced from `https://github.com/paragon-cursor/paradocs`.
3. Find **ParaDOCS** and enable it for yourself or **Everyone** in the Paragon team.
4. Reopen Cursor if needed. Confirm the **paradocs-convert** MCP shows **Connected** under MCP tools.
5. Ask the agent to convert a file or folder — provide source and output paths per call.

### Optional configuration

| Variable | Required | Purpose |
| :--- | :--- | :--- |
| `PARADOCS_DEFAULT_OUTPUT_DIR` | No | Default folder when convert tools omit `outputPath` / `outputDir`. |

Python 3.10+ must be available on the machine. On first convert, the plugin creates a local venv (`.paradocs-venv/`) and installs bundled dependencies.

## Convert MCP tools

| Tool | Purpose |
| :--- | :--- |
| `convert_file` | Convert one `.docx`, `.docm`, or `.pdf` to Markdown. |
| `convert_folder` | Batch-convert a folder (returns `jobId`; poll `job_status`). |
| `job_status` | Progress and results for background folder jobs. |
| `list_settings_profiles` | List bundled ripping profiles (`default`, `Main`, …). |
| `get_settings_profile` | Read profile JSON used by convert tools. |

Bundled conversion is **text-only** (no image extraction, OCR pass, Vale lint, or full desktop ParaDOCS rip). Legacy `.doc` files are skipped.

## Authoring workflow

Use the rules when creating or reviewing documentation. Use `paragon-tech-docs` for guided work such as planning, applying repository style, checking headings and terminology, and refining examples.

## Paragon Knowledge (optional)

The repository retains an optional **Paragon Knowledge** read/search MCP (`src/knowledge/`, build with `npm run build:server:knowledge`). It is **not** registered by the Team Marketplace plugin and requires corpus path configuration. See [Paragon-Knowledge-MCP-Overview.md](Paragon-Knowledge-MCP-Overview.md).

## Maintenance

Keep `.cursor-plugin/plugin.json`, `.cursor-plugin/marketplace.json`, and this overview aligned. After MCP or UI changes, run `npm run build` and commit updated `dist/` for marketplace consumers.

## Changelog

### 0.2.0

- Ship bundled **paradocs-convert** MCP with Word/PDF → Markdown engine, ripping profiles, and MCP Apps chrome.
- Register MCP in plugin manifest; optional `PARADOCS_DEFAULT_OUTPUT_DIR` only.
- Paragon Knowledge search remains in-repo as an optional build, not part of the default marketplace install.
