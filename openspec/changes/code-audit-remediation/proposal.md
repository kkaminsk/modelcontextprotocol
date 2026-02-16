## Why

An automated engineering audit ([CodeAudit.md](../../../CodeAudit.md)) identified 16 issues (4 high, 7 medium, 5 low) in the Perplexity MCP Server codebase. High-severity issues include a bogus npm dependency posing supply chain risk, massive code duplication, and zero test coverage. This proposal remediates all immediately actionable findings to improve security, maintainability, and reliability.

## What Changes

- **Fix**: Remove bogus `openspec` dependency and unused `axios`/`dotenv` dependencies (H4, M1)
- **Fix**: Extract shared option-building helper to eliminate duplication (H2)
- **Fix**: Add TypeScript interfaces for API responses, replace `any` types (M3)
- **Fix**: Sync server metadata name/version with package.json (M4)
- **Fix**: Add `NODE_AUTH_TOKEN` to GitHub Actions publish workflow (M5)
- **Fix**: Add message content validation before API calls (M6)
- **Fix**: Extend streaming timeout to cover full stream read (M7)
- **Clean**: Delete `.venv/` directory and orphaned `perplexity-ask/`, update `.gitignore` (M2, L3)
- **Clean**: Remove unnecessary `new URL()` constructions (L2)
- **New**: Add CHANGELOG.md (L5)

## Capabilities

### Modified Capabilities
- `dependency-cleanup`: Removes bogus/unused dependencies and cleans orphaned directories
- `code-quality`: Extracts shared helpers, adds types, fixes metadata, validates inputs
- `repo-hygiene`: Cleans committed artifacts, updates gitignore, adds changelog
- `reliability`: Fixes streaming timeout and improves error handling

## Impact

- **Risk reduction**: Eliminates supply chain risk from bogus dependency, reduces duplication bugs
- **Breaking changes**: None — all changes are internal refactoring
- **Effort**: ~1 hour total
- **Dependencies**: No new dependencies added
