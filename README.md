# ParaDOCS — Cursor Team Marketplace

ParaDOCS is a Cursor plugin for consistent technical documentation authoring. It provides reusable rules and the `paragon-tech-docs` skill for writing and reviewing Markdown documentation.

Repository: [github.com/paragon-cursor/paradocs](https://github.com/paragon-cursor/paradocs)

## What you get

- **ParaDOCS rules** for structure, style, terminology, and documentation quality.
- **`paragon-tech-docs` skill** for guided technical documentation authoring.
- **Team Marketplace packaging** with the ParaDOCS logo and metadata.

## Install from the Paragon Team Marketplace

1. Open Cursor team settings and go to **Team Marketplace**.
2. Find **ParaDOCS** in the Paragon marketplace and enable it for yourself or **Everyone** in the team.
3. Open Cursor and use the ParaDOCS rules and the `paragon-tech-docs` skill while authoring documentation.

The installed plugin is ready to use after it is enabled. It does not require local path configuration or additional runtime setup.

## Repository layout

- `.cursor-plugin/` — plugin and marketplace manifests.
- `rules/` — Cursor rules for documentation authoring.
- `skills/paragon-tech-docs/` — the technical documentation skill.
- `docs/` — plugin and authoring references.

## Scope

The repository may contain Knowledge-related implementation code for separate development, but that code is not wired into or shipped as part of the installed ParaDOCS plugin. The installed package is intentionally limited to the rules and skills above.

For a detailed description of the packaged experience, see [docs/ParaDOCS-Plugin-Overview.md](docs/ParaDOCS-Plugin-Overview.md).
