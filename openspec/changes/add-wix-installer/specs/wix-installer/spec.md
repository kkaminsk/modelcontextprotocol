# WiX Installer Specification

## ADDED Requirements

### Requirement: MSI Installer Package
The system SHALL provide a Windows MSI installer package that bundles the Perplexity MCP Server with a minimal portable Node.js runtime for self-contained deployment.

#### Scenario: Fresh installation with defaults
- **WHEN** user runs the MSI installer on a Windows system with administrator privileges
- **THEN** the installer SHALL display "Perplexity API MCP Server" as the product name
- **AND** the installer SHALL display "Big Hat Group Inc." as the publisher
- **AND** the installer SHALL display the MIT license for acceptance
- **AND** the installer SHALL create a `Perplexity MCP Server` directory in Program Files by default
- **AND** the installer SHALL copy the bundled Node.js runtime (`node.exe` only) to the installation directory
- **AND** the installer SHALL copy the MCP server files to the installation directory
- **AND** the installer SHALL copy example client configuration files to the installation directory
- **AND** the installer SHALL create a Start Menu folder named `Perplexity MCP Server`
- **AND** the installer SHALL create a shortcut to README.txt in the Start Menu folder

#### Scenario: Fresh installation with custom directory
- **WHEN** user selects a custom installation directory during setup
- **THEN** the installer SHALL install all files to the user-specified directory
- **AND** the example configuration files SHALL reference the custom installation path

#### Scenario: Upgrade installation
- **WHEN** user runs a newer version MSI on a system with an older version installed
- **THEN** the installer SHALL remove the previous version completely
- **AND** the installer SHALL install the new version (clean upgrade)
- **AND** no files from the previous installation SHALL be preserved

#### Scenario: Uninstallation
- **WHEN** user uninstalls via Windows Add/Remove Programs
- **THEN** the uninstaller SHALL remove the entire installation directory tree
- **AND** the uninstaller SHALL remove the Start Menu folder and shortcuts
- **AND** the uninstaller SHALL remove PATH entries if they were added during installation

---

### Requirement: Portable Node.js Runtime
The installer SHALL bundle a minimal portable Node.js runtime that operates independently of any system-wide Node.js installation.

#### Scenario: Minimal runtime
- **WHEN** the installer bundles Node.js
- **THEN** it SHALL include only `node.exe` (not npm, corepack, or documentation)
- **AND** the bundled runtime SHALL be Node.js 22.x LTS (latest at build time)
- **AND** the bundled runtime SHALL be the Windows x64 architecture

#### Scenario: Isolated runtime
- **WHEN** the MCP server is launched via the installed launcher script
- **THEN** the bundled Node.js runtime SHALL be used regardless of system PATH
- **AND** the bundled runtime SHALL NOT modify or conflict with system-wide Node.js installations

---

### Requirement: Launcher Script
The installer SHALL include a launcher script (`perplexity-mcp.cmd`) that invokes the MCP server using the bundled Node.js runtime.

#### Scenario: Server invocation
- **WHEN** user executes `perplexity-mcp.cmd`
- **THEN** the script SHALL invoke the bundled `node.exe` with the server entry point
- **AND** the script SHALL pass through any command-line arguments

#### Scenario: Environment variables
- **WHEN** the launcher script is executed
- **THEN** the `PERPLEXITY_API_KEY` environment variable SHALL be read from the user's environment
- **AND** the `PERPLEXITY_TIMEOUT_MS` environment variable SHALL be read if set

---

### Requirement: Optional PATH Registration
The installer SHALL optionally add the installation directory to the system PATH.

#### Scenario: PATH checkbox enabled
- **WHEN** user enables the "Add to PATH" option during installation
- **THEN** the installer SHALL add the installation root directory to the system PATH
- **AND** the `perplexity-mcp` command SHALL be available from any command prompt after system restart

#### Scenario: PATH checkbox disabled (default)
- **WHEN** user leaves the "Add to PATH" option disabled (default behavior)
- **THEN** the installer SHALL NOT modify the system PATH
- **AND** users SHALL invoke the server via the full path or Start Menu shortcut

#### Scenario: PATH registration via silent install
- **WHEN** user runs `msiexec /i installer.msi /qn ADDTOPATH=1`
- **THEN** the installer SHALL add the installation directory to the system PATH

