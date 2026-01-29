# Code Audit Report: Perplexity MCP Server

**Version:** 0.2.2
**Date:** 2026-01-20
**Auditor:** Claude Code (Opus 4.5)

---

## Executive Summary

The Perplexity MCP Server is a well-structured, single-file MCP implementation that provides AI assistants with Perplexity API capabilities. Overall code quality is good, but there are several areas for improvement related to security, maintainability, and best practices.

**Overall Assessment:** Good with minor improvements needed

| Category | Rating | Notes |
|----------|--------|-------|
| Security | B+ | Good practices, minor improvements possible |
| Code Quality | B+ | Well-organized, some duplication |
| Maintainability | B | Single-file design limits scalability |
| Error Handling | A- | Comprehensive error handling |
| Documentation | A | Excellent inline docs and JSDoc |
| Type Safety | A- | Strong TypeScript usage |

---

## 1. Security Analysis

### 1.1 Strengths

- **API Key Handling**: Properly reads from environment variable, exits immediately if missing (`index.ts:476-479`)
- **No Hardcoded Secrets**: No credentials in source code
- **HTTPS Only**: All API calls use `https://api.perplexity.ai` (`index.ts:528, 706, 989, etc.`)
- **Input Validation**: Parameters are validated before use (domain filter limits, temperature bounds, etc.)

### 1.2 Concerns

#### 1.2.1 API Key Exposure in Logs (Low Risk)

**Location:** `ConfigureMcpClients.ps1:203`
```powershell
& codex mcp add perplexity --env "PERPLEXITY_API_KEY=$env:PERPLEXITY_API_KEY" -- "$wrapperPath"
```

**Issue:** API key passed as command-line argument may be visible in process listings.

**Recommendation:** Consider using stdin or environment variable passing instead of command-line arguments.

#### 1.2.2 MD5 Hash for GUIDs (Low Risk)

**Location:** `Build-Installer.ps1:140-144, 176-179`
```powershell
$md5 = [System.Security.Cryptography.MD5]::Create()
```

**Issue:** MD5 is cryptographically broken. While used only for generating installer component IDs (not security-critical), using a deprecated algorithm is not ideal.

**Recommendation:** Use SHA256 truncated to required length.

#### 1.2.3 No Request Origin Validation (Informational)

**Location:** `index.ts` (entire file)

**Issue:** The MCP server does not validate the origin of requests. This is standard for MCP stdio transport but worth noting.

**Note:** This is expected behavior for MCP servers using stdio transport.

### 1.3 Missing Security Features

| Feature | Status | Priority |
|---------|--------|----------|
| Rate limiting | Not implemented | Low (API has its own limits) |
| Request logging | Minimal (stderr only) | Low |
| Input sanitization | Partial (relies on API) | Low |

---

## 2. Code Quality Issues

### 2.1 Code Duplication

#### 2.1.1 Repeated Option Building Logic (Medium)

**Locations:**
- `index.ts:1367-1398` (perplexity_ask handler)
- `index.ts:1414-1440` (perplexity_research handler)
- `index.ts:1453-1483` (perplexity_reason handler)
- `index.ts:1504-1522` (perplexity_search handler)

**Issue:** Nearly identical option parsing code repeated in each tool handler.

**Recommendation:** Extract to a shared helper function:
```typescript
function buildOptionsFromArgs(args: Record<string, unknown>): Record<string, unknown> {
  const options: Record<string, unknown> = {};
  // centralized option parsing
  return options;
}
```

#### 2.1.2 Duplicate Fetch/Timeout Logic (Medium)

**Locations:**
- `index.ts:603-624` (performChatCompletion)
- `index.ts:777-798` (performStreamingChatCompletion)
- `index.ts:1024-1045` (performSingleSearch)
- `index.ts:1176-1197` (startAsyncResearch)
- `index.ts:1243-1262` (getAsyncResearchStatus)

**Issue:** Each function duplicates the same AbortController/timeout/error handling pattern.

