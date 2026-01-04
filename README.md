# Perplexity MCP Server

An unofficial Model Context Protocol (MCP) server fork that provides AI assistants with Perplexity API capabilities including real-time web search, deep research, and advanced reasoning.

## Available Tools

### perplexity_ask
Real-time AI-powered answers with web search. Supports model selection for balancing speed and quality.

| Parameter | Type | Description |
|-----------|------|-------------|
| `messages` | array | **Required.** Conversation messages with `role` and `content` |
| `model` | string | `sonar` (fast/cheap) or `sonar-pro` (high quality, default) |
| `stream` | boolean | Enable streaming responses (default: false) |
| `return_images` | boolean | Include relevant images in response (default: false) |
| `return_related_questions` | boolean | Include follow-up suggestions (default: false) |

### perplexity_research
Deep, comprehensive research using the `sonar-deep-research` model. Ideal for thorough analysis and detailed reports.

| Parameter | Type | Description |
|-----------|------|-------------|
| `messages` | array | **Required.** Conversation messages with `role` and `content` |
| `reasoning_effort` | string | `low`, `medium` (default), or `high` for research depth |
| `return_images` | boolean | Include relevant images in response (default: false) |
| `return_related_questions` | boolean | Include follow-up suggestions (default: false) |

### perplexity_reason
Advanced reasoning and problem-solving using the `sonar-reasoning-pro` model. Perfect for complex analytical tasks.

| Parameter | Type | Description |
|-----------|------|-------------|
| `messages` | array | **Required.** Conversation messages with `role` and `content` |
| `stream` | boolean | Enable streaming responses (default: false) |

### perplexity_search
Direct web search using the Perplexity Search API. Supports single or batch queries.

| Parameter | Type | Description |
|-----------|------|-------------|
| `query` | string or array | **Required.** Single query or up to 5 queries for batch search |
| `max_results` | number | Results per query (1-20, default: 10) |
| `max_tokens_per_page` | number | Tokens per webpage (256-2048, default: 1024) |
| `country` | string | ISO 3166-1 alpha-2 code for regional results (e.g., `US`, `GB`) |

### perplexity_research_async
Start an async deep research job for complex queries that may take several minutes.

| Parameter | Type | Description |
|-----------|------|-------------|
| `messages` | array | **Required.** Conversation messages with `role` and `content` |
| `reasoning_effort` | string | `low`, `medium` (default), or `high` for research depth |
| `search_domain_filter` | array | Domain allowlist/denylist (max 20) |

Returns a `request_id` to poll with `perplexity_research_status`.

### perplexity_research_status
Check status and retrieve results from an async research job.

| Parameter | Type | Description |
|-----------|------|-------------|
| `request_id` | string | **Required.** The request_id from `perplexity_research_async` |

## Common Parameters

The following parameters are available on `perplexity_ask`, `perplexity_research`, and `perplexity_reason`:

### Generation Controls

| Parameter | Type | Description |
|-----------|------|-------------|
| `temperature` | number | Randomness (0-2). Default: 0.2 |
| `max_tokens` | integer | Maximum response tokens |
| `top_p` | number | Nucleus sampling (0-1). Default: 0.9 |
| `top_k` | integer | Top-k sampling. 0 = disabled |

### Search Filters

| Parameter | Type | Description |
|-----------|------|-------------|
| `search_domain_filter` | array | Domain list (max 20). Prefix with `-` to exclude |
| `search_mode` | string | `web` (default), `academic`, or `sec` (SEC filings) |

### Date Filters

| Parameter | Type | Description |
|-----------|------|-------------|
| `search_recency_filter` | string | `day`, `week`, `month`, or `year` |
| `search_after_date` | string | Only results after date (MM/DD/YYYY) |
| `search_before_date` | string | Only results before date (MM/DD/YYYY) |
| `last_updated_after` | string | Only results updated after date (MM/DD/YYYY) |
| `last_updated_before` | string | Only results updated before date (MM/DD/YYYY) |

> **Note:** `perplexity_search` supports `search_domain_filter` and all date filters, but not generation controls or `search_mode`.

## Installation

### Windows Installer (Recommended for Windows)

Download and run the MSI installer for a one-click setup:

1. Download `PerplexityMCP.msi` from the [Releases](https://github.com/perplexityai/modelcontextprotocol/releases) page
2. Run the installer and enter your Perplexity API key when prompted
3. The installer automatically configures Claude Desktop, Claude Code, Cursor, and Codex

The installer bundles Node.js, so no prerequisites are required.

**Silent install:**
```powershell
msiexec /i PerplexityMCP.msi PERPLEXITY_API_KEY="your_key_here" /qn
```

### npm / npx

For manual installation or non-Windows platforms:

```bash
npx @perplexity-ai/mcp-server
```

Or install globally:

```bash
npm install -g @perplexity-ai/mcp-server
```

## Configuration

### Get Your API Key
1. Get your Perplexity API Key from the [API Portal](https://www.perplexity.ai/account/api)
2. Set it as an environment variable: `PERPLEXITY_API_KEY=your_key_here`
3. (Optional) Set a timeout for requests: `PERPLEXITY_TIMEOUT_MS=600000` (default: 5 minutes)

### Claude Code

Run in your terminal:

```bash
claude mcp add perplexity --transport stdio --env PERPLEXITY_API_KEY=your_key_here -- npx -y perplexity-mcp
```

Or add to your `claude.json`:

```json
"mcpServers": {
  "perplexity": {
    "type": "stdio",
    "command": "npx",
    "args": ["-y", "perplexity-mcp"],
    "env": {
      "PERPLEXITY_API_KEY": "your_key_here",
      "PERPLEXITY_TIMEOUT_MS": "600000"
    }
  }
}
```

### Cursor

Add to your `mcp.json`:

```json
{
  "mcpServers": {
    "perplexity": {
      "command": "npx",
      "args": ["-y", "@perplexity-ai/mcp-server"],
      "env": {
        "PERPLEXITY_API_KEY": "your_key_here",
        "PERPLEXITY_TIMEOUT_MS": "600000"
      }
    }
  }
}
```

### Codex

Run in your terminal:

```bash
codex mcp add perplexity --env PERPLEXITY_API_KEY=your_key_here -- npx -y @perplexity-ai/mcp-server
```

### Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "perplexity": {
      "command": "npx",
      "args": ["-y", "@perplexity-ai/mcp-server"],
      "env": {
        "PERPLEXITY_API_KEY": "your_key_here",
        "PERPLEXITY_TIMEOUT_MS": "600000"
      }
    }
  }
}
```

### Other MCP Clients

For any MCP-compatible client, use:

```bash
npx @perplexity-ai/mcp-server
```

## Troubleshooting

- **API Key Issues**: Ensure `PERPLEXITY_API_KEY` is set correctly
- **Connection Errors**: Check your internet connection and API key validity
- **Tool Not Found**: Make sure the package is installed and the command path is correct
- **Timeout Errors**: For long research queries, increase `PERPLEXITY_TIMEOUT_MS`

For support, visit [community.perplexity.ai](https://community.perplexity.ai) or [file an issue](https://github.com/perplexityai/modelcontextprotocol/issues).
