## Why

The Perplexity Search API supports `search_language_filter` and `user_location` parameters that are not exposed in the `perplexity_search` tool.

## What Changes

- **Fix**: Add `search_language_filter` parameter to search tool
- **Fix**: Add `user_location` parameter to search tool
- **Fix**: Wire through to `performSingleSearch` API calls

## Capabilities

### Modified Capabilities
- `search-params`: Full Search API parameter parity including language filter and user location

## Impact

- **Risk**: Low — additive optional parameters
- **Breaking changes**: None
- **Effort**: ~30 minutes