**Recommendation:** Create a shared fetch wrapper:
```typescript
async function fetchWithTimeout(url: string, options: RequestInit): Promise<Response>
```

### 2.2 Type Safety Issues

#### 2.2.1 Use of `any` Type

**Locations:**
- `index.ts:902` - `formatSearchResults(data: any)`
- `index.ts:909` - `result: any`
- `index.ts:945` - `r: any`
- `index.ts:988` - `Promise<any>`
- `index.ts:990` - `const body: any`

**Recommendation:** Define proper interfaces for API responses:
```typescript
interface PerplexitySearchResult {
  title: string;
  url: string;
  snippet?: string;
  date?: string;
}

interface PerplexitySearchResponse {
  results: PerplexitySearchResult[];
}
```

### 2.3 Unused Dependencies

**Location:** `package.json:41-44`
```json
"axios": "^1.13.2",
"dotenv": "^16.3.1",
"openspec": "^0.0.0"
```

**Issue:**
- `axios` is declared but never imported in `index.ts` (uses native `fetch`)
- `dotenv` is declared but never imported (relies on shell environment)
- `openspec` appears to be a development tool, not a runtime dependency

**Recommendation:** Move unused packages to `devDependencies` or remove entirely.

---

## 3. Maintainability Concerns

### 3.1 Single-File Architecture

**Location:** `index.ts` (1619 lines)

**Issue:** All server logic is in a single file, making it harder to:
- Navigate and understand the codebase
- Test individual components
- Reuse components
- Work in parallel on different features

**Recommendation:** Consider splitting into modules:
```
src/
  tools/
    ask.ts
    research.ts
    reason.ts
    search.ts
    async.ts
  utils/
    fetch.ts
    formatting.ts
  types/
    api.ts
    tools.ts
  server.ts
  index.ts
```

### 3.2 Magic Numbers and Strings

**Location:** Various

| Value | Location | Suggestion |
|-------|----------|------------|
| `300000` | `index.ts:483` | `DEFAULT_TIMEOUT_MS` |
| `20` | Multiple places | `MAX_DOMAIN_FILTERS` |
| `5` | `index.ts:1102` | `MAX_BATCH_QUERIES` |
| `"sonar-pro"` | Multiple places | `DEFAULT_MODEL` |

### 3.3 Version Mismatch

**Locations:**
- `package.json:3` - `"version": "0.2.2"`
- `index.ts:1318` - `version: "0.1.0"`

**Issue:** Server metadata version doesn't match package version.

**Recommendation:** Import version from `package.json` or use a single source of truth.

---

## 4. Error Handling Analysis

### 4.1 Strengths

- Comprehensive try-catch blocks around all API calls
- Descriptive error messages with context
- Timeout suggestions in error messages (`index.ts:621`)
- Graceful handling of JSON parse errors
- Errors returned via MCP protocol correctly (`isError: true`)

### 4.2 Concerns

#### 4.2.1 Silent Stream Parse Errors

**Location:** `index.ts:859-861`
```typescript
} catch {
  // Skip invalid JSON lines
}
```

**Issue:** Invalid JSON in streaming responses is silently ignored.

**Recommendation:** Log these errors to stderr for debugging.

#### 4.2.2 No Retry Logic

**Issue:** Network failures result in immediate error with no retry attempts.

**Recommendation:** Consider implementing exponential backoff for transient failures.

---

## 5. Performance Considerations

### 5.1 Strengths

- Parallel query execution for batch searches (`index.ts:1120-1136`)
- Streaming support for long responses
- Efficient timeout handling with AbortController

### 5.2 Concerns

#### 5.2.1 No Response Caching

**Issue:** Repeated identical queries hit the API every time.

**Note:** This may be intentional for real-time search results.

#### 5.2.2 Memory Accumulation in Streaming

**Location:** `index.ts:820`
```typescript
let fullContent = "";
```

**Issue:** Full response accumulated in memory before returning.

