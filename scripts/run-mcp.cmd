@echo off
setlocal EnableExtensions
cd /d "%~dp0.."
if not exist "dist\index.js" (
  echo Paragon Knowledge: dist\index.js missing. Run scripts\install-local-plugin.ps1 from the plugin repo. 1>&2
  exit /b 1
)
if not exist "node_modules\@modelcontextprotocol\sdk" (
  echo Paragon Knowledge: node_modules missing (Cannot find @modelcontextprotocol/sdk). 1>&2
  echo Run scripts\install-local-plugin.ps1 from the plugin repo, or npm install --include=dev in %%USERPROFILE%%\.cursor\plugins\local\paradocs 1>&2
  exit /b 1
)
REM Load gitignored local paths when present (KEY=VALUE lines).
if exist ".env.local" (
  for /f "usebackq eol=# tokens=1,* delims==" %%A in (".env.local") do (
    if not "%%A"=="" if not defined %%A set "%%A=%%B"
  )
)
node "dist\index.js"
exit /b %ERRORLEVEL%
