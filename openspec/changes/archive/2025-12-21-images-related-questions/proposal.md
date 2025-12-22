# OpenSpec Proposal 009: Images and Related Questions

**Priority:** P2 - Medium
**Status:** Completed
**Date:** 2025-12-21
**Affected Tools:** `perplexity_ask`, `perplexity_research`

## Summary

Add `return_images` and `return_related_questions` parameters to enhance responses with visual content and query suggestions.

## Problem Statement

Current responses lack:

1. Relevant images from search results
2. Related question suggestions for follow-up queries
3. Visual context for topics that benefit from imagery

## Proposed Solution

### Schema Update

```typescript
return_images: {
  type: "boolean",
  default: false,
  description: "Include relevant images from search results in the response"
},
return_related_questions: {
  type: "boolean",
  default: false,
  description: "Include related question suggestions for follow-up queries"
}
```

### Implementation

```typescript
interface EnhancedResponseOptions {
  return_images?: boolean;
  return_related_questions?: boolean;
}

async function performChatCompletion(
  messages: Message[],
  model: string,
  options?: EnhancedResponseOptions
): Promise<EnhancedChatCompletionResponse> {
  const body: Record<string, unknown> = {
    model,
    messages
  };

  if (options?.return_images) {
    body.return_images = true;
  }

  if (options?.return_related_questions) {
    body.return_related_questions = true;
  }

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

### Response Structure

```typescript
interface EnhancedChatCompletionResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
  citations?: string[];
  images?: Array<{
    url: string;
    origin_url: string;
    height: number;
    width: number;
  }>;
  related_questions?: string[];
}
```

### MCP Response Formatting

```typescript
function formatEnhancedResponse(response: EnhancedChatCompletionResponse): TextContent[] {
  const content: TextContent[] = [];

  // Main content
  content.push({
    type: "text",
    text: response.choices[0].message.content
  });

  // Citations
  if (response.citations?.length) {
    content.push({
      type: "text",
      text: "\n\n**Sources:**\n" + response.citations.map((c, i) => `${i + 1}. ${c}`).join("\n")
    });
  }

  // Images
  if (response.images?.length) {
    content.push({
      type: "text",
      text: "\n\n**Images:**\n" + response.images.map(img =>
        `- [${img.width}x${img.height}](${img.url}) (source: ${img.origin_url})`
      ).join("\n")
    });
  }

  // Related questions
  if (response.related_questions?.length) {
    content.push({
      type: "text",
      text: "\n\n**Related Questions:**\n" + response.related_questions.map(q => `- ${q}`).join("\n")
    });
  }

  return content;
}
```

## Examples

### With Images
```json
{
  "messages": [{"role": "user", "content": "What does the James Webb Space Telescope look like?"}],
  "return_images": true
}
```

Response includes:
```json
{
  "images": [
    {
      "url": "https://...",
      "origin_url": "https://nasa.gov/...",
      "height": 800,
      "width": 1200
    }
  ]
}
```

### With Related Questions
```json
{
  "messages": [{"role": "user", "content": "How does blockchain work?"}],
  "return_related_questions": true
}
```

Response includes:
```json
{
  "related_questions": [
    "What is the difference between blockchain and cryptocurrency?",
    "How secure is blockchain technology?",
    "What are the main use cases for blockchain?"
  ]
}
```

### Both Features
```json
{
  "messages": [{"role": "user", "content": "Explain machine learning architectures"}],
  "return_images": true,
  "return_related_questions": true
}
```

## Use Cases

| Feature | Best For |
|---------|----------|
| `return_images` | Visual topics, product research, diagrams, architecture |
| `return_related_questions` | Exploratory research, learning paths, content expansion |

## Backward Compatibility

- Both parameters default to `false`
- Existing responses unchanged
- Additive enhancement only

## Testing

1. Verify images are returned when requested
2. Verify image URLs are accessible
3. Verify related questions are relevant
4. Test combined parameter usage
5. Verify response formatting in MCP

## References

- [Perplexity API - Return Images](https://docs.perplexity.ai/api-reference/chat-completions-post)
- [Perplexity API - Related Questions](https://docs.perplexity.ai/api-reference/chat-completions-post)
