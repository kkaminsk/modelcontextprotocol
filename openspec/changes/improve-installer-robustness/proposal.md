# Change: Improve Windows Installer Robustness

## Why

The code audit identified several robustness issues in the Windows installer scripts:
1. `ErrorActionPreference = "Continue"` allows partial failures to go unnoticed
2. API key passed as command-line argument may be visible in process listings
3. No validation of JSON structure before modification
4. MD5 hash algorithm used for GUIDs (deprecated, though not security-critical here)

## What Changes

- Change error handling strategy to fail-fast with explicit try-catch
- Pass API key via environment variable instead of command-line argument
- Add JSON structure validation before modifying config files
- Replace MD5 with SHA256 for GUID generation (truncated to required length)
- Add more detailed logging for troubleshooting

## Impact

- Affected specs: installer (new)
- Affected code: `installer/CustomActions/ConfigureMcpClients.ps1`, `installer/Build-Installer.ps1`
- **No breaking changes** for end users
- More reliable installation process
- Better error visibility when something goes wrong
- Slightly improved security posture
