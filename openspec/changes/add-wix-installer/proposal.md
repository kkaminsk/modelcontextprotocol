# Change: Add WiX Windows Installer

## Why

The Perplexity MCP Server currently requires manual installation via npm/npx, which assumes users have Node.js installed and are comfortable with command-line tools. A native Windows installer would:

1. Lower the barrier to entry for non-technical users
2. Bundle Node.js runtime so users don't need to install it separately
3. Auto-configure all supported MCP clients (Claude Desktop, Claude Code, Cursor, Codex)
4. Provide a familiar Windows installation experience with API key collection during setup

## What Changes

- **NEW**: WiX-based MSI installer for Windows
  - Bundles embedded Node.js runtime (LTS version)
  - Installs server files to `Program Files\Perplexity MCP Server`
  - Collects API key during installation and stores as system environment variable
  - Auto-detects and configures MCP client configuration files:
    - Claude Desktop: `%APPDATA%\Claude\claude_desktop_config.json`
    - Claude Code: `%USERPROFILE%\.claude\settings.json`
    - Cursor: `%APPDATA%\Cursor\User\globalStorage\mcp.json`
    - Codex: Uses CLI command for configuration
  - Provides uninstaller that removes server files and optionally cleans client configs

- **NEW**: Build tooling for creating MSI
  - WiX v4 project files in `installer/` directory
  - npm script for building installer: `npm run build:installer`
  - GitHub Actions workflow for automated installer builds on releases

## Impact

- Affected specs: None (new capability)
- Affected code:
  - `installer/` - New directory with WiX project files
  - `package.json` - New build scripts
  - `.github/workflows/` - CI/CD for installer builds
- No changes to existing MCP server functionality
