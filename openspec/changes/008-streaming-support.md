# OpenSpec Proposal 008: Streaming Response Support

**Priority:** P2 - Medium
**Status:** Proposed
**Date:** 2025-12-21
**Affected Tools:** `perplexity_ask`, `perplexity_reason`

## Summary

Add streaming support to enable incremental response delivery for improved user experience with long responses.

## Problem Statement

Current synchronous implementation requires waiting for complete responses:

1. Long responses block until fully generated
2. No progress indication during generation
3. Poor user experience for complex queries
4. Higher perceived latency

## Proposed Solution

### Schema Update

```typescript
stream: {
  type: "boolean",
  default: false,
  description: "Enable streaming responses. When true, response is delivered incrementally."
}
```

### Implementation

```typescript
async function performStreamingChatCompletion(
  messages: Message[],
  model: string,
  onChunk: (chunk: string) => void
): Promise<void> {
  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true
    })
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const data = line.slice(6);
        if (data === "[DONE]") return;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onChunk(content);
        } catch {
          // Skip invalid JSON
        }
      }
    }
  }
}
```

### MCP Streaming Integration

MCP supports streaming via progress notifications:

```typescript
server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
  if (request.params.name === "perplexity_ask" && request.params.arguments?.stream) {
    let fullContent = "";

    await performStreamingChatCompletion(
      request.params.arguments.messages,
      "sonar-pro",
      (chunk) => {
        fullContent += chunk;
        // Send progress notification
        extra.sendNotification?.({
          method: "notifications/progress",
          params: {
            progressToken: request.params._meta?.progressToken,
            progress: fullContent.length,
            message: chunk
          }
        });
      }
    );

    return {
      content: [{ type: "text", text: fullContent }]
    };
  }
});
```

## Stream Response Format

Server-Sent Events (SSE) format:

```
data: {"id":"...","choices":[{"delta":{"content":"Hello"}}]}

data: {"id":"...","choices":[{"delta":{"content":" world"}}]}

data: [DONE]
```

## Client Handling

Clients must handle streaming responses:

1. Open SSE connection
2. Process chunks as they arrive
3. Accumulate for final response
4. Handle `[DONE]` signal

## Limitations

- Not supported for `perplexity_research` (use async API instead)
- Citations only available after stream completes
- Requires client-side stream handling
- `perplexity_search` does not support streaming

## Examples

### Enable Streaming
```json
{
  "messages": [{"role": "user", "content": "Explain the history of computing"}],
  "stream": true
}
```

### Non-Streaming (Default)
```json
{
  "messages": [{"role": "user", "content": "What is 2+2?"}]
}
```

## Backward Compatibility

- Default `stream: false` preserves current behavior
- Existing tool calls unchanged
- Streaming is opt-in

## Testing

1. Verify streaming produces same content as non-streaming
2. Test chunk delivery timing
3. Verify `[DONE]` signal handling
4. Test error handling during stream
5. Verify MCP progress notifications work

## References

- [Perplexity API - Streaming](https://docs.perplexity.ai/api-reference/chat-completions-post)
- [Server-Sent Events](https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events)