---

### Requirement: Silent Installation Support
The installer SHALL support silent (unattended) installation via standard MSI command-line options.

#### Scenario: Silent installation with defaults
- **WHEN** user runs `msiexec /i installer.msi /qn`
- **THEN** the installer SHALL install silently to the default location
- **AND** the installer SHALL NOT add the installation to PATH (default)

#### Scenario: Silent installation with custom options
- **WHEN** user runs `msiexec /i installer.msi /qn INSTALLDIR="C:\Custom\Path" ADDTOPATH=1`
- **THEN** the installer SHALL install to the specified directory
- **AND** the installer SHALL add the installation to PATH

---

### Requirement: Example Client Configurations
The installer SHALL include example configuration files for supported MCP clients.

#### Scenario: Configuration files installed
- **WHEN** installation completes
- **THEN** the installer SHALL have created example JSON configuration files for:
  - Claude Desktop (`claude-desktop.json`)
  - Claude Code (`claude-code.json`)
  - Cursor (`cursor.json`)
- **AND** each configuration file SHALL contain the hardcoded full path to the installed launcher script
- **AND** each configuration file SHALL include placeholder text `pplx-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` for the API key
- **AND** each configuration file SHALL include `PERPLEXITY_TIMEOUT_MS: 600000`

#### Scenario: User copies configuration
- **WHEN** user copies an example configuration to the appropriate client config location
- **AND** user replaces the API key placeholder with their actual key
- **THEN** the MCP client SHALL successfully connect to the Perplexity MCP Server

---

### Requirement: MIT License Display
The installer SHALL display the MIT license during installation for user acceptance.

#### Scenario: License dialog
- **WHEN** user runs the installer
- **THEN** the installer SHALL display the MIT license text in a dialog
- **AND** the user SHALL be required to accept the license to proceed with installation

---

### Requirement: Build Script
The project SHALL include a PowerShell build script that produces the MSI installer on Windows.

#### Scenario: Build prerequisites
- **WHEN** user runs the build script
- **THEN** the script SHALL verify WiX Toolset v4+ is installed
- **AND** the script SHALL verify Node.js is available for npm operations
- **AND** the script SHALL fail with a clear error message if prerequisites are missing

#### Scenario: Version detection
- **WHEN** user runs the build script
- **THEN** the script SHALL read the version from `package.json`
- **AND** the script SHALL convert the version to MSI format by appending `.0` (e.g., `0.2.2` → `0.2.2.0`)
- **AND** the script SHALL strip any pre-release suffix from the version

#### Scenario: Build process
- **WHEN** user runs `npm run build:installer`
- **THEN** the script SHALL run `npm run build` to compile TypeScript
- **AND** the script SHALL download minimal Node.js 22.x LTS (just `node.exe`) if not already cached
- **AND** the script SHALL invoke WiX to compile and link the MSI
- **AND** the script SHALL output the MSI to `installer/build/PerplexityMCPServer-{version}.msi`

#### Scenario: Clean build
- **WHEN** user runs the build script with `-Clean` flag
- **THEN** the script SHALL remove all build artifacts before building

---

### Requirement: MSI Code Signing
The build script SHALL support optional code signing of the MSI installer using Azure Trusted Signing.

#### Scenario: Signed build
- **WHEN** user runs the build script with `-Sign` flag
- **THEN** the script SHALL verify Windows SDK 10.0.26100.0 or newer is installed
- **AND** the script SHALL verify the Azure Code Signing DLib is available at the configured path
- **AND** the script SHALL verify the signing metadata JSON file exists at the configured path
- **AND** the script SHALL invoke `signtool.exe` with Azure Trusted Signing parameters
- **AND** the script SHALL use SHA256 for file digest algorithm
- **AND** the script SHALL use Microsoft timestamp server (`http://timestamp.acs.microsoft.com`)
- **AND** the script SHALL verify the signature after signing completes
- **AND** the script SHALL fail with a clear error if signing or verification fails

#### Scenario: Unsigned build (default)
- **WHEN** user runs the build script without `-Sign` flag
- **THEN** the script SHALL produce an unsigned MSI
- **AND** the script SHALL NOT require signing prerequisites

