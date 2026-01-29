<#
.SYNOPSIS
    Downloads minimal Node.js 22.x LTS (just node.exe) for bundling with the installer.

.DESCRIPTION
    This script downloads the latest Node.js 22.x LTS release and extracts only node.exe
    to minimize the installer size. The downloaded file is cached in installer/node/.

.PARAMETER Force
    Force re-download even if node.exe already exists in the cache.

.EXAMPLE
    .\download-node.ps1
    Downloads Node.js 22.x LTS if not already cached.

.EXAMPLE
    .\download-node.ps1 -Force
    Forces re-download even if cached.
#>

[CmdletBinding()]
param(
    [switch]$Force
)

$ErrorActionPreference = "Stop"

# Configuration
$NodeMajorVersion = 22
$Architecture = "x64"
$InstallerRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$NodeCacheDir = Join-Path $InstallerRoot "installer\node"
$NodeExePath = Join-Path $NodeCacheDir "node.exe"

# Create cache directory if it doesn't exist
if (-not (Test-Path $NodeCacheDir)) {
    New-Item -ItemType Directory -Path $NodeCacheDir -Force | Out-Null
    Write-Host "Created cache directory: $NodeCacheDir"
}

# Check if node.exe already exists
if ((Test-Path $NodeExePath) -and -not $Force) {
    Write-Host "Node.js already cached at: $NodeExePath"
    $nodeVersion = & $NodeExePath --version 2>$null
    if ($nodeVersion) {
        Write-Host "Cached version: $nodeVersion"
        return $NodeExePath
    }
    Write-Host "Cached node.exe appears invalid, re-downloading..."
}

# Get the latest LTS version for the specified major version
Write-Host "Fetching Node.js version information..."
$indexUrl = "https://nodejs.org/dist/index.json"
$versions = Invoke-RestMethod -Uri $indexUrl -UseBasicParsing

# Find the latest LTS version for our major version
$latestLTS = $versions | Where-Object {
    $_.lts -and $_.version -match "^v$NodeMajorVersion\."
} | Select-Object -First 1

if (-not $latestLTS) {
    throw "Could not find Node.js $NodeMajorVersion.x LTS version"
}

$nodeVersion = $latestLTS.version
Write-Host "Latest Node.js $NodeMajorVersion.x LTS: $nodeVersion"

# Construct download URL for Windows x64 zip
$zipFileName = "node-$nodeVersion-win-$Architecture.zip"
$downloadUrl = "https://nodejs.org/dist/$nodeVersion/$zipFileName"

# Download to temp location
$tempZipPath = Join-Path $env:TEMP $zipFileName
Write-Host "Downloading from: $downloadUrl"
Write-Host "Saving to: $tempZipPath"

try {
    $ProgressPreference = 'SilentlyContinue'  # Speed up download
    Invoke-WebRequest -Uri $downloadUrl -OutFile $tempZipPath -UseBasicParsing
    Write-Host "Download complete."
}
catch {
    throw "Failed to download Node.js: $_"
}

# Extract just node.exe from the zip
Write-Host "Extracting node.exe..."
$zipFolderName = "node-$nodeVersion-win-$Architecture"

try {
    # Load the ZIP assembly
    Add-Type -AssemblyName System.IO.Compression.FileSystem

    $zip = [System.IO.Compression.ZipFile]::OpenRead($tempZipPath)
    try {
        $nodeEntry = $zip.Entries | Where-Object { $_.FullName -eq "$zipFolderName/node.exe" }

        if (-not $nodeEntry) {
            throw "Could not find node.exe in the zip archive"
        }

        # Extract node.exe
        [System.IO.Compression.ZipFileExtensions]::ExtractToFile($nodeEntry, $NodeExePath, $true)
        Write-Host "Extracted node.exe to: $NodeExePath"
    }
    finally {
        $zip.Dispose()
    }
}
catch {
    throw "Failed to extract node.exe: $_"
}
finally {
    # Clean up temp zip
    if (Test-Path $tempZipPath) {
        Remove-Item $tempZipPath -Force
        Write-Host "Cleaned up temporary zip file."
    }
}

# Verify the extracted node.exe works
Write-Host "Verifying node.exe..."
$extractedVersion = & $NodeExePath --version 2>$null
if ($extractedVersion -ne $nodeVersion) {
    throw "Verification failed: expected $nodeVersion but got $extractedVersion"
}

Write-Host "Successfully downloaded and verified Node.js $nodeVersion"
Write-Host "Location: $NodeExePath"

return $NodeExePath
