## ADDED Requirements

### Requirement: Fail-Fast Error Handling
The installer scripts SHALL fail fast on critical errors while continuing past non-fatal issues.

#### Scenario: Missing client installation is non-fatal
- **WHEN** Claude Desktop, Claude Code, or Cursor is not installed
- **THEN** the installer logs a warning and continues to the next client

#### Scenario: File write failure is fatal
- **WHEN** the installer cannot write to a configuration file due to permissions
- **THEN** the installer fails with a clear error message

#### Scenario: Each client is isolated
- **WHEN** configuration of one client fails
- **THEN** other clients are still attempted and the failure is logged

### Requirement: Secure API Key Handling
API keys SHALL NOT be passed as command-line arguments visible in process listings.

#### Scenario: Codex configuration uses environment variable
- **WHEN** configuring Codex MCP server
- **THEN** the API key is passed via environment variable, not command-line argument

#### Scenario: API key not in process listing
- **WHEN** the installer is running
- **THEN** the API key is not visible in Task Manager or `Get-Process` output

### Requirement: JSON Structure Validation
Configuration file modifications SHALL validate JSON structure before writing.

#### Scenario: Valid JSON is preserved
- **WHEN** the existing config file contains valid JSON
- **THEN** existing settings are preserved and only mcpServers is added/updated

#### Scenario: Malformed JSON is handled gracefully
- **WHEN** the existing config file contains invalid JSON
- **THEN** a backup is created and a new valid config file is written

#### Scenario: Missing mcpServers key is created
- **WHEN** the config file exists but has no mcpServers key
- **THEN** the mcpServers key is added without affecting other settings

### Requirement: SHA256 for Component IDs
The installer build script SHALL use SHA256 instead of MD5 for generating component identifiers.

#### Scenario: Component IDs use SHA256
- **WHEN** generating WiX component GUIDs
- **THEN** SHA256 hash is used (truncated to required length)

#### Scenario: Generated IDs are deterministic
- **WHEN** building the installer multiple times
- **THEN** the same input files produce the same component IDs

### Requirement: Comprehensive Logging
Installer scripts SHALL log sufficient detail for troubleshooting.

#### Scenario: Client configuration results are logged
- **WHEN** the installer completes
- **THEN** the log shows which clients were configured, skipped, or failed

#### Scenario: Errors include context
- **WHEN** an error occurs during installation
- **THEN** the log includes the error message, affected file, and suggested action
