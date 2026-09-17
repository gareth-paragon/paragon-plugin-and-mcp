# Paragon Knowledge overview

Early prototype documentation for the **Paragon Knowledge** MCP server (documentation and knowledge retrieval in Cursor). Usually installed via the **ParaDOCS** plugin.

Plugin install, rules, and skills: [`ParaDOCS-Plugin-Overview.md`](ParaDOCS-Plugin-Overview.md). Operator build notes: [`paradocs-plugin-notes.md`](paradocs-plugin-notes.md).

<div style="color: #1565c0; background-color: #e3f2fd; border-left: 4px solid #1565c0; padding: 8px 12px; margin: 12px 0;">
ℹ️ <span style="font-weight: 600;">NOTE:</span> Change history for this MCP is at the bottom of this page under <a href="#8-changelog">§8. Changelog</a>.
</div>

## 1. What this is

**Paragon Knowledge** is a local stdio MCP that searches and returns approved Paragon documentation: Cursor guides, technical architecture library, Abbey View wiki, governance extracts, and ParaDOCS settings profiles.

In Cursor **Customize → MCP**, it appears as **Paragon Knowledge**. The parent Cursor plugin appears as **ParaDOCS**.

## 2. Quickstart

After the ParaDOCS plugin is installed and **Paragon Knowledge** shows **Connected**:

1. Open a Cursor chat (Agent mode).
2. Ask a documentation question, for example:
   - *What MCP servers are approved?*
   - *Search tech-arch for Benton.*
   - *List what documentation corpora are loaded.*
3. The agent should call the tools in §3. When Cursor supports it, results may appear in a compact **Paragon Knowledge** panel with the Paragon logo.

**Tips**

- Start with `list_corpora` if you are unsure what is loaded.
- Use `search_docs` for keyword search; use `get_doc` with a corpus path (for example `admin-guide/Cursor-Security.md`) for one page.
- Large pages may return a preview in chat; the result includes a path you can open locally for the full file.
- If a result says diagrams could not be read with OCR, treat architecture/network visuals as incomplete unless the prose confirms the answer.

## 3. MCP tools and resources

The **Name** column matches the identifier in code (`src/index.ts` for tools; `src/appsUi.ts` for the App resource). Agents and MCP clients use these exact names.

| Name | What it does |
| :--- | :--- |
| `list_corpora` | Lists which documentation corpora are configured and how many pages each contains. |
| `list_docs` | Lists Markdown pages in the loaded corpora (optional filter by corpus). |
| `get_doc` | Returns one documentation page by corpus path (for example `user-guide/Page.md`, `tech-arch/...`). When embedded diagrams could not be read with OCR, includes a `diagramOcr` notice (also prepended to the text). |
| `search_docs` | Keyword search across loaded corpora. Hits may include `unreadDiagrams` / `diagramOcr.notice` when OCR missed diagrams and that gap looks relevant to the query (or the gap is large). |
| `get_doc_metadata` | Title, corpus, size, and modified time for one path; includes `diagramOcr` when unread diagrams are present. |
| `job_status` | Convert job status (placeholder until convert tools are added). |
| `list_settings_profiles` | Lists ParaDOCS Settings profile names from your local ParaDOCS data folder. |
| `get_settings_profile` | Returns full settings for `active` or a named profile. |
| `get_approved_plugins_and_mcps` | Extract from Cursor User Guide: approved plugins and MCP servers. |
| `get_approved_models` | Extract from Cursor User Guide: approved models. |
| `get_nac_summary` | Extract from Cursor User Guide: Network Access Controls summary. |
| `get_change_form_info` | Extract from Cursor User Guide: how to request MCP, plugin, or NAC changes. |
| `get_governance_ai02` | AI02 Business Use of Artificial Intelligence policy text. |
| `get_admin_guide_overview` | Opening section of the Cursor Admin Guide. |

### 3.1. MCP App resource

| Name | URI | What it does |
| :--- | :--- | :--- |
| `Paragon Knowledge App` | `ui://paragon-knowledge/app.html` | Branded result panel in the agent thread when Cursor mounts MCP Apps UI for a tool call. |

