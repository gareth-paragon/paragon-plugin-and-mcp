# ParaDOCS / Paragon Knowledge: build notes

Working notes for the **ParaDOCS** Cursor plugin and **Paragon Knowledge** MCP (local pilots and Team Marketplace). Documentation use cases only.

- Plugin install and authoring: [`ParaDOCS-Plugin-Overview.md`](ParaDOCS-Plugin-Overview.md) (Changelog at the end of that page).
- MCP tools and corpora: [`Paragon-Knowledge-MCP-Overview.md`](Paragon-Knowledge-MCP-Overview.md) (Changelog at the end of that page).

## 1. Scope (v0.1 intent)

- **Name:** plugin **ParaDOCS**; MCP / Apps chrome **Paragon Knowledge** (not a generic "Cursor plugin" label).
- **Read/search MCP:** First-class corpora (guides, tech-arch, abbey-view, …). Use `list_corpora` for inventory; no "extra docs" concept. `get_doc` / relevant `search_docs` hits surface `diagramOcr` when embedded images were skipped (EMF/WMF) or produced empty OCR; future OCR runs write `ocr_unread` + an "Unreadable or empty OCR" list in the Markdown.
- **Convert:** Headless ParaDOCS CLI first, then MCP tools in this plugin (`convert_file` / `convert_folder` / `job_status`). No Word COM by default; legacy `.doc` deferred.
- **Settings:** Read real ParaDOCS profiles via `list_settings_profiles` / `get_settings_profile` (from `ParaDOCS_Data_*/settings_profiles.json`).
- **Cross-repo docs:** Rules `changelog-ownership`, `platform-docs-consistency`, `kanban-board-sync`, `ui-labels-and-input-values` (bold UI; code for typed values; human and AI), `hitl-morning-checklist-sync` (keep `cursor-test` Docs-as-Code §2 HITL table current on ops changes); skill `edit-platform-docs` for platform/operator Markdown across workspace repos.
- **Out of scope for this plugin:** Admin dashboards, webhook harness, unrelated Azure/GitLab tooling.

## 2. Agent UI (panel) - must look professional

When tools run in the Agent, results should render in a branded **MCP Apps** panel (interactive UI), not only raw JSON in chat.

### 2.1. Branding

- Official **Paragon logo** only (approved asset; follow brand guidelines).
- Plugin icon and in-panel header use the same logo treatment.
- Restrained palette: Paragon brand colours, high contrast, no playful gradients or emoji chrome.
- Typography: clear hierarchy (title, status, body); avoid default "AI purple" aesthetics.

### 2.2. Panel behaviour

- Compact card in the agent thread: one logo + product name **Paragon Knowledge**, short status line, plain primary content.
- Progressive enhancement: if the host cannot render MCP Apps UI, the same tool still returns normal text/JSON.
- Natural first panels: corpus search results, convert job progress, "document unavailable" notice (title match).
- Keep the box focused - not a second IDE or full docs site.

### 2.3. Reference

- Cursor: MCP Apps extension (tools can return interactive UI with standard tool output).
- Spec: [MCP Apps overview](https://modelcontextprotocol.io/extensions/apps/overview).

## 3. Suggested build order

1. ~~Finish tech-arch SharePoint rip + OCR; wire Abbey View under `external/abbey-view`.~~ Done (first-class corpora; paths `tech-arch/...`, `abbey-view/...`; `list_corpora`). Final OCR catch-up after online-only PDF converts: all tech-arch `.md` files have `ocr_pass: true` (operator detail in this file and the product overviews; pilot overviews stay install/use focused).
2. ~~Headless ParaDOCS in Technical Documentation repo.~~ Done (`paradocs.py convert`; JSON status / exit codes; no Word COM).
3. Plugin package: `.cursor-plugin/plugin.json`, `mcp.json` with `ideToolIconPath` and `${CURSOR_PLUGIN_ROOT}`, rules batch (including always-on `trim-stale-docs`), bundled style guide, logos under `assets/`. Skills: `edit-platform-docs`, `paragon-tech-docs`. No bundled hooks (rules + skills cover authoring). Team Marketplace: GitHub `gareth-paragon/paragon-plugin-and-mcp` (root plugin `paradocs`).
4. ~~Local install via `~/.cursor/plugins/local/paradocs`.~~ Done (`scripts/install-local-plugin.ps1` copies into `plugins/local`; junctions are ignored by Cursor discovery).
5. ~~MCP Apps UI chrome (professional panel) on key tools.~~ Done (every tool uses shared `ui://paragon-knowledge/app.html`; specialised search / unavailable / `job_status` layouts). Full `convert_*` tools still on the plugin card.
6. Multi-root workspace: `paragon-docs.code-workspace` (cursor-test + `paragon-plugin-and-mcp` + Technical Documentation + read-only ADO mirror).
7. ~~Separate plugin vs MCP operator overviews; changelog lives in each overview.~~ Done (`ParaDOCS-Plugin-Overview.md`, `Paragon-Knowledge-MCP-Overview.md`).

## 4. Related paths

| Item | Path |
| :--- | :--- |
| This MCP / plugin repo | `paragon-plugin-and-mcp` |
| Tech-arch corpus | Technical Documentation `corpus/tech-arch/` |
| Abbey View corpus | Technical Documentation `corpus/abbey-view/` |
| Failures / unavailable titles | `corpus/tech-arch/_FAILURES.md`, `_unavailable.json` |
| ParaDOCS source | Technical Documentation repo (`paradocs.py`) |
| MCP / plugin code | This repo (`paragon-plugin-and-mcp`) |

## 5. Decisions already agreed

- Two docs sites later (staff vs client), one content pipeline - separate from this plugin.
- SME review UI on ADO PRs - later; not required for plugin v0.1.
- Unavailable SharePoint/online-only and deferred `.doc` titles: MCP search notice by title, not fake corpus bodies.
- Operator history: Plugin changelog in the ParaDOCS overview; MCP changelog in the Paragon Knowledge overview (no standalone changelog file).