**Note:** This is necessary for current MCP response format but limits response size.

---

## 6. Docker Configuration

### 6.1 Strengths

- Multi-stage build reduces image size
- Uses Alpine for minimal footprint
- `--ignore-scripts` in production prevents supply chain attacks
- Caches npm install layer

### 6.2 Concerns

#### 6.2.1 No Health Check

**Location:** `Dockerfile`

**Issue:** No HEALTHCHECK instruction for container orchestration.

**Recommendation:**
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "process.exit(0)" || exit 1
```

#### 6.2.2 Running as Root

**Issue:** Container runs as root user.

**Recommendation:**
```dockerfile
USER node
```

---

## 7. Installer Analysis (Windows)

### 7.1 Strengths

- Creates backups before modifying configs (`ConfigureMcpClients.ps1:49-59`)
- Graceful handling of missing client installations
- Logging to file for troubleshooting
- Clean uninstall support via `RemoveMcpClients.ps1`

### 7.2 Concerns

#### 7.2.1 ErrorActionPreference = "Continue"

**Location:** `ConfigureMcpClients.ps1:13`

**Issue:** Errors don't stop execution, potentially leaving partial configurations.

**Recommendation:** Use `"Stop"` with explicit try-catch for recoverable errors.

#### 7.2.2 No Validation of Config Structure

**Issue:** Assumes JSON structure is valid without schema validation.

**Recommendation:** Validate expected structure before modification.

---

## 8. Testing Coverage

### 8.1 Current State

- **No test files found** in the repository
- No test framework configured in `package.json`

### 8.2 Recommendations

- Add unit tests for formatting functions
- Add integration tests for API handlers
- Add mock tests for MCP protocol compliance
- Consider using Vitest or Jest

---

## 9. Recommendations Summary

### High Priority

| Issue | Location | Recommendation |
|-------|----------|----------------|
| Remove unused dependencies | `package.json` | Move axios, dotenv to devDependencies |
| Version mismatch | `index.ts:1318` | Sync with package.json |
| Add type interfaces | `index.ts` | Replace `any` with proper types |

### Medium Priority

| Issue | Location | Recommendation |
|-------|----------|----------------|
| Code duplication | Multiple | Extract shared helper functions |
| No tests | Repository | Add test framework and tests |
| Docker user | Dockerfile | Run as non-root user |

### Low Priority

| Issue | Location | Recommendation |
|-------|----------|----------------|
| MD5 for GUIDs | `Build-Installer.ps1` | Use SHA256 |
| Silent parse errors | `index.ts:859` | Log to stderr |
| Magic numbers | Various | Define named constants |

---

## 10. Positive Observations

1. **Excellent Documentation**: JSDoc comments are thorough and accurate
2. **Consistent Code Style**: Follows TypeScript best practices
3. **Comprehensive Parameter Support**: Exposes full Perplexity API capabilities
4. **Good Error Messages**: Users get actionable feedback
5. **Clean Exit Behavior**: Proper process exit codes
6. **Multi-Client Installer**: Thoughtful Windows integration

---

## Appendix A: File Summary

| File | Lines | Purpose |
|------|-------|---------|
| `index.ts` | 1619 | Main MCP server implementation |
| `package.json` | 54 | Package configuration |
| `tsconfig.json` | 16 | TypeScript configuration |
| `Dockerfile` | 21 | Container build definition |
| `Build-Installer.ps1` | 324 | Windows MSI build script |
| `ConfigureMcpClients.ps1` | 229 | Client configuration script |

## Appendix B: Dependency Analysis

| Dependency | Version | Usage | Risk |
|------------|---------|-------|------|
| @modelcontextprotocol/sdk | ^1.25.3 | Core MCP functionality | Low |
| axios | ^1.13.2 | **Unused** | N/A |
| dotenv | ^16.3.1 | **Unused** | N/A |
| openspec | ^0.0.0 | Development tool | N/A |

---

*End of Code Audit Report*
