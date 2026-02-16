## Why

The Perplexity API now offers an Agent API (`POST /v1/responses`) as its primary recommended interface. It supports multi-provider models (Claude, GPT, Gemini, Grok), presets (fast-search, pro-search, deep-research, advanced-deep-research), built-in tools (web_search, fetch_url), multi-step reasoning, fallback model chains, structured JSON output, and streaming via SSE. The MCP server has no support for this API, leaving users unable to access the most powerful Perplexity capabilities.

## What Changes

- **New**: `perplexity_agent` tool wrapping `POST /v1/responses`
- **New**: `src/tools/perplexity_agent.ts` — tool definition and handler
- **New**: API client function `performAgentRequest` in `api-client.ts`
- **New**: TypeScript interfaces for Agent API request/response

## Capabilities

### New Capabilities
- `agent-api`: Full access to the Perplexity Agent API with multi-provider models, presets, built-in tools, multi-step reasoning, structured output, and streaming

## Impact

- **Risk**: Low — additive new tool, no changes to existing tools
- **Breaking changes**: None
- **Effort**: ~2 hours
- **Dependencies**: None
