# Change: Refactor Code Duplication

## Why

The code audit identified significant code duplication that impacts maintainability:
1. Option parsing logic repeated in 4 tool handlers (~100 lines duplicated)
2. Fetch/timeout/error handling pattern repeated in 5 API functions (~20 lines each)
3. Silent stream parse errors lack debugging visibility
4. Changes to common patterns require updates in multiple locations

## What Changes

- Extract shared `buildOptionsFromArgs()` helper for option parsing
- Extract shared `fetchWithTimeout()` wrapper for API calls with timeout handling
- Add debug logging for stream parse errors (to stderr)
- Reduce total codebase size by ~150 lines through consolidation

## Impact

- Affected specs: shared-utilities (new)
- Affected code: `index.ts:1356-1527` (tool handlers), `index.ts:603-624`, `index.ts:777-798`, `index.ts:1024-1045`, `index.ts:1176-1197`, `index.ts:1243-1262` (API functions)
- **No breaking changes** - internal refactoring only
- Easier maintenance when modifying common patterns
- Single point of change for timeout/error handling behavior
