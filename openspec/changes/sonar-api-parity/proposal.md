## Why

The existing Sonar API tools (ask, research, reason) are missing several parameters that the Perplexity API now supports: `search_context_size`, `output_level`, `search_language_filter`, `enable_search_classifier`, `disable_search`, `search_type`, and `response_format`. Additionally, the API now returns a `search_results` field with richer metadata that the MCP server ignores.

## What Changes

- **Fix**: Add missing Sonar API parameters to ask, research, and reason tool definitions
- **Fix**: Wire new parameters through `buildCommonOptions` and `buildChatBody`
- **Fix**: Parse and include `search_results` field in API responses

## Capabilities

### Modified Capabilities
- `sonar-params`: All Sonar API parameters are now exposed and passed through
- `search-results-parsing`: Rich search result metadata (title, url, date) included in responses

## Impact

- **Risk**: Low — additive parameters, backward compatible
- **Breaking changes**: None — all new params are optional
- **Effort**: ~1 hour
