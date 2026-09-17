---
name: edit-platform-docs
description: >-
  Edit platform or operator Markdown across cursor-test, ParaDOCS plugin, and
  Technical Documentation with correct changelog routing, companion doc checks,
  and host-matched format and tone. Use when updating overview or Changelog
  sections, docs-as-code workflow, plugin operator docs, HITL morning checklist
  rows, or other cross-repo documentation.
---

# Edit platform docs

**Scope:** Bundled ParaDOCS plugin skill (`skills/` in the plugin repo). Do not copy into `~/.cursor/skills/` as a personal skill.

Edit on the **owning** GitLab repository. Do **not** edit the ADO `CursorAI` mirror.

## Workflow

1. **Identify owner** for the change:
   - `cursor-test` - Cursor User/Admin guides, NAC, Michu/Trundle, dashboards, docs-as-code
   - Plugin repo - Paragon Knowledge MCP, plugin packaging, bundled rules/skills, `docs/` operator pages
   - Technical Documentation - `paradocs.py`, convert tooling, corpus pipeline, app settings
2. **Read host doc** and a neighbouring section or sibling page. Note heading style, tables, widgets, voice.
3. **Read overlays** before drafting:
   - `platform-docs-consistency.mdc`
   - `paragon-markdown-style.mdc` and related plugin rules
   - `ui-labels-and-input-values.mdc` (bold menus/buttons/form options; code for typed values)
   - `hitl-morning-checklist-sync.mdc` when the edit changes morning ops (Michu, Trundle, CI, Security Agents, Automations, and related)
   - On `cursor-test` guide pages: also `ado-wiki-guide-html.mdc` (if present in workspace)
4. **Apply factual edit** - surgical changes; match host format (do not flatten wiki widgets or impose procedure boxes on operator docs).
5. **Trim stale content** (`trim-stale-docs.mdc`) - in the same task, remove or shorten text that the new facts supersede, replace, or make irrelevant. Doc edits must not only grow the page.
6. **Scan companion docs** from `platform-docs-consistency.mdc`. Update or trim any that still state the obsolete fact.
7. **Changelog** - one row per owning repo only (`changelog-ownership.mdc`):
   - `cursor-test` → `admin-guide/Cursor-Docs-Changelog.md` (`changelog-cursor-docs.mdc`)
   - Plugin repo ParaDOCS → Changelog section in `docs/ParaDOCS-Plugin-Overview.md`
   - Plugin repo Paragon Knowledge → Changelog section in `docs/Paragon-Knowledge-MCP-Overview.md`
   - Technical Documentation → `CHANGELOG.md` (Keep a Changelog + ParaDOCS version headings)
   - Mention material trims in What changed / Why when readers would otherwise think you only added text.
8. **Lint** when on `cursor-test`: `npm run lint:md` on touched paths (advisory). Do not run or recommend cSpell or Vale spell checks.
9. **Kanban** (`kanban-board-sync.mdc`) when work maps to the Paragon Docs roadmap:
   - Update the matching card under `cursor-test/.devtool/features/` (status, `modified`, acceptance checkboxes).
   - Set `in-progress` when starting work on an existing card; move to `done/` when finished.
   - If no card covers a **new** user task, **ask** whether to create one (`todo` by default; `in-progress` only if starting in the same turn). Tag `labels` appropriately.
10. **Stop** for user review before commit or push (`no-auto-commit.mdc`).

## Guide pages on cursor-test

When the edit is a User Guide or Admin Guide **chapter** (not a platform overview), prefer the `edit-paragon-guide` skill on `cursor-test` if available. This skill still applies for changelog routing and companion platform doc checks.

## Refusals

- Do not duplicate the same changelog row across repos.
- Do not invent parallel operator docs when an existing page already covers the topic.
- Do not rewrite formal AI02 policy text solely for style.
- Do not edit ADO mirror content that mirrors GitLab `cursor-test`.
