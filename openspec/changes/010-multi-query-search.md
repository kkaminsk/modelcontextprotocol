# OpenSpec Proposal 010: Multi-Query Search

**Priority:** P3 - Low
**Status:** Proposed
**Date:** 2025-12-21
**Affected Tools:** `perplexity_search`

## Summary

Enhance the Search API to support multiple queries per request (up to 5), enabling batch search operations.

## Problem Statement

Current `perplexity_search` only accepts a single query string:

1. Multiple searches require multiple API calls
2. Increased latency for batch operations
3. Higher overhead for related query sets
4. No atomic batch search capability

## Proposed Solution

### Schema Update

```typescript
const SEARCH_TOOL: Tool = {
  name: "perplexity_search",
  description: "Web search with ranked results. Supports single query or batch of up to 5 queries.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        oneOf: [
          { type: "string", description: "Single search query" },
          {
            type: "array",
            items: { type: "string" },
            minItems: 1,
            maxItems: 5,
            description: "Array of up to 5 search queries"
          }
        ],
        description: "Search query or array of queries (max 5)"
      },
      max_results: {
        type: "integer",
        minimum: 1,
        maximum: 10,
        description: "Maximum results per query"
      },
      // ... other existing parameters
    },
    required: ["query"]
  }
};
```

### Implementation

```typescript
interface SearchRequest {
  query: string | string[];
  max_results?: number;
  max_tokens_per_page?: number;
  country?: string;
  search_domain_filter?: string[];
  search_recency_filter?: string;
}

async function performSearch(request: SearchRequest): Promise<SearchResponse[]> {
  const queries = Array.isArray(request.query) ? request.query : [request.query];

  if (queries.length > 5) {
    throw new Error("Maximum 5 queries per request");
  }

  const response = await fetch("https://api.perplexity.ai/search", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      query: queries,
      max_results: request.max_results,
      max_tokens_per_page: request.max_tokens_per_page,
      country: request.country,
      search_domain_filter: request.search_domain_filter,
      search_recency_filter: request.search_recency_filter
    })
  });

  return await response.json();
}
```

### Response Structure

```typescript
interface MultiQuerySearchResponse {
  results: Array<{
    query: string;
    results: Array<{
      title: string;
      url: string;
      content: string;
      published_date?: string;
    }>;
  }>;
}
```

### MCP Response Formatting

```typescript
function formatMultiQueryResults(response: MultiQuerySearchResponse): string {
  return response.results.map((queryResult, i) => {
    const header = `## Query ${i + 1}: "${queryResult.query}"\n`;
    const results = queryResult.results.map((r, j) =>
      `${j + 1}. **${r.title}**\n   ${r.url}\n   ${r.content.substring(0, 200)}...`
    ).join("\n\n");
    return header + results;
  }).join("\n\n---\n\n");
}
```

## Examples

### Single Query (Existing Behavior)
```json
{
  "query": "JavaScript frameworks 2024",
  "max_results": 5
}
```

### Multiple Queries (New)
```json
{
  "query": [
    "React vs Vue comparison",
    "Angular market share 2024",
    "Svelte performance benchmarks"
  ],
  "max_results": 3
}
```

### Comparison Research
```json
{
  "query": [
    "PostgreSQL performance",
    "MySQL performance",
    "MongoDB performance"
  ],
  "max_results": 5,
  "search_recency_filter": "month"
}
```

## Use Cases

| Scenario | Benefit |
|----------|---------|
| Competitor research | Single call for multiple competitors |
| Comparison shopping | Batch price/feature searches |
| Multi-topic research | Parallel information gathering |
| Trend analysis | Multiple related trend queries |

## Validation Rules

1. Maximum 5 queries per request
2. Minimum 1 query required
3. Each query subject to standard query limits
4. `max_results` applies per query

## Performance Considerations

- API may process queries in parallel
- Response time scales with query count
- Consider rate limiting implications
- Total result count = `max_results` x query count

## Backward Compatibility

- Single string query continues to work
- Existing clients unaffected
- Response structure extends cleanly

## Testing

1. Verify single query works unchanged
2. Test 2-5 query batches
3. Verify 6+ queries rejected
4. Test mixed parameter combinations
5. Verify response grouping by query

## Implementation Notes

- Consider whether to expose multi-query as separate tool
- May need response size limits for large batches
- Consider pagination for large result sets

## References

- [Perplexity Search API](https://docs.perplexity.ai/api-reference/search-post)