#### Scenario: Default signing paths
- **WHEN** user runs the build script with `-Sign` but without custom path parameters
- **THEN** the script SHALL use default metadata path: `C:\Temp\tsscat\CodeSigning\metadata-packager-mcp.json`
- **AND** the script SHALL use default DLib path: `C:\Temp\tsscat\CodeSigning\Microsoft.Trusted.Signing.Client.1.0.95\bin\x64\Azure.CodeSigning.Dlib.dll`

#### Scenario: Custom signing paths
- **WHEN** user runs the build script with `-Sign` and custom path parameters
- **THEN** the script SHALL accept `-SigningMetadataPath` parameter for the Azure metadata JSON file
- **AND** the script SHALL accept `-SigningDlibPath` parameter for the Azure Code Signing DLib DLL

#### Scenario: Signing prerequisites missing
- **WHEN** user runs the build script with `-Sign` flag
- **AND** Windows SDK 10.0.26100.0+ is not installed
- **THEN** the script SHALL fail with a message indicating the required SDK version

#### Scenario: Signature verification
- **WHEN** signing completes successfully
- **THEN** the script SHALL verify the Authenticode signature using `Get-AuthenticodeSignature`
- **AND** the script SHALL display the signer certificate subject
- **AND** the script SHALL display the timestamp certificate subject

---

### Requirement: Auto-Update Check
The installer SHALL include a scheduled update-check mechanism that queries GitHub Releases for new versions.

#### Scenario: Scheduled task registration
- **WHEN** installation completes successfully
- **THEN** the installer SHALL register a Windows Scheduled Task named `PerplexityMCPServerUpdateCheck`
- **AND** the task SHALL be configured to run daily at a randomized time between 09:00-11:00
- **AND** the task SHALL run under the SYSTEM account (no user login required)
- **AND** the task SHALL have "Run whether user is logged on or not" enabled
- **AND** the task SHALL NOT wake the computer to run

#### Scenario: Update check execution
- **WHEN** the scheduled task runs
- **THEN** it SHALL execute the `check-updates.ps1` PowerShell script from the installation directory
- **AND** the script SHALL query the GitHub Releases API endpoint: `https://api.github.com/repos/perplexityai/modelcontextprotocol/releases/latest`
- **AND** the script SHALL parse the `tag_name` field from the JSON response to determine the latest version
- **AND** the script SHALL read the installed version from the registry key `HKLM:\SOFTWARE\Big Hat Group Inc.\Perplexity MCP Server\Version`
- **AND** the script SHALL compare semantic versions to determine if an update is available

#### Scenario: Update notification (newer version available)
- **WHEN** the latest GitHub release version is newer than the installed version
- **THEN** the script SHALL display a Windows Toast notification with:
  - Title: "Perplexity MCP Server Update Available"
  - Body: "Version {new_version} is available. You have version {installed_version}."
  - Action button: "Download" linking to the GitHub releases page
- **AND** the script SHALL log the check result to `%PROGRAMDATA%\Perplexity MCP Server\update-check.log`

#### Scenario: No update available
- **WHEN** the installed version is equal to or newer than the latest GitHub release
- **THEN** the script SHALL NOT display any notification
- **AND** the script SHALL log the check result to the log file

#### Scenario: Network error during check
- **WHEN** the script cannot reach the GitHub API (network error, timeout, etc.)
- **THEN** the script SHALL NOT display any error notification to the user
- **AND** the script SHALL log the error to the log file
- **AND** the script SHALL exit gracefully with code 0 (to avoid task scheduler error alerts)

#### Scenario: Uninstallation cleanup
- **WHEN** user uninstalls the application
- **THEN** the uninstaller SHALL remove the `PerplexityMCPServerUpdateCheck` scheduled task
- **AND** the uninstaller SHALL remove the registry keys under `HKLM:\SOFTWARE\Big Hat Group Inc.\Perplexity MCP Server`
- **AND** the uninstaller SHALL remove the log directory `%PROGRAMDATA%\Perplexity MCP Server`

#### Scenario: Manual update check
- **WHEN** user runs `check-updates.ps1` manually from the installation directory
- **THEN** the script SHALL perform the same update check as the scheduled task
- **AND** the script SHALL display results to the console in addition to any toast notification
