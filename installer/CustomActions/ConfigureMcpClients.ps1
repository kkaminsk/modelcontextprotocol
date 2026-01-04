# ConfigureMcpClients.ps1
# Configures MCP clients to use the installed Perplexity MCP Server
# Called during MSI installation

param(
    [Parameter(Mandatory=$true)]
    [string]$InstallFolder,

    [Parameter(Mandatory=$false)]
    [string]$ApiKey
)

$ErrorActionPreference = "Continue"

# Log function
function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $logMessage = "[$timestamp] $Message"
    Write-Host $logMessage

    # Also write to a log file in the install folder
    $logFile = Join-Path $InstallFolder "install.log"
    Add-Content -Path $logFile -Value $logMessage -ErrorAction SilentlyContinue
}

# Function to safely read and parse JSON
function Get-JsonContent {
    param([string]$Path)

    if (-not (Test-Path $Path)) {
        return $null
    }

    try {
        $content = Get-Content -Path $Path -Raw -ErrorAction Stop
        if ([string]::IsNullOrWhiteSpace($content)) {
            return @{}
        }
        return $content | ConvertFrom-Json
    }
    catch {
        Write-Log "Warning: Could not parse JSON at $Path : $_"
        return $null
    }
}

# Function to create backup of config file
function Backup-ConfigFile {
    param([string]$Path)

    if (Test-Path $Path) {
        $backupPath = "$Path.bak"
        Copy-Item -Path $Path -Destination $backupPath -Force
        Write-Log "Created backup: $backupPath"
        return $true
    }
    return $false
}

# Function to get the MCP server configuration
function Get-McpServerConfig {
    param([string]$InstallFolder)

    $wrapperPath = Join-Path $InstallFolder "perplexity-mcp.cmd"

    return @{
        command = $wrapperPath
        args = @()
        env = @{
            PERPLEXITY_API_KEY = $env:PERPLEXITY_API_KEY
        }
    }
}

# Configure Claude Desktop
function Configure-ClaudeDesktop {
    param([string]$InstallFolder)

    $configDir = Join-Path $env:APPDATA "Claude"
    $configPath = Join-Path $configDir "claude_desktop_config.json"

    Write-Log "Checking Claude Desktop at: $configDir"

    if (-not (Test-Path $configDir)) {
        Write-Log "Claude Desktop not installed (directory not found)"
        return
    }

    # Create backup
    Backup-ConfigFile -Path $configPath

    # Read existing config or create new
    $config = Get-JsonContent -Path $configPath
    if ($null -eq $config) {
        $config = @{}
    }

    # Ensure mcpServers object exists
    if (-not $config.mcpServers) {
        $config | Add-Member -NotePropertyName "mcpServers" -NotePropertyValue @{} -Force
    }

    # Add perplexity server config
    $serverConfig = Get-McpServerConfig -InstallFolder $InstallFolder
    $config.mcpServers | Add-Member -NotePropertyName "perplexity" -NotePropertyValue $serverConfig -Force

    # Write config
    $config | ConvertTo-Json -Depth 10 | Set-Content -Path $configPath -Encoding UTF8
    Write-Log "Configured Claude Desktop: $configPath"
}

# Configure Claude Code
function Configure-ClaudeCode {
    param([string]$InstallFolder)

    $configDir = Join-Path $env:USERPROFILE ".claude"
    $configPath = Join-Path $configDir "settings.json"

    Write-Log "Checking Claude Code at: $configDir"

    if (-not (Test-Path $configDir)) {
        Write-Log "Claude Code not installed (directory not found)"
        return
    }

    # Create backup
    Backup-ConfigFile -Path $configPath

    # Read existing config or create new
    $config = Get-JsonContent -Path $configPath
    if ($null -eq $config) {
        $config = @{}
    }

    # Ensure mcpServers object exists
    if (-not $config.mcpServers) {
        $config | Add-Member -NotePropertyName "mcpServers" -NotePropertyValue @{} -Force
    }

    # Add perplexity server config
    $serverConfig = Get-McpServerConfig -InstallFolder $InstallFolder
    $config.mcpServers | Add-Member -NotePropertyName "perplexity" -NotePropertyValue $serverConfig -Force

    # Write config
    $config | ConvertTo-Json -Depth 10 | Set-Content -Path $configPath -Encoding UTF8
    Write-Log "Configured Claude Code: $configPath"
}

# Configure Cursor
function Configure-Cursor {
    param([string]$InstallFolder)

    $configDir = Join-Path $env:APPDATA "Cursor\User\globalStorage"
    $configPath = Join-Path $configDir "mcp.json"

    Write-Log "Checking Cursor at: $configDir"

    if (-not (Test-Path $configDir)) {
        Write-Log "Cursor not installed (directory not found)"
        return
    }

    # Create backup
    Backup-ConfigFile -Path $configPath

    # Read existing config or create new
    $config = Get-JsonContent -Path $configPath
    if ($null -eq $config) {
        $config = @{}
    }

    # Ensure mcpServers object exists
    if (-not $config.mcpServers) {
        $config | Add-Member -NotePropertyName "mcpServers" -NotePropertyValue @{} -Force
    }

    # Add perplexity server config
    $serverConfig = Get-McpServerConfig -InstallFolder $InstallFolder
    $config.mcpServers | Add-Member -NotePropertyName "perplexity" -NotePropertyValue $serverConfig -Force

    # Write config
    $config | ConvertTo-Json -Depth 10 | Set-Content -Path $configPath -Encoding UTF8
    Write-Log "Configured Cursor: $configPath"
}

# Configure Codex (uses CLI if available)
function Configure-Codex {
    param([string]$InstallFolder)

    Write-Log "Checking for Codex CLI..."

    $codexCmd = Get-Command "codex" -ErrorAction SilentlyContinue
    if (-not $codexCmd) {
        Write-Log "Codex CLI not found in PATH"
        return
    }

    $wrapperPath = Join-Path $InstallFolder "perplexity-mcp.cmd"

    try {
        # Use Codex CLI to add the MCP server
        & codex mcp add perplexity --env "PERPLEXITY_API_KEY=$env:PERPLEXITY_API_KEY" -- "$wrapperPath"
        Write-Log "Configured Codex via CLI"
    }
    catch {
        Write-Log "Warning: Failed to configure Codex: $_"
    }
}

# Main execution
Write-Log "=== Perplexity MCP Server Configuration ==="
Write-Log "Install folder: $InstallFolder"

# Set API key environment variable if provided
if ($ApiKey) {
    [Environment]::SetEnvironmentVariable("PERPLEXITY_API_KEY", $ApiKey, "User")
    $env:PERPLEXITY_API_KEY = $ApiKey
    Write-Log "Set PERPLEXITY_API_KEY environment variable"
}

# Configure each client
Configure-ClaudeDesktop -InstallFolder $InstallFolder
Configure-ClaudeCode -InstallFolder $InstallFolder
Configure-Cursor -InstallFolder $InstallFolder
Configure-Codex -InstallFolder $InstallFolder

Write-Log "=== Configuration Complete ==="
