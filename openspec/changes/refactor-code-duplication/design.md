## Context

The MCP server implementation contains significant code duplication identified in the code audit:
- Fetch/timeout/error handling is repeated in 5 functions
- Option parsing is repeated in 4 tool handlers
- This duplication makes maintenance error-prone

## Goals / Non-Goals

**Goals:**
- Reduce code duplication by extracting shared utilities
- Maintain exact same external behavior (no breaking changes)
- Improve maintainability for future changes
- Add visibility into stream parsing errors

**Non-Goals:**
- Modularizing into separate files (keep single-file architecture for now)
- Adding retry logic (separate proposal if desired)
- Changing the public API or tool schemas

## Decisions

### Decision 1: Fetch Wrapper Function
Create `fetchWithTimeout()` to consolidate:
- AbortController setup
- Timeout handling
- Network error wrapping
- Authorization header injection

**Signature:**
```typescript
async function fetchWithTimeout(
  url: string,
  options: RequestInit,
  apiName: string = "Perplexity API"
): Promise<Response>
```

**Rationale:** Single function eliminates 5x code duplication while maintaining identical error messages.

### Decision 2: Option Builder Function
Create `buildCommonOptions()` to consolidate parameter extraction:

**Signature:**
```typescript
function buildCommonOptions(args: Record<string, unknown>): {
  search_domain_filter?: string[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  top_k?: number;
  search_mode?: string;
  search_recency_filter?: string;
  search_after_date?: string;
  search_before_date?: string;
  last_updated_after?: string;
  last_updated_before?: string;
  return_images?: boolean;
  return_related_questions?: boolean;
}
```

**Rationale:** All tools share the same parameter set, validation logic can be centralized.

### Decision 3: Keep Functions in Same File
Do not split into separate module files.

**Rationale:**
- Single-file architecture is simpler for MCP servers
- Modularization is a larger change that can be done later if needed
- Current focus is reducing duplication, not restructuring

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Regression in error messages | Test all error paths manually |
| Subtle behavior changes | Keep exact same validation logic |
| Breaking streaming responses | Test streaming with actual API |

## Open Questions

None - this is a straightforward internal refactoring.
