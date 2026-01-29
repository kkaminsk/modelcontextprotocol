# WiX Installer Proposal - Clarification Questions

Questions to resolve before implementing the `add-wix-installer` proposal.

---

## 1. Product Identity & Branding

### 1.1 Product Name
What should appear in Windows Add/Remove Programs?
- [X] `Perplexity API MCP Server`

### 1.2 Publisher Name
What publisher name should appear in the MSI properties?
- [ ] `Big Hat Group Inc.`

### 1.3 Product Icon
Where should the installer icon come from?
- [ ] Use an existing Perplexity logo/icon find a graphic in the C:\Temp\tsscat\modelcontextprotocol\graphics folder

### 1.4 License Agreement (EULA)
Should the installer display a license agreement?
- [X] Yes - display MIT license from repo

### 1.5 Upgrade GUID
The UpgradeCode GUID must remain constant for the product lifetime. Should I:
- X Generate a new GUID and document it 

---

## 2. Node.js Bundle

### 2.1 Specific Version
Which exact Node.js version to bundle?
- [X] Latest 22.x LTS at build time

### 2.2 Architecture Support
Which Windows architectures to support?
- [X] x64 only (simpler, smaller)

### 2.3 Node.js Components
What parts of Node.js to include?
- [X] Minimal (just node.exe) - smaller but can't run npm commands
- [ ] node.exe + npm (for potential future use)

---

## 3. Installation Scope & Location

### 3.1 Installation Scope
Who can install the MSI?
- [X] Per-machine only (requires admin, installs to Program Files)

### 3.2 Custom Install Directory
Should users be able to choose installation directory?
- [X] Yes - show directory picker dialog

### 3.3 Silent Installation
Should the MSI support silent/unattended installation?
- [X] Yes - support `msiexec /qn` with properties

If yes, what MSI properties should be exposed?
- [X] `INSTALLDIR` - custom installation path
- [X] `ADDTOPATH` - add to PATH (1=yes, 0=no)

---

## 4. PATH Registration

### 4.1 PATH Type
When "Add to PATH" is selected, which PATH to modify?
- [X] System PATH (requires admin, affects all users)

### 4.2 What to Add
What should be added to PATH?
- [X] Just the launcher script location

---

## 5. Example Client Configurations

### 5.1 Path Format
How should paths be specified in example configs?
- [S] Hardcoded full path (e.g., `C:\\Program Files\\Perplexity MCP Server\\perplexity-mcp.cmd`)

### 5.2 API Key Placeholder
What placeholder text for the API key?
- [ ] `pplx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### 5.3 Default Timeout
Should example configs include timeout setting?
- [ ] Yes - include `PERPLEXITY_TIMEOUT_MS: 600000`

### 5.4 Additional Clients
Are there other MCP clients to include example configs for?
No
---

## 6. Upgrade & Uninstall Behavior

### 6.1 Major Upgrade Strategy
How should upgrades be handled?
- [X] Remove previous version, then install new (clean upgrade)

### 6.2 Preserved Files
Should any files be preserved during upgrade/uninstall?
- [X] No - remove everything

### 6.3 Uninstall Cleanup
What happens to the installation directory on uninstall?
- [X] Remove entire directory tree

---

## 7. Code Signing Configuration

### 7.1 Default Metadata Path
What should be the default path for signing metadata JSON?
- [X] Same as Packager-MCP: `C:\Temp\tsscat\CodeSigning\metadata-packager-mcp.json`

### 7.2 Default DLib Path
What should be the default path for Azure Code Signing DLib?
- [x] Same as Packager-MCP: `C:\Temp\tsscat\CodeSigning\Microsoft.Trusted.Signing.Client.1.0.95\bin\x64\Azure.CodeSigning.Dlib.dll`

### 7.3 Signing Metadata File
Should we create a project-specific metadata JSON file, or share with Packager-MCP?
- [] Share existing metadata file


---

## 8. Installer UI Customization

### 8.1 Installer Theme
What visual style for the installer?
- [X] Full WiX UI with all standard dialogs
- [X] Custom branded UI - add icon

### 8.2 Custom Dialogs
Are any custom dialogs needed?
- [ ] No - use standard WiX dialogs
- [X] Yes - add dialog for: MIT License

### 8.3 Welcome/Finish Text
Should welcome and completion screens have custom text?
- [X] Yes - for MIT License

---

## 9. Start Menu & Shortcuts

### 9.1 Start Menu Folder
What should the Start Menu folder be named?
- [X] `Perplexity MCP Server`

### 9.2 Shortcuts to Create
Which shortcuts should be created?
- [ ] README.txt (documentation)

### 9.3 Desktop Shortcut
Should a desktop shortcut be created?
- [X] No

---

## 10. Versioning

### 10.1 Version Source
Where should the MSI version come from?
- [X] Read from `package.json` version field

### 10.2 Version Format
MSI versions must be `X.X.X.X` format. Current npm version is `0.2.2`. How to handle?
- [X] Append `.0` to make `0.2.2.0`

### 10.3 Pre-release Versions
How to handle pre-release versions (e.g., `0.3.0-beta.1`)?
- [X] Strip pre-release suffix
- [X] Map to 4th component

---

## 11. Build Script Behavior

### 11.1 Version Parameter
How should version be specified to the build script?
- [X] Auto-detect from `package.json` (default)

### 11.2 Output Location
Where should the MSI be output?
- [X] `installer/build/PerplexityMCPServer-{version}.msi`

### 11.3 Node.js Cache
Where should downloaded Node.js be cached?
- [X] `installer/node/` (gitignored)

---

## 12. Documentation & Help

### 12.1 README.txt Content
What should the installed README.txt contain?
- [X] Quick start guide only

### 12.2 Troubleshooting
Should common troubleshooting steps be included?
- [X] Yes - in README.txt

---

## 13. Future Considerations

### 13.1 CI/CD Integration
Should the proposal include CI/CD considerations for later?
- [X] Yes - document how GitHub Actions could build the MSI

### 13.2 Auto-Update
Should auto-update capability be considered?
- [X] Yes - implement basic update check

---

## Summary of Open Questions from design.md

These were already identified in the proposal:

1. **Node.js version**: Which LTS version to bundle?
2. **Installer versioning**: Should MSI version match npm package version?
3. ~~**Code signing**~~: RESOLVED - Use Azure Trusted Signing
4. **Signing metadata location**: Default path for metadata JSON?
5. **DLib location**: Default path for Azure Code Signing DLib?

---

## How to Answer

Please respond with your choices for each question. Format example:

```
1.1: Perplexity MCP Server
1.2: Perplexity AI
1.3: Use existing logo at [path]
...
```

Questions without answers will use sensible defaults where possible.
