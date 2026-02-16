## Why

The Perplexity MCP Server has zero test coverage. The code audit flagged this as a critical gap — any refactoring or feature addition risks silent regressions. The modular architecture refactor (separate proposal) enables proper unit testing.

## What Changes

- **New**: Install vitest as dev dependency
- **New**: Add `vitest.config.ts` configuration
- **New**: Add test scripts to `package.json` (`test`, `test:watch`)
- **New**: Create `src/__tests__/` with comprehensive test suites:
  - `validation.test.ts` — 26 tests for validateMessages and buildCommonOptions
  - `api-client.test.ts` — 20 tests for buildChatBody, appendExtras, formatSearchResults, formatMultiQueryResults
  - `config.test.ts` — 2 tests for configuration loading
  - `tools.test.ts` — 19 tests for all tool handlers with mocked fetch

## Capabilities

### New Capabilities
- `test-coverage`: Comprehensive unit test suite covering validation, API client, config, and all tool handlers

## Impact

- **Risk reduction**: 67 tests covering validation, formatting, error handling, and all tool handlers
- **Breaking changes**: None
- **Effort**: ~30 minutes
- **Dependencies**: vitest (dev dependency)
