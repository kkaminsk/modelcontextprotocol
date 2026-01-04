# RemoveMcpClients.ps1
# Removes Perplexity MCP Server configuration from MCP clients
# Called during MSI uninstallation

param(
    [Parameter(Mandatory=$false)]
    [switch]$RemoveApiKey,

    [Parameter(Mandatory=$false)]
    [switch]$RestoreBackups
)

$ErrorActionPreference = "Continue"

function Write-Log {
    param([string]$Message)
    Write-Host "[$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')] $Message"
}

# Function to remove perplexity from config and optionally restore backup
function Remove-PerplexityFromConfig {
    param(
        [string]$ConfigPath,
        [string]$ClientName
    )

    if (-not (Test-Path $ConfigPath)) {
        Write-Log "$ClientName config not found"
        return
    }

    $backupPath = "$ConfigPath.bak"

    if ($RestoreBackups -and (Test-Path $backupPath)) {
        # Restore from backup
        Copy-Item -Path $backupPath -Destination $ConfigPath -Force
        Remove-Item -Path $backupPath -Force
        Write-Log "Restored $ClientName config from backup"
    }
    else {
        # Remove just the perplexity entry
        try {
            $content = Get-Content -Path $ConfigPath -Raw | ConvertFrom-Json
            if ($content.mcpServers -and $content.mcpServers.perplexity) {
                $content.mcpServers.PSObject.Properties.Remove("perplexity")
                $content | ConvertTo-Json -Depth 10 | Set-Content -Path $ConfigPath -Encoding UTF8
                Write-Log "Removed perplexity from $ClientName config"
            }
        }
        catch {
            Write-Log "Warning: Could not update $ClientName config: $_"
        }
    }
}

Write-Log "=== Removing Perplexity MCP Server Configuration ==="

# Remove from Claude Desktop
$claudeDesktopConfig = Join-Path $env:APPDATA "Claude\claude_desktop_config.json"
Remove-PerplexityFromConfig -ConfigPath $claudeDesktopConfig -ClientName "Claude Desktop"

# Remove from Claude Code
$claudeCodeConfig = Join-Path $env:USERPROFILE ".claude\settings.json"
Remove-PerplexityFromConfig -ConfigPath $claudeCodeConfig -ClientName "Claude Code"

# Remove from Cursor
$cursorConfig = Join-Path $env:APPDATA "Cursor\User\globalStorage\mcp.json"
Remove-PerplexityFromConfig -ConfigPath $cursorConfig -ClientName "Cursor"

# Optionally remove API key
if ($RemoveApiKey) {
    [Environment]::SetEnvironmentVariable("PERPLEXITY_API_KEY", $null, "User")
    Write-Log "Removed PERPLEXITY_API_KEY environment variable"
}

Write-Log "=== Removal Complete ==="
