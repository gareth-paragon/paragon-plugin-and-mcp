# ParaDOCS plugin overview

ParaDOCS is a Cursor plugin for converting Word and PDF sources to Markdown and for technical documentation authoring. It is distributed through the Paragon Team Marketplace and ships a bundled convert MCP, rules, and the `paragon-tech-docs` skill.

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
4. Reopen Cursor if needed. Confirm the **paradocs-convert** MCP shows **Connected** under **Customize → MCP**.
5. Ask the agent to convert a file or folder — provide source and output paths per call.

See **Prerequisites** if install or first convert fails.

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

### 0.2.1

- Document install prerequisites and remediation in plugin manifests, marketplace metadata, and this overview.

### 0.2.0

- Ship bundled **paradocs-convert** MCP with Word/PDF → Markdown engine, ripping profiles, and MCP Apps chrome.
- Register MCP in plugin manifest; optional `PARADOCS_DEFAULT_OUTPUT_DIR` only.
- Paragon Knowledge search remains in-repo as an optional build, not part of the default marketplace install.
