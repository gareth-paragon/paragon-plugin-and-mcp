# ParaDOCS — Cursor Team Marketplace

Paragon Cursor plugin and MCP package for the Team Marketplace. One root plugin bundles **Paragon Knowledge** (documentation MCP), **ParaDOCS** convert tooling, authoring **rules**, and two **skills**.

Repository: [github.com/gareth-paragon/paragon-plugin-and-mcp](https://github.com/gareth-paragon/paragon-plugin-and-mcp)

## What you get

| Component | Name in Cursor | Purpose |
| :--- | :--- | :--- |
| Plugin | **ParaDOCS** | Rules, skills, MCP manifest, logos |
| MCP server | **Paragon Knowledge** | Search and retrieve approved Paragon documentation |
| Skill | **edit-platform-docs** | Cross-repo platform documentation editing |
| Skill | **paragon-tech-docs** | Paragon technical Markdown authoring (Overview, UK English) |

Detailed reader docs:

- [ParaDOCS plugin overview](docs/ParaDOCS-Plugin-Overview.md)
- [Paragon Knowledge MCP overview](docs/Paragon-Knowledge-MCP-Overview.md)
- [Operator build notes](docs/paradocs-plugin-notes.md)

## Team Marketplace install

Your Cursor admin imports this GitHub repository as a Team Marketplace (`.cursor-plugin/marketplace.json` lists one root plugin with `"source": "./"`). After merge, refresh the marketplace (**Auto Refresh** if enabled, or re-import the repo URL) so Customize picks up the latest commit.

After approval:

1. **Customize → Plugins** — enable **ParaDOCS**.
2. **Configure** — set **PARAGON_CURSOR_DOCS_ROOT** and **PARAGON_PARADOCS_REPO** (and optional corpora paths). These map to `${…}` placeholders in `mcp.json`.
3. **Customize → MCP** — confirm **Paragon Knowledge** shows **Connected**.
4. **Reload Window** if tools do not appear immediately.

The bundled `mcp.json` starts the server with:

```json
"command": "node",
"args": ["${CURSOR_PLUGIN_ROOT}/dist/index.js"]
```

On Linux and macOS you can also use `scripts/run-mcp.sh` (loads `.env.local` when present). Windows pilots can use `scripts/run-mcp.cmd` or `scripts/install-local-plugin.ps1` from a clone.

## Configuration

Set environment variables so the MCP can read your local documentation trees. Copy [`examples/local.env.example`](examples/local.env.example) to `.env.local` at the plugin root (gitignored) or configure `env` in MCP settings. See [`examples/mcp.json.example`](examples/mcp.json.example).

| Variable | Role |
| :--- | :--- |
| `PARAGON_CURSOR_DOCS_ROOT` | Cursor guides repo root (required) |
| `PARAGON_PARADOCS_REPO` | Technical Documentation repo (required) |
| `PARAGON_TECH_ARCH_SOURCE` | SharePoint sync root for convert/OCR scripts |
| `PARAGON_TECH_ARCH_CORPUS` | Markdown output for convert/OCR scripts |
| `PARAGON_CURSOR_CORPORA` | Optional extra corpora (`id=path;…`) |

Reload Cursor after changing paths.

## Build from source

Requires **Node.js 20+**.

```bash
npm install
npm run build
```

This runs the Vite MCP Apps UI build and esbuild bundle (`dist/index.js`, `dist/ui/mcp-app.html`). The marketplace package commits a prebuilt `dist/` so installs work without running npm.

## Local clone (pilots)

```bash
git clone https://github.com/gareth-paragon/paragon-plugin-and-mcp.git
cd paragon-plugin-and-mcp
npm install && npm run build
```

Windows: `powershell -ExecutionPolicy Bypass -File .\scripts\install-local-plugin.ps1`

Alternatively: **Customize → Plugins → + Add → From Local Repo** and select the clone (must contain `.cursor-plugin/marketplace.json`).

## MCP Apps chrome

Paragon Knowledge tools return `_meta.ui.resourceUri: ui://paragon-knowledge/app.html`. The server registers that MCP Apps resource from `dist/ui/mcp-app.html` (built from `ui/src/mcp-app.ts` and `ui/src/chrome.css`). Tool results render in a branded **Paragon Knowledge** card (header wordmark, status line, search/result layouts) instead of bare JSON when the host supports MCP Apps.

## Assets

Header wordmarks and the MCP chip live under `assets/` (`paragon-logo-*.png`, `logo.svg`). Rebuild the UI after replacing branding files: `npm run build:ui`.

## Safety

Use only admin-approved plugins and MCP servers. Paragon Knowledge reads configured documentation folders; it does not write to the guides repo.