Every tool above is wired to this resource for hosts that support [MCP Apps](https://modelcontextprotocol.io/extensions/apps/overview). If Apps UI is not available, the same tools still return JSON text.

## 4. Documentation corpora

Paths passed to `get_doc` and `search_docs` use a corpus prefix:

| Corpus id | Contents (typical) |
| :--- | :--- |
| `guides` | Every Markdown page under `user-guide/` and `admin-guide/`, plus selected root docs |
| `tech-arch` | Technical Architecture library (converted Markdown) |
| `abbey-view` | Abbey View wiki (converted Markdown) |
| `drupal-docs` | Optional: Drupal Docs git repo (live Markdown), when listed in `PARAGON_CURSOR_CORPORA` |

The `guides` corpus walks both guide folders recursively from `PARAGON_CURSOR_DOCS_ROOT`. It does not use a hand-picked page allowlist, so new Markdown pages are available without an MCP code change. Non-Markdown assets and dotfiles such as `.order` are not indexed.

Run `list_corpora` for the live list and folder roots on your machine, then use `list_docs` with `admin-guide` or `user-guide` to list every loaded guide page. Named tools such as `get_admin_guide_overview` are convenience extracts, not limits on the generic `list_docs`, `search_docs`, and `get_doc` tools.

When you set `PARAGON_CURSOR_CORPORA`, that list **replaces** the default `tech-arch` and `abbey-view` folders. Include every tree corpus you still want, for example tech-arch, abbey-view, and `drupal-docs` pointing at your local `drupal-docs` clone. The MCP reads Markdown from those folders on each search or `get_doc`, so edits in the repo are visible after the next tool call (reload Cursor after changing the env). Tree walks skip common dependency and build folders such as `node_modules/`, `vendor/`, `site/`, and `public/`.

Some Technical Architecture titles that could not be converted may appear in search as an **unavailable** notice (title only, not a fake document body).

## 5. Configuration (for admins)

Environment variables point the MCP at local doc folders. There are **no personal machine-path defaults** in the repo. Set paths via MCP `env`, your shell, or a gitignored `.env.local` at the package root (copy [`examples/local.env.example`](../examples/local.env.example)). `scripts/run-mcp.cmd` and convert/OCR scripts load `.env.local` when present. Also see [`examples/mcp.json.example`](../examples/mcp.json.example).

| Variable | Role |
| :--- | :--- |
| `PARAGON_CURSOR_DOCS_ROOT` | Cursor guides repo root (required) |
| `PARAGON_PARADOCS_REPO` | Technical Documentation repo (corpus and ParaDOCS data; required) |
| `PARAGON_TECH_ARCH_SOURCE` | SharePoint sync root for convert/OCR scripts (required for those scripts) |
| `PARAGON_TECH_ARCH_CORPUS` | Markdown output for convert/OCR (required for those scripts) |
| `PARAGON_CURSOR_CORPORA` | Optional tree-corpus list (`id=absolutePath;…`). When set, replaces the default tech-arch + abbey-view pair |

Reload Cursor after changing MCP environment variables. Re-run `scripts\install-local-plugin.ps1` after creating or updating `.env.local` so the local plugin copy gets the file.

## 6. Safety

- The MCP reads documentation from configured folders only; it does not write to the guides repo.
- Please do not install unapproved MCP servers yourself. Use the Team Marketplace or admin-approved config.

## 7. Related links

- Plugin install and authoring rules: [`ParaDOCS-Plugin-Overview.md`](ParaDOCS-Plugin-Overview.md)
- GitLab: [paragon-plugin-and-mcp](https://gitlab.com/gareth.howells778/paragon-plugin-and-mcp)
- Build notes (operators): [`paradocs-plugin-notes.md`](paradocs-plugin-notes.md)

## 8. Changelog

Local stdio server: corpora, tools, convert/OCR scripts that feed the MCP, Apps UI, and MCP operator docs. Plugin packaging and authoring-rules history lives in the [ParaDOCS plugin overview](ParaDOCS-Plugin-Overview.md#changelog) Changelog section.

### 8.1. How to read this section

- Date headings are newest first (`### DD-MM-YYYY`, UK format).
- Each day has one table; one row per distinct change (or per publish batch when batches share a `sync_id`).
- `sync_id` - short commit hash on GitLab `paragon-plugin-and-mcp` `main`. Write `pending` for new entries; backfill after merge to `main`.
- `sync_repo` - `gitlab`.
- `request_form_ids` - Microsoft Forms response Id(s), or `admin-initiated`.
- `michu` - always `-` in this repository.

| sync_repo | Look up |
| :--- | :--- |
| gitlab | `git show <sync_id>` in this clone, or [GitLab commits](https://gitlab.com/gareth.howells778/paragon-plugin-and-mcp/-/commits/main) |

```markdown
### DD-MM-YYYY

| Area | What changed | Link | sync_id | sync_repo | request_form_ids | michu | Why |
| :--- | :----------- | :--- | :------ | :-------- | :--------------- | :---- | :-- |
| Tools | Brief description | `src/index.ts` | pending | gitlab | admin-initiated | - | Optional one-line reason |
```

### 28-07-2026

| Area | What changed | Link | sync_id | sync_repo | request_form_ids | michu | Why |
| :--- | :----------- | :--- | :------ | :-------- | :--------------- | :---- | :-- |
| Corpora | Tree walks skip dependency and build folders; document optional `drupal-docs` via `PARAGON_CURSOR_CORPORA` (replaces defaults when set) | `src/corpus.ts`, `docs/Paragon-Knowledge-MCP-Overview.md`, `examples/local.env.example`, `examples/mcp.json.example` | 39219f8 | gitlab | admin-initiated | - | Point a live git docs repo at Paragon Knowledge without indexing `node_modules` or generated HTML |

### 23-07-2026

| Area | What changed | Link | sync_id | sync_repo | request_form_ids | michu | Why |
| :--- | :----------- | :--- | :------ | :-------- | :--------------- | :---- | :-- |
| Corpora | Clarify that every Admin Guide Markdown page is loaded recursively, distinguish convenience extracts from generic corpus tools, and smoke-test all eight current canonical pages | `docs/Paragon-Knowledge-MCP-Overview.md`, `scripts/smoke.mts` | pending | gitlab | admin-initiated | - | Make full Admin Guide coverage explicit and catch regressions |

### 20-07-2026

| Area | What changed | Link | sync_id | sync_repo | request_form_ids | michu | Why |
| :--- | :----------- | :--- | :------ | :-------- | :--------------- | :---- | :-- |
| Config | Remove hardcoded personal Windows/SharePoint path defaults; require env or gitignored `.env.local` | `src/config.ts`, `src/paradocsSettings.ts`, `src/loadEnvLocal.ts`, `scripts/`, `examples/local.env.example` | pending | gitlab | admin-initiated | - | Remediate Vulnerability Scanner medium finding without breaking local MCP |

### 19-07-2026

| Area | What changed | Link | sync_id | sync_repo | request_form_ids | michu | Why |
| :--- | :----------- | :--- | :------ | :-------- | :--------------- | :---- | :-- |
| Docs | Split plugin and MCP overviews; embed MCP changelog here; remove combined overview and standalone changelog | `docs/Paragon-Knowledge-MCP-Overview.md`, `docs/ParaDOCS-Plugin-Overview.md` | ba5336e | gitlab | admin-initiated | - | Clear product boundary; one history per overview |
| Docs | Intro NOTE callout linking to §8. Changelog | `docs/Paragon-Knowledge-MCP-Overview.md` | ba5336e | gitlab | admin-initiated | - | Readers find history without scrolling blindly |

### 18-07-2026

| Area | What changed | Link | sync_id | sync_repo | request_form_ids | michu | Why |
| :--- | :----------- | :--- | :------ | :-------- | :--------------- | :---- | :-- |
| Tools | Surface unread diagram/OCR gaps on `get_doc`, `get_doc_metadata`, and relevant `search_docs` hits (`diagramOcr` / `unreadDiagrams`); OCR script records `ocr_unread` + Unreadable list; Apps UI warn styling; `prefer-mcp-corpora` tells agents to relay the notice | `src/diagramOcr.ts`, `src/search.ts`, `src/extracts.ts`, `src/index.ts`, `scripts/ocr_tech_arch_images.py`, `ui/`, `rules/prefer-mcp-corpora.mdc` | 232b848 | gitlab | admin-initiated | - | Agents must know when referenced TDDs have diagrams OCR could not read |
| Docs | Final pass: move Plugin-area history into Plugin overview; trim stale overview § refs and junction wording in build notes | `docs/ParaDOCS-Plugin-Overview.md`, `docs/Paragon-Knowledge-MCP-Overview.md`, `docs/paradocs-plugin-notes.md` | ba5336e | gitlab | admin-initiated | - | Changelog readable after Paragon Knowledge / pilot overview day |
| Docs | Rewrite overview for non-technical install, quickstart, and MCP tools/resources table (code-accurate names); generic paths in MCP example | formerly combined overview, `examples/mcp.json.example` | f754e3e | gitlab | admin-initiated | - | Early prototype reader doc for other pilot users |
| MCP | Rename MCP product to **Paragon Knowledge** (kebab `paragon-knowledge`, `ui://paragon-knowledge/app.html`); plugin stays **ParaDOCS** | `mcp.json`, `src/`, `ui/`, `docs/` | f379dcc | gitlab | admin-initiated | - | Wider product name than docs-only; plugin brand unchanged |
| Docs | Overview note: GitLab host choice (better GitLab MCP for agents); points at Cursor Docs as Code §3.1 | formerly combined overview | e624186 | gitlab | admin-initiated | - | Align plugin reader note with admin docs-as-code rationale |
| Tools | Enlarged chat chip (~2.6KB, 44px); restored Apps header wordmark + **Paragon Docs MCP** title | `assets/paragon-logo-mcp-chip.png`, `assets/paragon-logo-header-*.png`, `ui/` | 11b63ea | gitlab | admin-initiated | - | Chip was easy to miss; header wordmark back when Apps mounts |
| Tools | Cap search hits + `get_doc` for Apps mount; ~1.5KB chip logo on every result; Apps header title-only (**Paragon Docs MCP**) | `src/appsUi.ts`, `src/index.ts`, `assets/paragon-logo-mcp-chip.png`, `ui/` | 11b63ea | gitlab | admin-initiated | - | Large Benton-style searches also skipped Apps; logo must always appear once |
| Tools | Cap large `get_doc` chat payloads (Overview preview + `absolutePath`); keep Apps header **Paragon Docs MCP** as the only logo | `src/appsUi.ts`, `src/index.ts`, `src/extracts.ts` | 11b63ea | gitlab | admin-initiated | - | Cursor skipped Apps card when full TDD was returned; branding vanished |
| Tools | Single Apps header brand **Paragon Docs MCP**; removed per-call logo `image` (was ~185KB and doubled branding); slim UI structured content for large `get_doc` | `src/appsUi.ts`, `src/index.ts`, `ui/` | 11b63ea | gitlab | admin-initiated | - | One logo + name at top of every tool card; large docs still mount Apps |
| Tools | MCP Apps branded card on every tool; specialised search / job layouts; stub `job_status`; UI under `ui/` | `src/appsUi.ts`, `src/index.ts`, `ui/` | 11b63ea | gitlab | admin-initiated | - | Professional result box whenever any Paragon Docs MCP tool runs |
| Tools | Logo `image` content + result `_meta.ui` fallback when Cursor skips Apps iframes; `check_apps_meta` script | `src/appsUi.ts`, `src/index.ts`, `scripts/check_apps_meta.mts` | 11b63ea | gitlab | admin-initiated | - | Cursor often does not mount ui:// widgets; wordmark still appears in chat |
| Docs | Document OCR second pass and what MCP search gains from diagram text | formerly combined overview | 85ad0b0 | gitlab | admin-initiated | - | Operators and users need a plain explanation of OCR |
| Docs | Changelog date headings use UK format DD-MM-YYYY (aligned with Cursor Docs) | formerly combined changelog | 0a96750 | gitlab | admin-initiated | - | Same date convention across Paragon changelogs |
| Tools | Clear stale convert failures on resume; skip empty corpus paths; settings resolve to current user only | `scripts/update_failures_list.py`, `src/config.ts`, `src/paradocsSettings.ts` | 0a96750 | gitlab | admin-initiated | - | Address side-panel findings before sync |
| Tools | OCR `source_file` must resolve inside SharePoint `SOURCE_ROOT` | `scripts/ocr_tech_arch_images.py` | 0a96750 | gitlab | admin-initiated | - | Close medium finding: path traversal into OCR corpus |
| Docs | Added MCP changelog section and operator overview; removed root README | formerly combined changelog and overview | 0a96750 | gitlab | admin-initiated | - | Keep MCP/plugin history under `docs/` with the same flow as Cursor Docs |
| Corpus wiring | Defaults and convert/OCR scripts read/write Technical Documentation `corpus/` | `src/config.ts`, `scripts/`, `examples/mcp.json.example` | 2cc6288 | gitlab | admin-initiated | - | Separate content (TD) from MCP/plugin code |
| Corpora | First-class `guides`, `tech-arch`, `abbey-view`; `list_corpora`; Settings profile tools | `src/corpus.ts`, `src/paradocsSettings.ts`, `src/index.ts` | 2cc6288 | gitlab | admin-initiated | - | No "extra docs" model; writers can pick ParaDOCS profiles |
| Unavailable docs | Title-match notices for failed/deferred tech-arch sources | `src/unavailable.ts` | 2cc6288 | gitlab | admin-initiated | - | Avoid fake corpus bodies for online-only or `.doc` titles |

### 17-07-2026

| Area | What changed | Link | sync_id | sync_repo | request_form_ids | michu | Why |
| :--- | :----------- | :--- | :------ | :-------- | :--------------- | :---- | :-- |
| Server | Initial local stdio server for Cursor Markdown docs | `src/index.ts`, `package.json` | 09bccfe | gitlab | admin-initiated | - | Admin prototype for guide search and get |
