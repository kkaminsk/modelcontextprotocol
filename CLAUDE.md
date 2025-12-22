<!-- OPENSPEC:START -->
# OpenSpec Instructions

These instructions are for AI assistants working in this project.

Always open `@/openspec/AGENTS.md` when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts, or big performance/security work
- Sounds ambiguous and you need the authoritative spec before coding

Use `@/openspec/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Project structure and guidelines

Keep this managed block so 'openspec update' can refresh the instructions.

<!-- OPENSPEC:END -->

# CLAUDE.md - Project Instructions for Claude Code

## Project Overview

This is the **Perplexity MCP Server** (`@perplexity-ai/mcp-server`) - an official Model Context Protocol server that provides AI assistants with Perplexity API capabilities.

## Quick Reference

```bash
npm install      # Install dependencies
npm run build    # Build TypeScript to dist/
npm run watch    # Watch mode for development
```

## Architecture

Single-file server implementation in `index.ts`:
- Tool definitions (JSON schemas)
- API request handlers (`performChatCompletion`, `performStreamingChatCompletion`, `performSearch`, `startAsyncResearch`, `getAsyncResearchStatus`)
- MCP server setup with stdio transport
- Request routing via `CallToolRequestSchema` handler

## Tools Implemented

| Tool | Model | API Endpoint |
|------|-------|--------------|
| `perplexity_ask` | sonar / sonar-pro | /chat/completions |
| `perplexity_research` | sonar-deep-research | /chat/completions |
| `perplexity_reason` | sonar-reasoning-pro | /chat/completions |
| `perplexity_search` | - | /search |
| `perplexity_research_async` | sonar-deep-research | /async/chat/completions (POST) |
| `perplexity_research_status` | - | /async/chat/completions/{id} (GET) |

## Common Parameters

All chat completion tools (`perplexity_ask`, `perplexity_research`, `perplexity_reason`) support:

| Parameter | Type | Description |
|-----------|------|-------------|
| `search_domain_filter` | string[] | Domain allowlist (max 20). Prefix with `-` to exclude. |
| `temperature` | number | Randomness (0-2). Default: 0.2 |
| `max_tokens` | integer | Maximum response tokens |
| `top_p` | number | Nucleus sampling (0-1). Default: 0.9 |
| `top_k` | integer | Top-k sampling. 0 = disabled |
| `search_mode` | string | `web`, `academic`, or `sec` |
| `search_recency_filter` | string | `day`, `week`, `month`, `year` |
| `search_after_date` | string | MM/DD/YYYY format |
| `search_before_date` | string | MM/DD/YYYY format |
| `last_updated_after` | string | MM/DD/YYYY format |
| `last_updated_before` | string | MM/DD/YYYY format |

### Tool-Specific Parameters

- `perplexity_ask`: `model` (sonar / sonar-pro), `stream`, `return_images`, `return_related_questions`
- `perplexity_research`: `reasoning_effort` (low / medium / high), `return_images`, `return_related_questions`
- `perplexity_reason`: `stream` (boolean)
- `perplexity_research_async`: `reasoning_effort`, `search_domain_filter`

### Streaming Support

`perplexity_ask` and `perplexity_reason` support streaming responses via the `stream` parameter:
- When `stream: true`, responses are delivered incrementally using SSE format
- Citations are appended after the stream completes
- Default: `false` (non-streaming)

### Images & Related Questions

`perplexity_ask` and `perplexity_research` support enhanced responses:
- `return_images: true` - Include relevant images (url, origin_url, dimensions)
- `return_related_questions: true` - Include follow-up query suggestions
- Both default to `false`

### Multi-Query Search

`perplexity_search` supports batch searches:
- `query`: string OR array of strings (max 5)
- Single query returns simple format, multiple queries return grouped results
- Queries execute in parallel for efficiency
- Each query subject to same filters (`max_results`, `search_domain_filter`, etc.)

## Code Patterns

### Adding a New Tool

1. Define the tool schema as a `Tool` constant:
```typescript
const NEW_TOOL: Tool = {
  name: "perplexity_newtool",
  description: "...",
  inputSchema: { type: "object", properties: {...}, required: [...] }
};
```

2. Add to the tools array in `ListToolsRequestSchema` handler
3. Add case in `CallToolRequestSchema` switch statement
4. Implement the API call function if needed

### API Request Pattern

All API calls follow this pattern:
- Create `AbortController` for timeout
- Use `fetch` with Bearer token auth
- Handle timeout via abort signal
- Parse JSON response
- Format and return results

### Error Handling

- Timeout errors: Suggest increasing `PERPLEXITY_TIMEOUT_MS`
- Network errors: Wrap with descriptive message
- API errors: Include status code and response text
- Return errors via `{ content: [...], isError: true }`

## Environment Variables

| Variable | Required | Default |
|----------|----------|---------|
| `PERPLEXITY_API_KEY` | Yes | - |
| `PERPLEXITY_TIMEOUT_MS` | No | 300000 |

## Key Files

- `index.ts` - All server logic (tools, handlers, API calls)
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript config (ES2015, ESNext modules)
- `openspec/project.md` - Detailed project context

## Testing Locally

```bash
# Set API key
export PERPLEXITY_API_KEY=your_key

# Build and run
npm run build
node dist/index.js
```

## Conventions

- TypeScript with strict mode
- ESM modules (`"type": "module"`)
- Console output to stderr (stdout reserved for MCP protocol)
- Citations appended to responses when available
- Timeout configurable via environment variable
