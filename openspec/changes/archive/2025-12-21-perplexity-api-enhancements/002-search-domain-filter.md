# OpenSpec Proposal 002: Search Domain Filter

**Priority:** P0 - Critical
**Status:** Completed
**Date:** 2025-12-21
**Affected Tools:** `perplexity_ask`, `perplexity_research`, `perplexity_reason`, `perplexity_search`

## Summary

Add `search_domain_filter` parameter to all tools to allow filtering search results to specific domains (allowlist) or excluding specific domains (denylist).

## Problem Statement

Users cannot control which domains are included or excluded from search results. This limits:

1. Research focused on authoritative sources (e.g., `.gov`, `.edu` sites)
2. Excluding unreliable or irrelevant domains
3. Limiting searches to company-specific documentation
4. Compliance with organizational content policies

## Proposed Solution

### Schema Update (All Tools)

```typescript
search_domain_filter: {
  type: "array",
  items: { type: "string" },
  maxItems: 20,
  description: "Domain filter list. Prefix with '-' to exclude (denylist), otherwise include (allowlist). Maximum 20 domains. Examples: ['wikipedia.org', 'github.com'] for allowlist, ['-reddit.com', '-twitter.com'] for denylist."
}
```

### Implementation

```typescript
function buildSearchDomainFilter(domains?: string[]): string[] | undefined {
  if (!domains || domains.length === 0) return undefined;
  if (domains.length > 20) {
    throw new Error("search_domain_filter cannot exceed 20 domains");
  }
  return domains;
}

// In API request body
if (searchDomainFilter) {
  body.search_domain_filter = searchDomainFilter;
}
```

## Examples

### Allowlist - Only search specific domains
```json
{
  "messages": [{"role": "user", "content": "Latest React documentation"}],
  "search_domain_filter": ["reactjs.org", "github.com/facebook/react"]
}
```

### Denylist - Exclude specific domains
```json
{
  "messages": [{"role": "user", "content": "JavaScript best practices"}],
  "search_domain_filter": ["-w3schools.com", "-medium.com"]
}
```

### Academic research
```json
{
  "messages": [{"role": "user", "content": "Climate change research"}],
  "search_domain_filter": ["nature.com", "science.org", ".edu", ".gov"]
}
```

## Validation Rules

1. Maximum 20 domains per request
2. Domains must be valid domain patterns
3. Cannot mix allowlist and denylist in same request
4. Empty array treated as no filter

## Backward Compatibility

- Parameter is optional
- Existing tool calls without `search_domain_filter` continue to work unchanged
- No impact on default behavior

## Testing

1. Verify allowlist restricts results to specified domains
2. Verify denylist excludes specified domains
3. Test maximum 20 domain limit
4. Test invalid domain patterns
5. Test empty array behavior

## References

- [Perplexity API Docs - Search Domain Filter](https://docs.perplexity.ai/api-reference/chat-completions-post)
