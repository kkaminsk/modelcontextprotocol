# Tasks: Improve Installer Robustness

## 1. Improve Error Handling in ConfigureMcpClients.ps1
- [ ] 1.1 Change `$ErrorActionPreference = "Continue"` to `"Stop"`
- [ ] 1.2 Wrap each client configuration function in try-catch
- [ ] 1.3 Add meaningful error messages when configuration fails
- [ ] 1.4 Continue to next client on non-fatal errors (missing client)
- [ ] 1.5 Fail the script on fatal errors (file write failures)

## 2. Fix API Key Passing in Codex Configuration
- [ ] 2.1 Modify Configure-Codex function to use environment variable approach
- [ ] 2.2 Remove API key from command-line argument in codex mcp add
- [ ] 2.3 Document the change in logging output

## 3. Add JSON Structure Validation
- [ ] 3.1 Create `Test-McpConfigStructure` validation function
- [ ] 3.2 Validate mcpServers key exists or can be created
- [ ] 3.3 Handle malformed JSON gracefully (backup and create new)
- [ ] 3.4 Log validation results for debugging

## 4. Replace MD5 with SHA256 in Build-Installer.ps1
- [ ] 4.1 Replace `[System.Security.Cryptography.MD5]::Create()` with SHA256
- [ ] 4.2 Truncate SHA256 hash to same length used previously (16 chars)
- [ ] 4.3 Verify generated GUIDs are still valid format

## 5. Improve Logging
- [ ] 5.1 Add log levels (INFO, WARN, ERROR) to Write-Log function
- [ ] 5.2 Log the specific error when JSON parsing fails
- [ ] 5.3 Log backup file creation success/failure
- [ ] 5.4 Log which clients were successfully configured vs skipped

## 6. Validation
- [ ] 6.1 Test installer on clean Windows system
- [ ] 6.2 Test with missing Claude Desktop (should skip gracefully)
- [ ] 6.3 Test with malformed config file (should backup and recreate)
- [ ] 6.4 Test uninstaller removes configuration correctly
- [ ] 6.5 Verify API key is not visible in Task Manager or process list
