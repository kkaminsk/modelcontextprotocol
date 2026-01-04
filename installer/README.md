# Perplexity MCP Server - Windows Installer

This directory contains the WiX-based Windows installer for the Perplexity MCP Server.

## Prerequisites

To build the installer, you need:

1. **.NET SDK 6.0 or later** - [Download](https://dotnet.microsoft.com/download)
2. **Node.js 18+** - For building the MCP server
3. **Internet connection** - To download Node.js for bundling

WiX Toolset v4 is automatically downloaded via NuGet when building.

## Building the Installer

### Quick Build

```powershell
npm run build:installer
```

### Clean Build

```powershell
npm run build:installer:clean
```

### Manual Build

```powershell
cd installer
.\Build-Installer.ps1
```

### Build Options

```powershell
# Specify Node.js version
.\Build-Installer.ps1 -NodeVersion "20.18.1"

# Skip Node.js download (if already staged)
.\Build-Installer.ps1 -SkipNodeDownload

# Clean build (remove staging and output)
.\Build-Installer.ps1 -Clean
```

## Output

The MSI installer will be created in `installer/output/`.

## Directory Structure

```
installer/
├── assets/               # Installer assets (license, icons)
│   └── license.rtf       # License displayed during install
├── CustomActions/        # PowerShell scripts for configuration
│   ├── ConfigureMcpClients.ps1
│   └── RemoveMcpClients.ps1
├── files/                # Files to install
│   └── perplexity-mcp.cmd
├── staging/              # Build staging (not committed)
│   └── node/             # Bundled Node.js
├── output/               # Build output (not committed)
├── Build-Installer.ps1   # Main build script
├── Package.wxs           # WiX installer definition
└── PerplexityMCP.wixproj # WiX project file
```

## What the Installer Does

1. **Installs files** to `C:\Program Files\Perplexity MCP Server\`
   - Bundled Node.js runtime
   - MCP server files
   - Wrapper script

2. **Collects API key** during installation
   - Stores as user environment variable `PERPLEXITY_API_KEY`

3. **Configures MCP clients** (if installed)
   - Claude Desktop
   - Claude Code
   - Cursor
   - Codex

4. **Creates backups** of existing client configurations

## Testing

To test the installer:

```powershell
# Install with logging
msiexec /i "output\PerplexityMCP.msi" /l*v install.log

# Uninstall
msiexec /x "output\PerplexityMCP.msi"

# Silent install with API key
msiexec /i "output\PerplexityMCP.msi" PERPLEXITY_API_KEY="your-key" /qn
```

## Troubleshooting

### Build fails with "dotnet not found"
Install .NET SDK 6.0+ from https://dotnet.microsoft.com/download

### Build fails with WiX errors
Ensure the .NET SDK is properly installed and run:
```powershell
dotnet restore installer/PerplexityMCP.wixproj
```

### Node.js download fails
Check your internet connection or manually download Node.js and extract to `installer/staging/node/`
