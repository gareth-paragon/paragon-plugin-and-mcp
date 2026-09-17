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

Your Cursor admin adds this marketplace from the GitHub repo (`.cursor-plugin/marketplace.json` uses Option A: root plugin with `"source": "./"`).

After approval:

1. **Customize → Plugins** — enable **ParaDOCS**.
2. **Customize → MCP** — confirm **Paragon Knowledge** shows **Connected**.
3. **Reload Window** if tools do not appear immediately.

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

This runs the Vite MCP Apps UI build and TypeScript compile (`dist/index.js`, `ui/mcp-app.html`). The marketplace package expects a prebuilt `dist/` in the installed plugin copy.

## Local clone (pilots)

```bash
git clone https://github.com/gareth-paragon/paragon-plugin-and-mcp.git
cd paragon-plugin-and-mcp
npm install && npm run build
```

Windows: `powershell -ExecutionPolicy Bypass -File .\scripts\install-local-plugin.ps1`

Alternatively: **Customize → Plugins → + Add → From Local Repo** and select the clone (must contain `.cursor-plugin/marketplace.json`).

## Assets note

Binary branding PNGs under `assets/` (`paragon-logo-*.png`) are required for the MCP Apps header. If they are missing from your clone, copy them from the canonical GitLab release or design assets before building the UI.

## Safety

Use only admin-approved plugins and MCP servers. Paragon Knowledge reads configured documentation folders; it does not write to the guides repo.
