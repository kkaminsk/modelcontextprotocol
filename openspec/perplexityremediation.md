# Perplexity MCP Server - API Remediation Report

**Date:** 2025-12-21
**Current Version:** 0.2.2
**API Reference:** [docs.perplexity.ai](https://docs.perplexity.ai/)

## Executive Summary

The current MCP server implementation covers basic functionality but is missing significant API capabilities. This document identifies gaps between the implemented tools and the full Perplexity API feature set.

---

## 1. Missing Models

| Model | Status | Notes |
|-------|--------|-------|
| `sonar` | **NOT IMPLEMENTED** | Base lightweight model, faster and cheaper than sonar-pro |
| `sonar-reasoning` | **NOT IMPLEMENTED** | Basic reasoning model (cheaper than sonar-reasoning-pro) |
| `sonar-pro` | Implemented | Used by `perplexity_ask` |
| `sonar-reasoning-pro` | Implemented | Used by `perplexity_reason` |
| `sonar-deep-research` | Implemented | Used by `perplexity_research` |
| `r1-1776` | **NOT IMPLEMENTED** | Alternative reasoning model |

**Recommendation:** Add `perplexity_ask_fast` tool using `sonar` model for cost-effective queries, and expose model selection as a parameter.

---

## 2. Chat Completions API - Missing Parameters

### 2.1 Core Parameters (High Priority)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `temperature` | number | 0.2 | Controls randomness (0-2) |
| `top_p` | number | 0.9 | Nucleus sampling threshold |
| `top_k` | number | 0 | Top-k filtering |
| `max_tokens` | integer | - | Maximum completion tokens |
| `stream` | boolean | false | Enable streaming responses |

**Impact:** Users cannot control response creativity, length, or enable streaming.

### 2.2 Search Control Parameters (High Priority)

| Parameter | Type | Description |
|-----------|------|-------------|
| `search_mode` | enum | `academic`, `sec`, `web` - filters source types |
| `disable_search` | boolean | Disable web search entirely |
| `enable_search_classifier` | boolean | Auto-determine if search needed |
| `search_domain_filter` | string[] | Allowlist/denylist domains (max 20) |
| `search_recency_filter` | string | Filter by time: day/week/month/year |
| `search_after_date_filter` | string | Only results after date (%m/%d/%Y) |
| `search_before_date_filter` | string | Only results before date |
| `last_updated_after_filter` | string | Filter by last update date |
| `last_updated_before_filter` | string | Filter by last update date |

**Impact:** No ability to filter by academic sources, SEC filings, specific domains, or date ranges.

### 2.3 Advanced Search Options (Medium Priority)

| Parameter | Type | Description |
|-----------|------|-------------|
| `web_search_options.search_context_size` | enum | `low`, `medium`, `high` - controls search depth |
| `web_search_options.user_location` | object | Geographic context for localized results |

### 2.4 Output Enhancement Parameters (Medium Priority)

| Parameter | Type | Description |
|-----------|------|-------------|
| `return_images` | boolean | Include image search results |
| `return_related_questions` | boolean | Return related query suggestions |
| `media_response` | object | Configure video/image returns |
| `response_format` | object | Enable structured JSON output |
| `language_preference` | string | Preferred response language |

### 2.5 Model-Specific Parameters (Medium Priority)

| Parameter | Type | Applicable Models | Description |
|-----------|------|-------------------|-------------|
| `reasoning_effort` | enum | sonar-deep-research | `low`, `medium`, `high` - controls research depth |

**Impact:** Deep research always runs at default effort level.

### 2.6 Fine-Tuning Parameters (Low Priority)

| Parameter | Type | Description |
|-----------|------|-------------|
| `presence_penalty` | number | Encourages new topics (default: 0) |
| `frequency_penalty` | number | Reduces repetition (default: 0) |

---

## 3. Search API - Missing Parameters

Current implementation only exposes: `query`, `max_results`, `max_tokens_per_page`, `country`

### Missing Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| Multi-query | string[] | - | Submit up to 5 queries per request |
| `max_tokens` | integer | 25000 | Total tokens across all results (1-1M) |
| `search_domain_filter` | string[] | - | Limit to specific domains (max 20) |
| `search_recency_filter` | enum | - | day/week/month/year |
| `search_after_date` | string | - | Filter by publish date |
| `search_before_date` | string | - | Filter by publish date |

---

## 4. Missing API Endpoints

### 4.1 Async Chat Completions (High Priority)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/async/chat/completions` | POST | Create async job for long-running requests |
| `/async/chat/completions` | GET | List all async jobs |
| `/async/chat/completions/{request_id}` | GET | Get job status/results |

**Impact:** Deep research requests can timeout. Async API enables:
- Non-blocking long research queries
- Job status polling
- Better handling of sonar-deep-research model

**Recommendation:** Add `perplexity_research_async` tool with job management.

### 4.2 Authentication Endpoints (Low Priority)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/generate_auth_token` | POST | Generate auth tokens |
| `/revoke_auth_token` | POST | Revoke auth tokens |

---

## 5. Implementation Gaps

### 5.1 Streaming Support
- Current: All responses are synchronous
- API supports: `stream: true` for incremental responses
- **Impact:** Large responses block until complete

### 5.2 Error Handling Improvements
- Current: Basic timeout and HTTP error handling
- Missing: Retry logic with exponential backoff
- Missing: Rate limit handling (429 responses)

### 5.3 Response Metadata
- Current: Only returns content and citations
- Missing: Token usage statistics
- Missing: Search result metadata (titles, URLs, dates)
- Missing: Related questions

---

## 6. Remediation Priority Matrix

### P0 - Critical (Blocks key use cases)
1. Add `reasoning_effort` parameter to research tool
2. Add `search_domain_filter` to all tools
3. Implement async API for deep research

### P1 - High (Significant capability gaps)
4. Add `search_mode` parameter (academic/sec/web)
5. Add `temperature` and `max_tokens` parameters
6. Add date filtering parameters
7. Add `sonar` model option for cost-effective queries

### P2 - Medium (Enhanced functionality)
8. Add streaming support
9. Add `return_images` and `return_related_questions`
10. Add `web_search_options` for search context control
11. Add `response_format` for structured JSON output

### P3 - Low (Nice to have)
12. Add presence/frequency penalty parameters
13. Add auth token management tools
14. Add multi-query search support

---

## 7. Proposed Tool Schema Updates

### perplexity_ask (Enhanced)
```typescript
{
  messages: Message[],        // existing
  model?: "sonar" | "sonar-pro",  // NEW: model selection
  temperature?: number,       // NEW
  max_tokens?: number,        // NEW
  search_mode?: "academic" | "sec" | "web",  // NEW
  search_domain_filter?: string[],  // NEW
  search_recency_filter?: "day" | "week" | "month" | "year",  // NEW
  return_related_questions?: boolean  // NEW
}
```

### perplexity_research (Enhanced)
```typescript
{
  messages: Message[],        // existing
  reasoning_effort?: "low" | "medium" | "high",  // NEW: critical
  async?: boolean,            // NEW: use async API
  search_domain_filter?: string[],  // NEW
  return_images?: boolean     // NEW
}
```

### perplexity_search (Enhanced)
```typescript
{
  query: string | string[],   // ENHANCED: multi-query
  max_results?: number,       // existing
  max_tokens_per_page?: number,  // existing
  max_tokens?: number,        // NEW: total tokens limit
  country?: string,           // existing
  search_domain_filter?: string[],  // NEW
  search_recency_filter?: string,   // NEW
  search_after_date?: string,       // NEW
  search_before_date?: string       // NEW
}
```

---

## 8. References

- [Perplexity API Docs](https://docs.perplexity.ai/)
- [Chat Completions API](https://docs.perplexity.ai/api-reference/chat-completions-post)
- [Search API](https://docs.perplexity.ai/api-reference/search-post)
- [Async API](https://docs.perplexity.ai/api-reference/async-chat-completions-post)
- [Model Cards](https://docs.perplexity.ai/getting-started/models)
