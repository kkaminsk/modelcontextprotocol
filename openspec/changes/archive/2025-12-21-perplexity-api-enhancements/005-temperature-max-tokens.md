# OpenSpec Proposal 005: Temperature and Max Tokens Parameters

**Priority:** P1 - High
**Status:** Completed
**Date:** 2025-12-21
**Affected Tools:** `perplexity_ask`, `perplexity_research`, `perplexity_reason`

## Summary

Add `temperature`, `max_tokens`, `top_p`, and `top_k` parameters to control response generation behavior.

## Problem Statement

Users cannot control:

1. Response creativity/randomness (temperature)
2. Maximum response length (max_tokens)
3. Sampling strategies (top_p, top_k)

This limits the ability to tune responses for different use cases.

## Proposed Solution

### Schema Update

```typescript
temperature: {
  type: "number",
  minimum: 0,
  maximum: 2,
  description: "Controls randomness. 0 = deterministic, 2 = maximum creativity. Default: 0.2"
},
max_tokens: {
  type: "integer",
  minimum: 1,
  description: "Maximum tokens in the response. Model-specific limits apply."
},
top_p: {
  type: "number",
  minimum: 0,
  maximum: 1,
  description: "Nucleus sampling threshold. Default: 0.9"
},
top_k: {
  type: "integer",
  minimum: 0,
  description: "Top-k sampling. 0 = disabled. Default: 0"
}
```

### Implementation

```typescript
interface GenerationOptions {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  top_k?: number;
}

function buildGenerationParams(options: GenerationOptions): Record<string, unknown> {
  const params: Record<string, unknown> = {};

  if (options.temperature !== undefined) {
    if (options.temperature < 0 || options.temperature > 2) {
      throw new Error("temperature must be between 0 and 2");
    }
    params.temperature = options.temperature;
  }

  if (options.max_tokens !== undefined) {
    if (options.max_tokens < 1) {
      throw new Error("max_tokens must be at least 1");
    }
    params.max_tokens = options.max_tokens;
  }

  if (options.top_p !== undefined) {
    if (options.top_p < 0 || options.top_p > 1) {
      throw new Error("top_p must be between 0 and 1");
    }
    params.top_p = options.top_p;
  }

  if (options.top_k !== undefined) {
    if (options.top_k < 0) {
      throw new Error("top_k must be non-negative");
    }
    params.top_k = options.top_k;
  }

  return params;
}
```

## Parameter Details

### temperature

| Value | Behavior |
|-------|----------|
| 0 | Deterministic, most likely tokens |
| 0.2 | Slightly varied (default) |
| 0.7 | Balanced creativity |
| 1.0 | Creative |
| 2.0 | Maximum randomness |

### max_tokens

- Limits response length
- Model-specific maximums apply
- Omit to use model default

### top_p (Nucleus Sampling)

- Samples from smallest set of tokens with cumulative probability >= top_p
- Default: 0.9
- Lower values = more focused responses

### top_k

- Only sample from top k tokens
- 0 = disabled (default)
- Higher values = more varied vocabulary

## Examples

### Deterministic Response
```json
{
  "messages": [{"role": "user", "content": "What is 2+2?"}],
  "temperature": 0
}
```

### Creative Writing
```json
{
  "messages": [{"role": "user", "content": "Write a poem about coding"}],
  "temperature": 1.2,
  "top_p": 0.95
}
```

### Concise Response
```json
{
  "messages": [{"role": "user", "content": "Summarize quantum computing"}],
  "max_tokens": 150
}
```

## Backward Compatibility

- All parameters optional
- Defaults match current API behavior
- Existing tool calls unchanged

## Testing

1. Verify temperature 0 produces consistent output
2. Verify max_tokens limits response length
3. Test boundary values (0, 2 for temperature)
4. Test invalid values return errors
5. Verify parameters pass through to API correctly

## References

- [Perplexity API - Generation Parameters](https://docs.perplexity.ai/api-reference/chat-completions-post)
