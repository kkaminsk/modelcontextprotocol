# OpenSpec Proposal 004: Search Mode Parameter

**Priority:** P1 - High
**Status:** Completed
**Date:** 2025-12-21
**Affected Tools:** `perplexity_ask`, `perplexity_research`, `perplexity_reason`

## Summary

Add `search_mode` parameter to control the type of sources used in search results, enabling focused searches on academic papers, SEC filings, or general web content.

## Problem Statement

All searches currently use general web results. Users cannot:

1. Focus on peer-reviewed academic sources for research
2. Search SEC filings for financial/regulatory information
3. Explicitly request only web content (excluding specialized sources)

## Proposed Solution

### Schema Update

```typescript
search_mode: {
  type: "string",
  enum: ["web", "academic", "sec"],
  description: "Source type filter: 'web' for general internet (default), 'academic' for scholarly articles and papers, 'sec' for SEC filings and financial documents"
}
```

### Implementation

```typescript
// In API request body construction
if (searchMode) {
  body.search_mode = searchMode;
}
```

## Search Modes

| Mode | Sources | Use Cases |
|------|---------|-----------|
| `web` | General internet (default) | News, documentation, blogs, forums |
| `academic` | Scholarly articles, research papers, journals | Scientific research, literature reviews |
| `sec` | SEC filings, financial documents | Financial analysis, regulatory compliance |

## Examples

### Academic Research
```json
{
  "messages": [{"role": "user", "content": "Recent studies on mRNA vaccine efficacy"}],
  "search_mode": "academic"
}
```

### SEC Filings
```json
{
  "messages": [{"role": "user", "content": "Apple Inc 10-K filing 2024"}],
  "search_mode": "sec"
}
```

### Explicit Web Search
```json
{
  "messages": [{"role": "user", "content": "Best practices for React hooks"}],
  "search_mode": "web"
}
```

## Tool-Specific Behavior

| Tool | Default Mode | Notes |
|------|--------------|-------|
| `perplexity_ask` | `web` | General queries benefit from broad web search |
| `perplexity_research` | `web` | Can override to `academic` for scholarly research |
| `perplexity_reason` | `web` | Reasoning benefits from diverse sources |

## Backward Compatibility

- Parameter is optional
- Default behavior (`web`) is unchanged
- Existing tool calls continue to work

## Validation

- Invalid enum values should return descriptive error
- Parameter is case-sensitive

## Testing

1. Verify `academic` mode returns scholarly sources
2. Verify `sec` mode returns SEC filings
3. Verify `web` mode (or omitted) returns general results
4. Test invalid enum values
5. Verify citations reflect source type

## References

- [Perplexity API - Search Mode](https://docs.perplexity.ai/api-reference/chat-completions-post)
