# OpenSpec Proposal 003: Async Research API

**Priority:** P0 - Critical
**Status:** Completed
**Date:** 2025-12-21
**Affected Tools:** New tool `perplexity_research_async`, `perplexity_research_status`

## Summary

Implement async API support for deep research queries to handle long-running requests without timeout issues.

## Problem Statement

The current synchronous implementation has significant limitations:

1. Deep research requests can exceed the 5-minute default timeout
2. Long-running requests block the MCP connection
3. No way to monitor progress of ongoing research
4. Failed requests require complete restart with no recovery

## Proposed Solution

### New Tools

#### 1. perplexity_research_async

Start an async research job and return a request ID for polling.

```typescript
const ASYNC_RESEARCH_TOOL: Tool = {
  name: "perplexity_research_async",
  description: "Start an async deep research job. Returns a request_id to poll for results. Use for complex research that may take several minutes.",
  inputSchema: {
    type: "object",
    properties: {
      messages: {
        type: "array",
        items: {
          type: "object",
          properties: {
            role: { type: "string", enum: ["system", "user", "assistant"] },
            content: { type: "string" }
          },
          required: ["role", "content"]
        },
        description: "Array of conversation messages"
      },
      reasoning_effort: {
        type: "string",
        enum: ["low", "medium", "high"],
        description: "Controls research depth"
      },
      search_domain_filter: {
        type: "array",
        items: { type: "string" },
        maxItems: 20,
        description: "Domain filter list"
      }
    },
    required: ["messages"]
  }
};
```

#### 2. perplexity_research_status

Poll for async job status and retrieve results.

```typescript
const RESEARCH_STATUS_TOOL: Tool = {
  name: "perplexity_research_status",
  description: "Check status of an async research job and retrieve results when complete.",
  inputSchema: {
    type: "object",
    properties: {
      request_id: {
        type: "string",
        description: "The request_id returned from perplexity_research_async"
      }
    },
    required: ["request_id"]
  }
};
```

### API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/async/chat/completions` | POST | Create async job |
| `/async/chat/completions/{request_id}` | GET | Get job status/results |

### Implementation

```typescript
async function startAsyncResearch(
  messages: Message[],
  options?: AsyncResearchOptions
): Promise<{ request_id: string; status: string }> {
  const response = await fetch("https://api.perplexity.ai/async/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "sonar-deep-research",
      messages,
      ...options
    })
  });

  const data = await response.json();
  return {
    request_id: data.request_id,
    status: data.status
  };
}

async function getAsyncResearchStatus(
  requestId: string
): Promise<AsyncResearchResult> {
  const response = await fetch(
    `https://api.perplexity.ai/async/chat/completions/${requestId}`,
    {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`
      }
    }
  );

  return await response.json();
}
```

### Response Types

```typescript
interface AsyncResearchResult {
  request_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  created_at: string;
  completed_at?: string;
  result?: {
    choices: Array<{
      message: { role: string; content: string };
    }>;
    citations?: string[];
  };
  error?: string;
}
```

## Workflow

1. User calls `perplexity_research_async` with research query
2. Tool returns `request_id` and initial status
3. User/agent polls `perplexity_research_status` with `request_id`
4. When status is `completed`, results are returned
5. If status is `failed`, error message is returned

## Example Usage

```typescript
// Start async research
const { request_id } = await perplexity_research_async({
  messages: [{ role: "user", content: "Comprehensive analysis of quantum computing trends 2024-2025" }],
  reasoning_effort: "high"
});

// Poll for results
let result;
do {
  await sleep(5000); // Wait 5 seconds between polls
  result = await perplexity_research_status({ request_id });
} while (result.status === "pending" || result.status === "processing");

// Handle result
if (result.status === "completed") {
  return result.result;
} else {
  throw new Error(result.error);
}
```

## Backward Compatibility

- Existing `perplexity_research` tool remains unchanged
- New tools are additive
- Users can choose sync or async based on expected research complexity

## Testing

1. Verify async job creation returns valid request_id
2. Test polling returns correct status progression
3. Verify completed jobs return full results
4. Test failed job error handling
5. Test timeout behavior on status polling
6. Verify citations are included in async results

## References

- [Perplexity Async API](https://docs.perplexity.ai/api-reference/async-chat-completions-post)
- [Async Job Status](https://docs.perplexity.ai/api-reference/async-chat-completions-get)
