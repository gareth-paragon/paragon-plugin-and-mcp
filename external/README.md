# External packaging folder

No corpus Markdown is stored here. Markdown corpora for Paragon Knowledge live in the Technical Documentation repository under `corpus/`:

| Corpus | Path |
| :--- | :--- |
| tech-arch | `Technical Documentation-1/corpus/tech-arch/` |
| abbey-view | `Technical Documentation-1/corpus/abbey-view/` |

Configure via `PARAGON_CURSOR_CORPORA` or defaults driven by `PARAGON_PARADOCS_REPO`. See [`docs/Paragon-Knowledge-MCP-Overview.md`](../docs/Paragon-Knowledge-MCP-Overview.md).

Guides (User Guide / Admin Guide) still come from `cursor-test` via `PARAGON_CURSOR_DOCS_ROOT`.

Convert and OCR scripts require `PARAGON_TECH_ARCH_SOURCE` and `PARAGON_TECH_ARCH_CORPUS` (see `examples/local.env.example`).
