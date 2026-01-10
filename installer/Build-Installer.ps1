# Build-Installer.ps1
# Builds the Perplexity MCP Server Windows installer
# Prerequisites: .NET SDK 6.0+, WiX Toolset v4

[CmdletBinding()]
param(
    [Parameter()]
    [string]$NodeVersion = "20.18.1",

    [Parameter()]
    [switch]$SkipNodeDownload,

    [Parameter()]
    [switch]$Clean
)

$ErrorActionPreference = "Stop"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootDir = Split-Path -Parent $ScriptDir
$StagingDir = Join-Path $ScriptDir "staging"
$NodeDir = Join-Path $StagingDir "node"
$OutputDir = Join-Path $ScriptDir "output"

function Write-Step {
    param([string]$Message)
    Write-Host ""
    Write-Host "=== $Message ===" -ForegroundColor Cyan
}

function Test-Prerequisites {
    Write-Step "Checking prerequisites"

    # Check for dotnet
    $dotnet = Get-Command "dotnet" -ErrorAction SilentlyContinue
    if (-not $dotnet) {
        throw "dotnet SDK not found. Please install .NET SDK 6.0 or later."
    }
    Write-Host "Found dotnet: $($dotnet.Source)"

    # Check for npm (to build the server)
    $npm = Get-Command "npm" -ErrorAction SilentlyContinue
    if (-not $npm) {
        throw "npm not found. Please install Node.js."
    }
    Write-Host "Found npm: $($npm.Source)"
}

function Initialize-Directories {
    Write-Step "Initializing directories"

    if ($Clean) {
        if (Test-Path $StagingDir) {
            Remove-Item -Path $StagingDir -Recurse -Force
            Write-Host "Cleaned staging directory"
        }
        if (Test-Path $OutputDir) {
            Remove-Item -Path $OutputDir -Recurse -Force
            Write-Host "Cleaned output directory"
        }
    }

    New-Item -ItemType Directory -Path $StagingDir -Force | Out-Null
    New-Item -ItemType Directory -Path $NodeDir -Force | Out-Null
    New-Item -ItemType Directory -Path $OutputDir -Force | Out-Null
}

function Get-NodeJs {
    Write-Step "Downloading Node.js $NodeVersion"

    if ($SkipNodeDownload -and (Test-Path (Join-Path $NodeDir "node.exe"))) {
        Write-Host "Skipping Node.js download (already exists)"
        return
    }

    $nodeZipUrl = "https://nodejs.org/dist/v$NodeVersion/node-v$NodeVersion-win-x64.zip"
    $nodeZipPath = Join-Path $StagingDir "node.zip"
    $nodeExtractDir = Join-Path $StagingDir "node-extract"

    Write-Host "Downloading from: $nodeZipUrl"
    Invoke-WebRequest -Uri $nodeZipUrl -OutFile $nodeZipPath -UseBasicParsing

    Write-Host "Extracting Node.js..."
    if (Test-Path $nodeExtractDir) {
        Remove-Item -Path $nodeExtractDir -Recurse -Force
    }
    Expand-Archive -Path $nodeZipPath -DestinationPath $nodeExtractDir

    # Move contents to node folder
    $extractedFolder = Get-ChildItem -Path $nodeExtractDir -Directory | Select-Object -First 1
    if ($extractedFolder) {
        Get-ChildItem -Path $extractedFolder.FullName | Move-Item -Destination $NodeDir -Force
    }

    # Cleanup
    Remove-Item -Path $nodeZipPath -Force
    Remove-Item -Path $nodeExtractDir -Recurse -Force

    Write-Host "Node.js extracted to: $NodeDir"
}

function Build-Server {
    Write-Step "Building MCP Server"

    Push-Location $RootDir
    try {
        # Install dependencies
        Write-Host "Installing dependencies..."
        npm install

        # Build TypeScript
        Write-Host "Building TypeScript..."
        npm run build

        if (-not (Test-Path (Join-Path $RootDir "dist\index.js"))) {
            throw "Build failed: dist/index.js not found"
        }
        Write-Host "Server built successfully"
    }
    finally {
        Pop-Location
    }
}

