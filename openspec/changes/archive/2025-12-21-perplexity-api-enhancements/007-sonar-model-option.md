# OpenSpec Proposal 007: Sonar Model Selection

**Priority:** P1 - High
**Status:** Completed
**Date:** 2025-12-21
**Affected Tools:** `perplexity_ask`, potentially new `perplexity_ask_fast`

## Summary

Add model selection capability to allow choosing between `sonar` (lightweight, faster, cheaper) and `sonar-pro` (more capable, higher quality) models.

## Problem Statement

Currently `perplexity_ask` only uses `sonar-pro`. Users cannot:

1. Use the faster, cheaper `sonar` model for simple queries
2. Optimize for cost vs. quality based on use case
3. Choose appropriate model for their needs

## Proposed Solution

### Option A: Model Parameter (Recommended)

Add a `model` parameter to `perplexity_ask`:

```typescript
const ASK_TOOL: Tool = {
  name: "perplexity_ask",
  description: "Real-time AI-powered answers with web search. Supports sonar (fast/cheap) and sonar-pro (high quality) models.",
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
      model: {
        type: "string",
        enum: ["sonar", "sonar-pro"],
        default: "sonar-pro",
        description: "Model to use: 'sonar' for fast/cost-effective queries, 'sonar-pro' for higher quality (default)"
      }
    },
    required: ["messages"]
  }
};
```

### Option B: Separate Tool

Add a new `perplexity_ask_fast` tool:

```typescript
const ASK_FAST_TOOL: Tool = {
  name: "perplexity_ask_fast",
  description: "Fast, cost-effective AI answers using the sonar model. Use for simple queries where speed matters more than depth.",
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
      }
    },
    required: ["messages"]
  }
};
```

## Model Comparison

| Model | Speed | Cost | Quality | Use Case |
|-------|-------|------|---------|----------|
| `sonar` | Fast | Lower | Good | Simple queries, quick lookups |
| `sonar-pro` | Standard | Higher | Best | Complex queries, detailed answers |

## Recommendation

**Option A (Model Parameter)** is recommended because:

1. Single tool with flexible configuration
2. Clearer mental model for users
3. Easier to extend to additional models
4. Consistent with other parameter patterns

## Implementation

```typescript
async function performChatCompletion(
  messages: Message[],
  model: "sonar" | "sonar-pro" = "sonar-pro",
  options?: ChatCompletionOptions
): Promise<ChatCompletionResponse> {
  const body: Record<string, unknown> = {
    model,
    messages,
    ...options
  };

  const response = await fetch("https://api.perplexity.ai/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  return await response.json();
}
```

## Examples

### Quick Lookup (sonar)
```json
{
  "messages": [{"role": "user", "content": "What time is it in Tokyo?"}],
  "model": "sonar"
}
```

### Detailed Analysis (sonar-pro)
```json
{
  "messages": [{"role": "user", "content": "Compare React and Vue.js for enterprise applications"}],
  "model": "sonar-pro"
}
```

### Default Behavior
```json
{
  "messages": [{"role": "user", "content": "Explain machine learning"}]
}
// Uses sonar-pro by default
```

## Additional Models (Future)

The same pattern can extend to other models:

| Model | Status | Tool |
|-------|--------|------|
| `sonar` | Proposal | `perplexity_ask` |
| `sonar-pro` | Implemented | `perplexity_ask` |
| `sonar-reasoning` | Future | `perplexity_reason` |
| `sonar-reasoning-pro` | Implemented | `perplexity_reason` |
| `r1-1776` | Future | New tool TBD |

## Backward Compatibility

- Default remains `sonar-pro`
- Existing tool calls work unchanged
- No breaking changes

## Testing

1. Verify `sonar` model produces valid responses
2. Compare response quality between models
3. Verify default is `sonar-pro`
4. Test invalid model values
5. Benchmark response times

## References

- [Perplexity Model Cards](https://docs.perplexity.ai/getting-started/models)
