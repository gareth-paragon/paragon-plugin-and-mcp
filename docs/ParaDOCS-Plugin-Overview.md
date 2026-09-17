# ParaDOCS plugin overview

Documentation for the **ParaDOCS** Cursor plugin. The plugin bundles **Paragon Knowledge** (MCP) plus authoring rules and skills. Available on the Paragon Team Marketplace when your admin has imported [github.com/gareth-paragon/paragon-plugin-and-mcp](https://github.com/gareth-paragon/paragon-plugin-and-mcp).

MCP tools, corpora, and server config: [`Paragon-Knowledge-MCP-Overview.md`](Paragon-Knowledge-MCP-Overview.md). Operator build notes: [`paradocs-plugin-notes.md`](paradocs-plugin-notes.md).

<div style="color: #1565c0; background-color: #e3f2fd; border-left: 4px solid #1565c0; padding: 8px 12px; margin: 12px 0;">
ℹ️ <span style="font-weight: 600;">NOTE:</span> Change history for this plugin is at the bottom of this page under <a href="#8-changelog">§8. Changelog</a>.
</div>

## 1. What this is

**ParaDOCS** is a Cursor plugin that bundles:

- **Paragon Knowledge** - an MCP server that searches and returns approved Paragon documentation (see the [Paragon Knowledge overview](Paragon-Knowledge-MCP-Overview.md)).
- Authoring rules and skills to help agents write Markdown consistently.

In Cursor **Customize**, the plugin appears as **ParaDOCS**. The MCP appears as **Paragon Knowledge**.

## 2. Before you start

You need:

1. **Cursor** with local plugin imports allowed (your admin enables **Allow Local Plugin Imports**), or a future Team Marketplace install.
2. **Node.js 20 or later** (only if you build from a clone; the install script runs this for you).
3. **Local clones** of the documentation repos your admin points the MCP at (typically the Cursor guides repo and the Technical Documentation repo with `corpus/` folders).

Ask your admin for the correct folder paths if you are not sure.

## 3. Install the plugin

### 3.1. From a local clone (typical for pilots)

1. Clone [paragon-plugin-and-mcp](https://github.com/gareth-paragon/paragon-plugin-and-mcp) to your machine.
2. Open PowerShell in that folder and run:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\install-local-plugin.ps1
```

3. In Cursor: **Reload Window** (Command Palette → *Developer: Reload Window*).
4. Open **Customize → Plugins** and confirm **ParaDOCS** is listed and enabled.
5. Open **Customize → MCP** and confirm **Paragon Knowledge** shows **Connected**.

Please keep any old User MCP entry for Paragon Docs or ParaDOCS **disabled** so you do not get duplicate tools.

### 3.2. From Local Repo in Cursor (alternative)

If your org allows it:

1. **Customize → Plugins → + Add → From Local Repo**
2. Select the cloned `paragon-plugin-and-mcp` folder (it must contain `.cursor-plugin/marketplace.json`).

Then reload and confirm as in §3.1 steps 4-5.

Use `scripts\install-local-plugin.ps1` for refreshes so `node_modules` and `dist/` stay intact. A file-only copy of the plugin folder without `npm install` will break the MCP.

## 4. Quickstart

After install and **Connected** status:

1. Open a Cursor chat (Agent mode).
2. Ask a documentation question, for example:
   - *What MCP servers are approved?*
   - *Search tech-arch for Benton.*
   - *List what documentation corpora are loaded.*
3. The agent should call **Paragon Knowledge** tools (tool names and corpora are in the [Paragon Knowledge overview](Paragon-Knowledge-MCP-Overview.md)). When Cursor supports it, results may appear in a compact **Paragon Knowledge** panel with the Paragon logo.

## 5. What the plugin adds besides MCP

When **ParaDOCS** is enabled, Cursor also loads bundled **rules** (Markdown and docs guardrails, including always-on **trim stale docs** so agents delete superseded text instead of only appending, and **UI labels / input values** so menus are bold and typed values are code) and the **edit-platform-docs** skill. These guide agents; they are not MCP tools.

Convert-from-Word/PDF tools are planned; they are not in the MCP tool list yet.

## 6. Safety

- Please do not install unapproved MCP servers yourself. Use the Team Marketplace or admin-approved config.
- The MCP reads documentation from configured folders only; it does not write to the guides repo (see [Paragon Knowledge overview](Paragon-Knowledge-MCP-Overview.md) § Safety).

## 7. Related links

- GitLab: [paragon-plugin-and-mcp](https://gitlab.com/gareth.howells778/paragon-plugin-and-mcp) (canonical host; same reason as GitLab `cursor-test` - the GitLab MCP is significantly better for Cursor agents than relying on Azure DevOps alone; see Admin Guide Cursor Docs as Code §3.1)
- MCP overview: [`Paragon-Knowledge-MCP-Overview.md`](Paragon-Knowledge-MCP-Overview.md)
- Build notes (operators): [`paradocs-plugin-notes.md`](paradocs-plugin-notes.md)

## 8. Changelog

Plugin packaging, local install, authoring rules/skills, and plugin operator docs. MCP server and Apps UI history lives in the [Paragon Knowledge overview](Paragon-Knowledge-MCP-Overview.md#changelog) Changelog section.

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
| Plugin | Brief description | `rules/...` | pending | gitlab | admin-initiated | - | Optional one-line reason |
```

### 30-07-2026

| Area | What changed | Link | sync_id | sync_repo | request_form_ids | michu | Why |
| :--- | :----------- | :--- | :------ | :-------- | :--------------- | :---- | :-- |
| Plugin | Sync bundled style guide and rules: drop Vale/cSpell enforcement; lint step is `npm run lint:md` only | `docs/Paragon_Markdown_Style_Rules.md`, `rules/paragon-markdown-style.mdc`, `skills/edit-platform-docs/SKILL.md` | ee706dd | gitlab | admin-initiated | - | Match cursor-test Vale retirement |
| Plugin | Repair GFM table separator row in bundled style guide | `docs/Paragon_Markdown_Style_Rules.md` | aabf457 | gitlab | admin-initiated | - | MD060 table header row was malformed after edit |

### 22-07-2026

| Area | What changed | Link | sync_id | sync_repo | request_form_ids | michu | Why |
| :--- | :----------- | :--- | :------ | :-------- | :--------------- | :---- | :-- |
| Plugin | UI labels in HTML widgets: require `<strong>` (not `span` + `font-weight`); prose still uses `**bold**` | `rules/ui-labels-and-input-values.mdc` | pending | gitlab | admin-initiated | - | Cursor preview strips span styles so UI chrome looked plain |

### 19-07-2026

| Area | What changed | Link | sync_id | sync_repo | request_form_ids | michu | Why |
| :--- | :----------- | :--- | :------ | :-------- | :--------------- | :---- | :-- |
| Docs | Split plugin and MCP overviews; embed Plugin changelog here; remove combined overview and standalone changelog | `docs/ParaDOCS-Plugin-Overview.md`, `docs/Paragon-Knowledge-MCP-Overview.md` | ba5336e | gitlab | admin-initiated | - | Clear product boundary; one history per overview |
| Docs | Intro NOTE callout linking to §8. Changelog | `docs/ParaDOCS-Plugin-Overview.md` | ba5336e | gitlab | admin-initiated | - | Readers find history without scrolling blindly |
| Plugin | Always-on `hitl-morning-checklist-sync`: keep `cursor-test` Docs-as-Code §2 HITL table updated when morning-ops surfaces change | `rules/hitl-morning-checklist-sync.mdc`, `rules/platform-docs-consistency.mdc`, `skills/edit-platform-docs/SKILL.md`, `docs/paradocs-plugin-notes.md` | 7f4bec4 | gitlab | admin-initiated | - | Ops edits must not leave the morning checklist stale |
| Plugin | Declare `skills`/`rules` in manifest; install script overlays when Cursor locks the local plugin folder; no bundled hooks | `.cursor-plugin/plugin.json`, `scripts/install-local-plugin.ps1`, `docs/paradocs-plugin-notes.md` | 7f4bec4 | gitlab | admin-initiated | - | Package is rules + skill + MCP; avoid hook that only duplicated rules |
| Plugin | Always-on `ui-labels-and-input-values`: UI chrome bold; typed/input values in code (inline or fenced); applies to human and AI Markdown; style §7.1/§13.3 synced | `rules/ui-labels-and-input-values.mdc`, `rules/paragon-markdown-style.mdc`, `docs/Paragon_Markdown_Style_Rules.md`, `skills/edit-platform-docs/SKILL.md`, `docs/paradocs-plugin-notes.md` | c91c5ca | gitlab | admin-initiated | - | Consistent UI vs value markup across authoring |
| Plugin | `run-mcp.cmd` fails clearly when `node_modules` / SDK missing after a file-only plugin refresh | `scripts/run-mcp.cmd` | ba5336e | gitlab | admin-initiated | - | Avoid opaque ERR_MODULE_NOT_FOUND in Cursor MCP logs |

### 18-07-2026

| Area | What changed | Link | sync_id | sync_repo | request_form_ids | michu | Why |
| :--- | :----------- | :--- | :------ | :-------- | :--------------- | :---- | :-- |
| Plugin | Cross-repo docs guardrails: `changelog-ownership`, `platform-docs-consistency`; skill `edit-platform-docs`; install script copies `skills/` | `rules/`, `skills/edit-platform-docs/`, `scripts/install-local-plugin.ps1` | f379dcc | gitlab | admin-initiated | - | Route changelogs without duplication; match host doc tone |
| Plugin | Kanban sync rule: update roadmap cards; ask before creating new cards (`todo` default, `in-progress` when starting) | `rules/kanban-board-sync.mdc`, `skills/edit-platform-docs/` | f379dcc | gitlab | admin-initiated | - | Plugin/MCP work must still move `.devtool/features/` cards |
| Plugin | Kanban rule: document sessionStart-only reminder (no stop follow-up nag on cursor-test) | `rules/kanban-board-sync.mdc` | 98b8e46 | gitlab | admin-initiated | - | Align bundled rule with quieter project hook |
| Plugin | Always-on `trim-stale-docs` rule; platform-docs-consistency and edit-platform-docs require delete/shorten of superseded content | `rules/trim-stale-docs.mdc`, `rules/platform-docs-consistency.mdc`, `skills/edit-platform-docs/SKILL.md`, `docs/paradocs-plugin-notes.md` | 98b8e46 | gitlab | admin-initiated | - | Authoring must not be add-only; same duty as Michu for stale text |
| Plugin | Rename GitLab project and local clone to `paragon-plugin-and-mcp`; remove `paragon-docs-mcp` junction | `docs/`, `.cursor-plugin/plugin.json`, `paragon-docs.code-workspace` | f379dcc | gitlab | admin-initiated | - | One repo name for plugin + Paragon Knowledge MCP |
| Plugin | Rename product to plugin **ParaDOCS** + MCP **ParaDOCS MCP** (kebab `paradocs`, `ui://paradocs/app.html`) | `.cursor-plugin/`, `mcp.json`, `src/`, `ui/`, `docs/` | f379dcc | gitlab | admin-initiated | - | Align Cursor plugin/MCP name with ParaDOCS brand (later renamed MCP to Paragon Knowledge in same day) |
| Plugin | MCP starts via `scripts/run-mcp.cmd` + `${env:USERPROFILE}/.../local/paradocs` | `mcp.json`, `scripts/run-mcp.cmd` | f379dcc | gitlab | admin-initiated | - | Plugin MCP cwd is workspace; relative `./dist` resolved under cursor-test |
| Plugin | MCP entry uses `node ./dist/index.js` (not `${userHome}` + tsx) | `mcp.json`, `.mcp.json` | f379dcc | gitlab | admin-initiated | - | Windows expanded `${userHome}` to `C:\c:\Users\...` and MCP failed to start |
| Plugin | Add `marketplace.json` for From Local Repo; install script copies into `plugins/local` (no junction) | `.cursor-plugin/marketplace.json`, `scripts/install-local-plugin.ps1` | f379dcc | gitlab | admin-initiated | - | Add Local Repo failed with No marketplace; junctions often ignored |
| Plugin | Approved Paragon logos under `assets/`; plugin `logo`; MCP Apps panel on all tools | `assets/`, `.cursor-plugin/plugin.json`, `ui/` | 11b63ea | gitlab | admin-initiated | - | Branded Agent card for every Paragon Docs tool call |
| Plugin | Vendor-style local install: `mcp.json` + `ideToolIconPath`, install script, overview install section | `mcp.json`, `scripts/install-local-plugin.ps1` | 11b63ea | gitlab | admin-initiated | - | Match marketplace MCP chrome (name + logo) while Apps iframes are host-blocked |
| Plugin | Square `assets/logo.svg` for MCP list; docs note Enterprise `userLocal=false` needs Team Marketplace for list icon | `assets/logo.svg`, `docs/ParaDOCS-Plugin-Overview.md` | 11b63ea | gitlab | admin-initiated | - | GitLab-style list icon is Plugin-only; org blocks local plugins |
| Docs | Overview: MCP Apps progressive enhancement and logo paths (later folded into pilot overview rewrite) | formerly combined overview | 11b63ea | gitlab | admin-initiated | - | Operators need build and host-fallback notes |
| Plugin | Scaffold `.cursor-plugin/plugin.json` and first authoring rules batch (1-4, 6-7, 9-12) under `rules/` | `.cursor-plugin/plugin.json`, `rules/` | 6f5ca1b | gitlab | admin-initiated | - | Bundle agent Markdown guardrails for tech authors |
| Plugin | Bundle `Paragon_Markdown_Style_Rules.md` and sync script from canonical `cursor-test` | `docs/Paragon_Markdown_Style_Rules.md`, `scripts/sync_paragon_markdown_style.py` | 6f5ca1b | gitlab | admin-initiated | - | Option B: plugin works offline; refresh to avoid style drift |
| Docs | Overview: plugin packaging, bundled rules, style-guide sync commands (later rewritten for pilots) | formerly combined overview | 6f5ca1b | gitlab | admin-initiated | - | Operators need install and refresh steps for authoring rules |
| Docs | Working notes for plugin v0.1 (scope, MCP Apps UI, build order); linked overview and changelog | `docs/paradocs-plugin-notes.md` | 0a96750 | gitlab | admin-initiated | - | Capture agreed scope before `.cursor-plugin` packaging |
