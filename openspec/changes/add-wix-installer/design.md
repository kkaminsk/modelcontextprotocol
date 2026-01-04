## Context

The Perplexity MCP Server needs a native Windows installer to simplify adoption for users who:
- Don't have Node.js installed
- Are unfamiliar with npm/command-line tools
- Want automated configuration of MCP clients

The installer must work across multiple MCP clients with different configuration formats and locations.

## Goals / Non-Goals

**Goals:**
- Single-click installation experience for Windows users
- Bundle Node.js so no prerequisites required
- Auto-configure all major MCP clients
- Secure API key storage
- Clean uninstallation

**Non-Goals:**
- macOS/Linux installers (future work)
- Auto-update mechanism
- GUI for managing API keys post-install
- Installing multiple MCP servers

## Decisions

### Decision: Use WiX v4 Toolset
- **Why**: Industry-standard for Windows MSI creation, free/open-source, integrates well with CI/CD
- **Alternatives considered**:
  - NSIS: More complex scripting, less native Windows integration
  - Inno Setup: Creates EXE not MSI, less enterprise-friendly
  - MSIX: Modern but limited customization for complex installs

### Decision: Bundle Portable Node.js
- **Why**: Avoid conflicting with user's existing Node.js installation; self-contained
- **Approach**: Download Node.js Windows zip (not installer) and embed in MSI
- **Version**: Node.js 20 LTS (matches engine requirement)
- **Size impact**: ~25MB additional to MSI

### Decision: Store API Key in User Environment Variable
- **Why**: Accessible to all MCP clients without modifying their configs
- **Variable**: `PERPLEXITY_API_KEY`
- **Scope**: User-level (not system-level) for security
- **Alternatives considered**:
  - Store in each client's config: Would duplicate key, harder to update
  - Store in dedicated config file: Requires additional code to read

### Decision: Client Configuration Strategy
- **Approach**: Read, merge, write JSON configs at install time
- **Conflict handling**: Preserve existing entries, add/update perplexity entry only
- **Backup**: Create `.bak` file before modifying any config
- **Client detection**: Check if config directory exists before attempting configuration

### Decision: Directory Structure

```
C:\Program Files\Perplexity MCP Server\
├── node\                    # Bundled Node.js
│   ├── node.exe
│   └── ...
├── server\                  # MCP server files
│   ├── dist\
│   │   └── index.js
│   ├── package.json
│   └── node_modules\
└── perplexity-mcp.cmd      # Wrapper script
```

### Decision: Wrapper Script
Create `perplexity-mcp.cmd` that:
1. Sets PATH to include bundled Node.js
2. Invokes `node.exe` with server's `index.js`
3. Allows the MCP server to run with the bundled runtime

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Large MSI size (~30MB) | Accept as trade-off for zero-dependency install |
| Client config changes break on client updates | Use defensive JSON merging, create backups |
| API key visible in environment variables | User-scoped variable, document security implications |
| Node.js LTS version becomes outdated | Document in README, new installer release needed |
| Cursor/Codex config locations may change | Document manual fallback steps |

## Migration Plan

N/A - This is a new feature, no migration required.

## Resolved Questions

1. **Code signing certificate**: No - not required for testing. Can be added later for production distribution.
2. **Windows Programs and Features entry**: Yes - will show version and provide standard uninstall access.
3. **Repair option**: No - keep installer simple. Users can reinstall if needed.