function Build-NodeComponentsWxs {
    Write-Step "Generating Node.js components WXS"

    $wxsPath = Join-Path $ScriptDir "NodeComponents.wxs"
    $nodeFiles = Get-ChildItem -Path $NodeDir -Recurse -File

    # Collect all unique directories
    $directories = @{}
    $components = @()

    foreach ($file in $nodeFiles) {
        $relativePath = $file.FullName.Substring($NodeDir.Length + 1)
        $relativeDir = Split-Path -Parent $relativePath
        $fileName = $file.Name

        # Create a unique component ID using hash
        $hash = [System.BitConverter]::ToString(
            [System.Security.Cryptography.MD5]::Create().ComputeHash(
                [System.Text.Encoding]::UTF8.GetBytes($relativePath)
            )
        ).Replace("-", "").Substring(0, 16)

        $componentId = "Node_$hash"
        $fileId = "NodeFile_$hash"

        # Track directory - use NodeFolder for root files
        $dirId = "NodeFolder"
        if ($relativeDir -and $relativeDir -ne "") {
            $dirHash = [System.BitConverter]::ToString(
                [System.Security.Cryptography.MD5]::Create().ComputeHash(
                    [System.Text.Encoding]::UTF8.GetBytes($relativeDir)
                )
            ).Replace("-", "").Substring(0, 16)
            $dirId = "NodeDir_$dirHash"
            $directories[$relativeDir] = $dirId

            # Also add all parent directories to ensure complete tree
            $parentPath = $relativeDir
            while ($parentPath) {
                $parentPath = Split-Path -Parent $parentPath
                if ($parentPath -and $parentPath -ne "" -and -not $directories.ContainsKey($parentPath)) {
                    $parentHash = [System.BitConverter]::ToString(
                        [System.Security.Cryptography.MD5]::Create().ComputeHash(
                            [System.Text.Encoding]::UTF8.GetBytes($parentPath)
                        )
                    ).Replace("-", "").Substring(0, 16)
                    $directories[$parentPath] = "NodeDir_$parentHash"
                }
            }
        }

        # Create a unique GUID for each component using MD5 hash
        $guidBytes = [System.Text.Encoding]::UTF8.GetBytes("perplexity-mcp-node-$relativePath")
        $md5 = [System.Security.Cryptography.MD5]::Create()
        $hashBytes = $md5.ComputeHash($guidBytes)
        $guid = [System.Guid]::new($hashBytes).ToString("D").ToUpper()

        $components += @{
            ComponentId = $componentId
            FileId = $fileId
            DirId = $dirId
            RelativeDir = $relativeDir
            FileName = $fileName
            SourcePath = "staging\node\$relativePath"
            Guid = $guid
        }
    }

    # Build directory structure XML as a properly nested tree
    function Build-DirectoryTree {
        param(
            [string]$ParentPath,
            [string]$ParentId,
            [hashtable]$AllDirs,
            [int]$Indent
        )

        $xml = ""
        $indentStr = "    " * $Indent

        # Find immediate children of this parent
        $children = $AllDirs.Keys | Where-Object {
            $parent = Split-Path -Parent $_
            $parent -eq $ParentPath
        } | Sort-Object

        foreach ($childPath in $children) {
            $dirId = $AllDirs[$childPath]
            $dirName = Split-Path -Leaf $childPath

            # Check if this directory has children
            $hasChildren = $AllDirs.Keys | Where-Object {
                (Split-Path -Parent $_) -eq $childPath
            }

            if ($hasChildren) {
                $xml += "$indentStr<Directory Id=`"$dirId`" Name=`"$dirName`">`n"
                $xml += Build-DirectoryTree -ParentPath $childPath -ParentId $dirId -AllDirs $AllDirs -Indent ($Indent + 1)
                $xml += "$indentStr</Directory>`n"
            } else {
                $xml += "$indentStr<Directory Id=`"$dirId`" Name=`"$dirName`" />`n"
            }
        }

        return $xml
    }

    $dirXml = Build-DirectoryTree -ParentPath "" -ParentId "NodeFolder" -AllDirs $directories -Indent 2

    # Build components XML - iterate directly
    $componentGroupXml = ""

    foreach ($comp in $components) {
        $componentGroupXml += @"
      <Component Id="$($comp.ComponentId)" Directory="$($comp.DirId)" Guid="$($comp.Guid)" Bitness="always64">
        <File Id="$($comp.FileId)" Source="$($comp.SourcePath)" KeyPath="yes" />
      </Component>

"@
    }

    # Generate WXS content
    $wxsContent = @"
<?xml version="1.0" encoding="UTF-8"?>
<Wix xmlns="http://wixtoolset.org/schemas/v4/wxs">
  <Fragment>
    <DirectoryRef Id="NodeFolder">
$dirXml    </DirectoryRef>
  </Fragment>
  <Fragment>
    <ComponentGroup Id="NodeComponents">
$componentGroupXml    </ComponentGroup>
  </Fragment>
</Wix>
"@

    Set-Content -Path $wxsPath -Value $wxsContent -Encoding UTF8
    Write-Host "Generated: $wxsPath with $($components.Count) components"
}

function Build-Msi {
    Write-Step "Building MSI installer"

    Push-Location $ScriptDir
    try {
        # Restore NuGet packages for WiX
        Write-Host "Restoring WiX packages..."
        dotnet restore PerplexityMCP.wixproj

        # Build the MSI
        Write-Host "Building MSI..."
        dotnet build PerplexityMCP.wixproj -c Release -o $OutputDir

        $msiPath = Get-ChildItem -Path $OutputDir -Filter "*.msi" | Select-Object -First 1
        if ($msiPath) {
            Write-Host "MSI built successfully: $($msiPath.FullName)" -ForegroundColor Green
        }
        else {
            throw "MSI build failed: No .msi file found in output"
        }
    }
    finally {
        Pop-Location
    }
}

function Show-Summary {
    Write-Step "Build Summary"

    $msiPath = Get-ChildItem -Path $OutputDir -Filter "*.msi" | Select-Object -First 1
    if ($msiPath) {
        $msiSize = [math]::Round($msiPath.Length / 1MB, 2)
        Write-Host "Output: $($msiPath.FullName)"
        Write-Host "Size: $msiSize MB"
        Write-Host ""
        Write-Host "To test the installer:" -ForegroundColor Yellow
        Write-Host "  msiexec /i `"$($msiPath.FullName)`" /l*v install.log"
    }
}

# Main execution
try {
    Write-Host "Perplexity MCP Server Installer Build" -ForegroundColor Magenta
    Write-Host "=====================================" -ForegroundColor Magenta

    Test-Prerequisites
    Initialize-Directories
    Get-NodeJs
    Build-Server
    Build-NodeComponentsWxs
    Build-Msi
    Show-Summary

    Write-Host ""
    Write-Host "Build completed successfully!" -ForegroundColor Green
}
catch {
    Write-Host ""
    Write-Host "Build failed: $_" -ForegroundColor Red
    exit 1
}
