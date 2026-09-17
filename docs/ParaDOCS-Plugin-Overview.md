# ParaDOCS plugin overview

ParaDOCS is a Cursor plugin for technical documentation authoring. It is distributed through the Paragon Team Marketplace and provides rules and skills for writing and reviewing Markdown documentation.

## Included

- `rules/` for structure, style, terminology, and documentation quality.
- `skills/paragon-tech-docs/` for guided technical documentation authoring.
- `.cursor-plugin/` manifests and `assets/logo.png`.

The package is an authoring experience. It does not add local path configuration, external service connections, or runtime prerequisites.

## Install from the Team Marketplace

1. Open Cursor team settings and go to **Team Marketplace**.
2. Add or select the Paragon marketplace sourced from `https://github.com/paragon-cursor/paradocs`.
3. Find **ParaDOCS** and enable it for yourself or **Everyone** in the Paragon team.
4. Reopen Cursor if needed, then use the ParaDOCS rules and `paragon-tech-docs` skill.

There are no paths to configure and no separate connection step.

## Authoring workflow

Use the rules when creating or reviewing documentation. Use `paragon-tech-docs` for guided work such as planning, applying repository style, checking headings and terminology, and refining examples.

## Scope

The repository may retain Knowledge-related implementation code for separate work. It is not referenced by the ParaDOCS manifest and is not part of the installed plugin. The Team Marketplace package is limited to the rules and skills above.

Do not treat repository implementation artifacts as installation prerequisites. Keep installation and use rules-and-skills only.

## Maintenance

Keep both manifests aligned with this authoring-only scope. Verify the Team Marketplace listing shows **ParaDOCS**, the correct logo, and no configuration requirements.
