# Install ParaDOCS as a local Cursor plugin under ~/.cursor/plugins/local.
# Uses a real directory copy (junctions are often ignored by Cursor plugin discovery).
# Re-run safely to refresh the copy.
$ErrorActionPreference = "Stop"

$pluginName = "paradocs"
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$localRoot = Join-Path $env:USERPROFILE ".cursor\plugins\local"
$linkPath = Join-Path $localRoot $pluginName

New-Item -ItemType Directory -Force -Path $localRoot | Out-Null

# Prefer a clean replace; if Cursor has the folder locked, overlay-copy instead.
$overlayOnly = $false
if (Test-Path $linkPath) {
  $item = Get-Item $linkPath -Force
  if ($item.Attributes -band [IO.FileAttributes]::ReparsePoint) {
    cmd /c "rmdir `"$linkPath`""
  } else {
    try {
      Remove-Item -LiteralPath $linkPath -Recurse -Force -ErrorAction Stop
    } catch {
      Write-Warning "Could not replace local plugin folder (likely locked by Cursor). Overlaying files instead."
      $overlayOnly = $true
    }
  }
}

New-Item -ItemType Directory -Force -Path $linkPath | Out-Null

# Plugin payload only (skip bulky / irrelevant trees).
$include = @(
  ".cursor-plugin",
  "assets",
  "docs",
  "rules",
  "skills",
  "scripts",
  "src",
  "ui",
  "dist",
  "mcp.json",
  ".mcp.json",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  ".env.local"
)

foreach ($name in $include) {
  $src = Join-Path $repoRoot $name
  if (-not (Test-Path $src)) { continue }
  $dst = Join-Path $linkPath $name
  if (Test-Path $src -PathType Container) {
    New-Item -ItemType Directory -Force -Path $dst | Out-Null
    robocopy $src $dst /E /NFL /NDL /NJH /NJS /nc /ns /np | Out-Null
    if ($LASTEXITCODE -ge 8) {
      throw "robocopy failed for $name with exit $LASTEXITCODE"
    }
  } else {
    Copy-Item -LiteralPath $src -Destination $dst -Force
  }
}

if ($overlayOnly) {
  Write-Host "Overlay refresh complete (folder was locked)."
}

Push-Location $linkPath
try {
  # NODE_ENV=production skips Vite; force devDeps when a rebuild is needed.
  $prevNodeEnv = $env:NODE_ENV
  $env:NODE_ENV = "development"
  try {
    npm install --include=dev
    if (-not (Test-Path (Join-Path $linkPath "dist\ui\mcp-app.html"))) {
      npm run build
    }
  } finally {
    if ($null -eq $prevNodeEnv) { Remove-Item Env:NODE_ENV -ErrorAction SilentlyContinue }
    else { $env:NODE_ENV = $prevNodeEnv }
  }
} finally {
  Pop-Location
}

# Ensure MCP launcher is present (plugin MCP cwd is the workspace, not plugin root).
$launcher = Join-Path $linkPath "scripts\run-mcp.cmd"
if (-not (Test-Path $launcher)) {
  throw "Missing MCP launcher after copy: $launcher"
}

Write-Host "Installed local plugin (copy):"
Write-Host "  $linkPath"
Write-Host "  (source repo: $repoRoot)"
Write-Host "  MCP launcher: $launcher"
Write-Host ""
Write-Host "Next:"
Write-Host "  1. Reload Window / toggle plugin MCP, confirm Connected."
Write-Host "  2. Keep any User MCP 'paragon-knowledge' / old 'paradocs' / 'paragon-docs' entry disabled to avoid duplicates."

