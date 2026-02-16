# Code Audit Report: Perplexity MCP Server

**Date:** 2026-02-15  
**Auditor:** BHG-Bot (automated engineering review)  
**Scope:** `C:\Temp\GitHub\modelcontextprotocol\` — full codebase

---

## Summary

The Perplexity MCP Server is a functional MCP server providing Perplexity API capabilities (search, ask, research, reasoning) over stdio transport. The implementation works but suffers from significant structural issues: a 1,600-line monolithic single file with massive code duplication, zero test coverage, unused dependencies, and several TypeScript anti-patterns. The project is **functional but needs refactoring for maintainability**.

| Severity | Count |
|----------|-------|
| 🔴 High | 4 |
| 🟡 Medium | 7 |
| 🟢 Low | 5 |

---

## 🔴 High Severity

### H1: Monolithic single-file architecture (1,600+ lines)

**File:** `index.ts`  
**Issue:** The entire server — tool definitions, API clients, request handlers, streaming logic, formatting — lives in a single 1,600+ line file. This makes the code extremely difficult to maintain, test, and review.  
**Impact:** Poor maintainability, impossible to unit test individual components, high merge conflict risk.  
**Recommendation:** Split into modules:
- `tools/` — tool schema definitions
- `api/` — Perplexity API client functions
- `formatters/` — response formatting
- `server.ts` — MCP server setup and routing

### H2: Massive code duplication in option building

**File:** `index.ts` (CallToolRequestSchema handler, lines ~1380-1600)  
**Issue:** The option extraction logic (temperature, max_tokens, top_p, top_k, search_mode, date filters, domain filters) is copy-pasted identically for `perplexity_ask`, `perplexity_research`, and `perplexity_reason`. Similarly, `performChatCompletion` and `performStreamingChatCompletion` duplicate all validation and body-building logic.  
**Impact:** Any bug fix or new parameter must be applied 3-4 times. High risk of drift between implementations.  
**Recommendation:** Extract a shared `buildRequestOptions(args)` helper and a shared `buildRequestBody(options)` function.

### H3: Zero test coverage

**Issue:** No test files, no test framework, no test script in package.json. A server handling API keys and making external API calls has no automated tests whatsoever.  
**Impact:** Regressions go undetected; refactoring is risky.  
**Recommendation:** Add vitest or jest, write unit tests for option building, response formatting, error handling, and tool routing.

### H4: Bogus `openspec` dependency

**File:** `package.json`  
**Issue:** `"openspec": "^0.0.0"` is listed as a production dependency. This is a placeholder/non-functional package that adds unnecessary install weight and potential supply chain risk.  
**Impact:** Supply chain risk — a malicious actor could claim this package name/version on npm.  
**Recommendation:** Remove from dependencies.

---

## 🟡 Medium Severity

### M1: Unused dependencies (`axios`, `dotenv`)

**File:** `package.json`  
**Issue:** `axios` (^1.6.2) and `dotenv` (^16.3.1) are declared as production dependencies but never imported or used in `index.ts`. The code uses native `fetch` and `process.env` directly.  
**Impact:** Bloated install size, misleading dependency list, potential vulnerabilities in unused code.  
**Recommendation:** Remove both from dependencies.

### M2: `.venv/` Python virtual environment committed to repo

**Issue:** A Python virtual environment directory (`.venv/`) with full pip/setuptools packages is present in the repository. This is a Node.js/TypeScript project — the `.venv/` is irrelevant and adds thousands of unnecessary files.  
**Impact:** Bloated repo size, confusing project structure, potential inclusion in Docker builds.  
**Recommendation:** Delete `.venv/`, add `.venv/` to `.gitignore`.

### M3: `any` types used in formatting functions

**File:** `index.ts` — `formatSearchResults()`, `formatMultiQueryResults()`, `performSingleSearch()`  
**Issue:** Multiple functions use `any` type for API response data, bypassing TypeScript's type safety.  
**Impact:** Runtime errors from unexpected API response shapes go undetected at compile time.  
**Recommendation:** Define interfaces for Perplexity API responses (`PerplexitySearchResponse`, `PerplexityChatResponse`, etc.).

### M4: Server metadata version mismatch

**File:** `index.ts` (Server constructor)  
**Issue:** Server is initialized with `name: "example-servers/perplexity-ask"` and `version: "0.1.0"`, but `package.json` declares version `0.2.2` and name `@perplexity-ai/mcp-server`.  
**Impact:** Misleading server identification in MCP clients; version tracking is broken.  
**Recommendation:** Read name/version from `package.json` or at minimum keep them in sync.

### M5: GitHub Actions workflow missing `NODE_AUTH_TOKEN`

**File:** `.github/workflows/publish.yml`  
**Issue:** The `npm publish` step does not set `NODE_AUTH_TOKEN` environment variable. Without this, publishing to npm will fail with authentication errors.  
**Impact:** CI/CD pipeline is non-functional for publishing.  
**Recommendation:** Add `env: NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` to the publish step.

### M6: No input validation on message array contents

**File:** `index.ts` (CallToolRequestSchema handler)  
**Issue:** While the handler checks `Array.isArray(args.messages)`, it does not validate that each message has valid `role` and `content` string properties before passing to the API.  
**Impact:** Malformed messages are sent directly to the Perplexity API, resulting in opaque 400 errors.  
**Recommendation:** Validate message structure before API call.

### M7: Streaming timeout only covers initial connection

**File:** `index.ts` — `performStreamingChatCompletion()`  
**Issue:** The `AbortController` timeout is cleared after the initial `fetch` response. If the stream stalls during reading, there's no timeout — the process hangs indefinitely.  
**Impact:** Server can hang on stalled streams, consuming resources.  
**Recommendation:** Keep the abort controller active during stream reading, or implement a per-chunk timeout.

---

## 🟢 Low Severity

### L1: `tsconfig.json` rootDir includes everything

**File:** `tsconfig.json`  
**Issue:** `rootDir: "."` and `include: ["./**/*.ts"]` means TypeScript will attempt to compile any `.ts` files in `.venv/`, `openspec/`, etc. The `outDir` structure will mirror the full directory tree.  
**Impact:** Unexpected compilation behavior; `dist/` structure includes unnecessary nesting.  
**Recommendation:** Set `rootDir: "."` → `rootDir: "src"` and move `index.ts` into a `src/` directory. Add `exclude` for non-source directories.

### L2: Unnecessary `new URL()` for static strings

**File:** `index.ts` — all API functions  
**Issue:** `new URL("https://api.perplexity.ai/chat/completions")` is used then immediately `.toString()`'d. Since the URLs are static strings, this is unnecessary overhead.  
**Recommendation:** Use string literals directly.

### L3: `perplexity-ask/` directory contains only a stale `package.json`

**Issue:** An orphaned `perplexity-ask/` directory exists with its own `package.json`. Appears to be a leftover from an earlier project structure.  
**Recommendation:** Delete or document its purpose.

### L4: Duplicate installation documentation

**Issue:** `install.md` (200+ lines) duplicates most of the setup content already in `README.md`.  
**Recommendation:** Consolidate into README or link from README to install.md.

### L5: No CHANGELOG or version history

**Issue:** No CHANGELOG.md tracking version changes, despite being at v0.2.2.  
**Recommendation:** Add CHANGELOG.md following Keep a Changelog format.

---

## Security Assessment

| Area | Rating | Notes |
|------|--------|-------|
| API Key handling | ✅ Good | Env var only, validated on startup, Bearer auth |
| Input validation | ⚠️ Weak | Schema defined but message contents not validated server-side |
| Dependency hygiene | ⚠️ Poor | Unused deps (axios, dotenv), bogus dep (openspec), no audit |
| Supply chain | ⚠️ Risk | `openspec@0.0.0` could be hijacked on npm |
| Error handling | ✅ Good | Consistent try/catch, errors returned via MCP protocol |
| Secrets in repo | ✅ Clean | No hardcoded secrets found |

---

## Recommendations Summary

| # | Action | Severity | Effort |
|---|--------|----------|--------|
| H1 | Split monolith into modules | High | 2 hrs |
| H2 | Extract shared option-building helpers | High | 30 min |
| H3 | Add test framework and basic tests | High | 2 hrs |
| H4 | Remove bogus `openspec` dependency | High | 1 min |
| M1 | Remove unused `axios` and `dotenv` deps | Medium | 1 min |
| M2 | Delete `.venv/`, update `.gitignore` | Medium | 2 min |
| M3 | Add TypeScript interfaces for API responses | Medium | 30 min |
| M4 | Fix server name/version metadata | Medium | 5 min |
| M5 | Fix GitHub Actions publish workflow | Medium | 5 min |
| M6 | Add message array validation | Medium | 15 min |
| M7 | Fix streaming timeout coverage | Medium | 15 min |
| L1 | Fix tsconfig rootDir and add src/ | Low | 15 min |
| L2 | Remove unnecessary URL object construction | Low | 5 min |
| L3 | Remove orphaned `perplexity-ask/` directory | Low | 1 min |
| L4 | Consolidate installation docs | Low | 10 min |
| L5 | Add CHANGELOG.md | Low | 10 min |
