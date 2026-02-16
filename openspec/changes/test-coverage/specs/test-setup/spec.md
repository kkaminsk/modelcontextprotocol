# Test Coverage Setup

## Overview

Comprehensive unit test suite using vitest covering all business logic.

## Test Strategy

- **Unit tests only** — no integration tests requiring real API keys
- **Mocked fetch** — all API calls mocked via `vi.stubGlobal('fetch', mockFetch)`
- **Pure function testing** — validation, formatting, and body-building functions tested directly
- **Handler testing** — each tool handler tested for input validation, success paths, and error handling

## Coverage Areas

| Area | Tests | What's Covered |
|------|-------|----------------|
| validateMessages | 9 | Valid/invalid inputs, edge cases (null, non-object, wrong types) |
| buildCommonOptions | 17 | All option types, invalid values, combined options |
| buildChatBody | 10 | Basic body, stream flag, validation errors, all optional fields |
| appendExtras | 5 | Citations, images, related questions, empty arrays, combined |
| formatSearchResults | 2 | No results, full results with all fields |
| formatMultiQueryResults | 2 | Multiple queries, error handling |
| Tool handlers | 19 | Input validation, model selection, API mocking, error paths |
| Config | 2 | Default timeout, env override |
