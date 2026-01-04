## ADDED Requirements

### Requirement: Windows MSI Installer

The system SHALL provide a Windows MSI installer for the Perplexity MCP Server that enables installation without requiring manual Node.js setup or command-line interaction.

#### Scenario: Fresh installation on Windows without Node.js
- **WHEN** a user runs the MSI installer on a Windows machine without Node.js installed
- **THEN** the installer SHALL complete successfully
- **AND** the bundled Node.js runtime SHALL be installed to the installation directory
- **AND** the MCP server SHALL be operational after installation

#### Scenario: Installation directory structure
- **WHEN** the installer completes successfully
- **THEN** the installation directory SHALL contain a `node/` subdirectory with the Node.js runtime
- **AND** the installation directory SHALL contain a `server/` subdirectory with the MCP server files
- **AND** the installation directory SHALL contain a `perplexity-mcp.cmd` wrapper script

### Requirement: API Key Configuration

The installer SHALL collect the user's Perplexity API key during installation and configure it for use by the MCP server.

#### Scenario: API key collection during install
- **WHEN** the user proceeds through the installation wizard
- **THEN** a dialog SHALL prompt for the Perplexity API key
- **AND** the user MUST provide a non-empty API key to proceed

#### Scenario: API key storage
- **WHEN** the installation completes with a valid API key
- **THEN** the API key SHALL be stored in the user's `PERPLEXITY_API_KEY` environment variable
- **AND** the environment variable SHALL persist across system restarts

### Requirement: MCP Client Auto-Configuration

The installer SHALL automatically configure all detected MCP-compatible clients to use the installed server.

#### Scenario: Claude Desktop configuration
- **WHEN** Claude Desktop is installed (config directory exists at `%APPDATA%\Claude\`)
- **THEN** the installer SHALL update `claude_desktop_config.json` to include the Perplexity MCP server
- **AND** existing configuration entries SHALL be preserved
- **AND** a backup of the original config SHALL be created

#### Scenario: Claude Code configuration
- **WHEN** Claude Code configuration exists at `%USERPROFILE%\.claude\`
- **THEN** the installer SHALL update the settings to include the Perplexity MCP server
- **AND** existing configuration entries SHALL be preserved
- **AND** a backup of the original config SHALL be created

#### Scenario: Cursor configuration
- **WHEN** Cursor is installed (config directory exists at `%APPDATA%\Cursor\User\globalStorage\`)
- **THEN** the installer SHALL update `mcp.json` to include the Perplexity MCP server
- **AND** existing configuration entries SHALL be preserved
- **AND** a backup of the original config SHALL be created

#### Scenario: Client not installed
- **WHEN** an MCP client's configuration directory does not exist
- **THEN** the installer SHALL skip configuration for that client
- **AND** the installation SHALL continue without error

### Requirement: Uninstallation

The installer SHALL provide a clean uninstallation option that removes server files and offers to clean up configurations.

#### Scenario: Uninstall via Windows Settings
- **WHEN** a user uninstalls the Perplexity MCP Server via Windows Settings or Control Panel
- **THEN** the server files SHALL be removed from the installation directory
- **AND** the user SHALL be prompted to optionally remove the API key environment variable
- **AND** the user SHALL be prompted to optionally remove client configurations

#### Scenario: Uninstall with config restoration
- **WHEN** the user chooses to remove client configurations during uninstall
- **AND** backup config files exist
- **THEN** the original configuration files SHALL be restored from backups
