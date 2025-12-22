# Perplexity MCP Server - Project Context

## Overview

**Package:** `@perplexity-ai/mcp-server`
**Version:** 0.2.2
**License:** MIT
**Repository:** https://github.com/perplexityai/modelcontextprotocol

The official Model Context Protocol (MCP) server implementation for the Perplexity API Platform. Provides AI assistants and development tools with real-time web search, reasoning, and research capabilities through Sonar models and the Search API.

## Architecture

```
modelcontextprotocol/
├── index.ts              # Main MCP server implementation
├── package.json          # Package configuration
├── tsconfig.json         # TypeScript configuration
├── Dockerfile            # Container build
├── install.md            # Installation guide
├── README.md             # Project documentation
├── openspec/             # Specifications and changes
│   ├── project.md        # This file
│   ├── specs/            # Feature specifications
│   └── changes/          # Change logs
└── perplexity-ask/       # Sub-package
```

## Tools Provided

| Tool | Model | Purpose |
|------|-------|---------|
| `perplexity_search` | Search API | Direct web search with ranked results and metadata |
| `perplexity_ask` | sonar-pro | Conversational AI with real-time web search |
| `perplexity_research` | sonar-deep-research | Deep comprehensive research and detailed reports |
| `perplexity_reason` | sonar-reasoning-pro | Advanced reasoning and problem-solving |

## Tech Stack

- **Language:** TypeScript (ES2015 target, ESNext modules)
- **Runtime:** Node.js >= 18
- **Framework:** Model Context Protocol SDK (`@modelcontextprotocol/sdk`)
- **HTTP Client:** Axios
- **Build:** TypeScript Compiler (tsc)
- **Container:** Docker (Node.js 22-alpine, multi-stage)

## Key Dependencies

```json
{
  "@modelcontextprotocol/sdk": "^1.0.1",
  "axios": "^1.6.2",
  "dotenv": "^16.3.1"
}
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PERPLEXITY_API_KEY` | Yes | - | API key from Perplexity API Portal |
| `PERPLEXITY_TIMEOUT_MS` | No | 300000 (5 min) | Request timeout in milliseconds |

## Development

```bash
# Install dependencies
npm install

# Build
npm run build

# Watch mode
npm run watch
```

## Entry Point

The server is implemented in `index.ts` which:
1. Defines JSON schemas for all four tools
2. Implements chat completion via Perplexity API
3. Implements web search via Perplexity Search API
4. Sets up MCP server with stdio transport
5. Routes requests to appropriate tool handlers
6. Formats responses with citations

## Supported Clients

- Claude Code
- Claude Desktop
- Cursor
- Codex
- Any MCP-compatible client

## Links

- [API Portal](https://www.perplexity.ai/account/api/group) - Get API key
- [Documentation](https://docs.perplexity.ai/guides/mcp-server) - Official docs
- [DeepWiki](https://deepwiki.com/ppl-ai/modelcontextprotocol) - Implementation help
- [Community](https://community.perplexity.ai) - Support
