## 1. Project Setup
- [x] 1.1 Create `installer/` directory structure
- [x] 1.2 Add WiX v4 NuGet package references
- [x] 1.3 Add `build:installer` npm script to package.json

## 2. Node.js Bundling
- [x] 2.1 Download Node.js 20 LTS portable zip for Windows x64
- [x] 2.2 Create script to extract and stage Node.js files
- [ ] 2.3 Test bundled Node.js runs the MCP server correctly

## 3. WiX Installer Core
- [x] 3.1 Create `installer/Package.wxs` main installer definition
- [x] 3.2 Define directory structure and file components
- [x] 3.3 Create `perplexity-mcp.cmd` wrapper script
- [x] 3.4 Configure Program Files installation location
- [x] 3.5 Set up uninstall registry entries

## 4. API Key Collection
- [x] 4.1 Create custom WiX UI dialog for API key input
- [x] 4.2 Validate API key format (non-empty check)
- [x] 4.3 Create custom action to set user environment variable
- [x] 4.4 Ensure variable persists after install completes

## 5. MCP Client Configuration
- [x] 5.1 Create PowerShell custom action for JSON config updates
- [x] 5.2 Implement Claude Desktop config detection and update
- [x] 5.3 Implement Claude Code config detection and update
- [x] 5.4 Implement Cursor config detection and update
- [x] 5.5 Implement Codex CLI detection and configuration
- [x] 5.6 Create backup (.bak) files before modifying configs
- [x] 5.7 Handle missing directories gracefully (client not installed)

## 6. Uninstall Logic
- [x] 6.1 Remove server files from Program Files (handled by WiX)
- [x] 6.2 Script to remove API key environment variable
- [x] 6.3 Script to remove client configurations
- [x] 6.4 Restore backup configs option

## 7. Build Automation
- [x] 7.1 Create PowerShell build script for local builds
- [ ] 7.2 Add GitHub Actions workflow for release builds
- [ ] 7.3 Configure artifact upload for MSI files
- [ ] 7.4 Add version stamping from package.json

## 8. Testing
- [ ] 8.1 Test fresh install on clean Windows VM
- [ ] 8.2 Test install with existing Node.js installation
- [ ] 8.3 Test each MCP client configuration works
- [ ] 8.4 Test upgrade scenario (reinstall over existing)
- [ ] 8.5 Test uninstall cleans up properly
- [ ] 8.6 Test API key is available after install

## 9. Documentation
- [x] 9.1 Create installer README.md
- [ ] 9.2 Update main install.md with Windows installer instructions
- [ ] 9.3 Update README.md with installer download link
- [ ] 9.4 Add troubleshooting section for installer issues
