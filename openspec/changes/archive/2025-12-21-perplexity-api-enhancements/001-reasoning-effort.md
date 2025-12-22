# OpenSpec Proposal 001: Reasoning Effort Parameter

**Priority:** P0 - Critical
**Status:** Completed
**Date:** 2025-12-21
**Affected Tools:** `perplexity_research`

## Summary

Add `reasoning_effort` parameter to the `perplexity_research` tool to control the depth of research performed by the `sonar-deep-research` model.

## Problem Statement

The current implementation of `perplexity_research` uses the `sonar-deep-research` model with no ability to control research depth. This results in:

1. All research queries running at the default effort level regardless of complexity
2. Unnecessarily long processing times for simple research queries
3. Higher API costs when deep research is not required
4. No way to request more thorough research for complex topics

## Proposed Solution

### Schema Update

```typescript
const RESEARCH_TOOL: Tool = {
  name: "perplexity_research",
  description: "Deep comprehensive research on complex topics using Perplexity's sonar-deep-research model.",
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
        description: "Controls research depth: 'low' for quick overviews, 'medium' for balanced research (default), 'high' for comprehensive deep research"
      }
    },
    required: ["messages"]
  }
};
```

### API Request Update

```typescript
async function performResearchCompletion(
  messages: Message[],
  reasoningEffort?: "low" | "medium" | "high"
): Promise<ChatCompletionResponse> {
  const body: Record<string, unknown> = {
    model: "sonar-deep-research",
    messages
  };

  if (reasoningEffort) {
    body.reasoning_effort = reasoningEffort;
  }

  // ... rest of implementation
}
```

## Behavior

| Effort Level | Expected Behavior |
|--------------|-------------------|
| `low` | Quick research, fewer sources consulted, faster response |
| `medium` | Balanced research depth (default if not specified) |
| `high` | Comprehensive research, maximum sources, detailed analysis |

## Backward Compatibility

- Parameter is optional with no default specified
- Existing tool calls without `reasoning_effort` continue to work unchanged
- API defaults to `medium` effort when not specified

## Testing

1. Verify research completes successfully with each effort level
2. Confirm response times correlate with effort level
3. Validate that omitting the parameter uses API default
4. Test invalid enum values return appropriate error

## References

- [Perplexity API Docs - Chat Completions](https://docs.perplexity.ai/api-reference/chat-completions-post)
- [Model Cards - sonar-deep-research](https://docs.perplexity.ai/getting-started/models)
