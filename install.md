# Installation Guide - Perplexity MCP Server

This guide provides step-by-step instructions for installing and configuring the Perplexity API Platform MCP Server with various MCP-compatible clients.

## Prerequisites

Before installing, ensure you have:

1. **Node.js and npm** installed (version 16 or higher recommended)
2. **A Perplexity API Key** - Get yours from the [API Portal](https://www.perplexity.ai/account/api/group)
3. **An MCP-compatible client** (Claude Desktop, Claude Code, Cursor, Codex, or other)

## Installation Methods

### Method 1: Using npx (Recommended)

The easiest way to use the Perplexity MCP Server is via `npx`, which automatically downloads and runs the latest version without requiring installation:

```bash
npx @perplexity-ai/mcp-server
```

This method is used by most MCP clients and requires no manual installation steps.

### Method 2: Global Installation

For permanent installation, you can install the package globally:

```bash
npm install -g @perplexity-ai/mcp-server
```

Then run it directly:

```bash
perplexity-mcp-server
```

### Method 3: Local Project Installation

To install in a specific project:

```bash
npm install @perplexity-ai/mcp-server
```

Then run via npm scripts or directly:

```bash
npx @perplexity-ai/mcp-server
```

## Client-Specific Configuration

### Claude Code

**Quick Setup (Recommended):**

```bash
claude mcp add perplexity --transport stdio --env PERPLEXITY_API_KEY=your_key_here -- npx -y perplexity-mcp
```

**Manual Configuration:**

1. Locate your `claude.json` configuration file
2. Add the following to the `mcpServers` section:

```json
{
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
}
```

3. Restart Claude Code

### Cursor

1. **Locate your configuration file:**
   - **Windows:** `%APPDATA%\Cursor\User\globalStorage\mcp.json`
   - **macOS:** `~/Library/Application Support/Cursor/User/globalStorage/mcp.json`
   - **Linux:** `~/.config/Cursor/User/globalStorage/mcp.json`

2. **Add the configuration:**

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

3. **Restart Cursor**

### Codex

**Quick Setup:**

```bash
codex mcp add perplexity --env PERPLEXITY_API_KEY=your_key_here -- npx -y @perplexity-ai/mcp-server
```

### Claude Desktop

1. **Locate your configuration file:**
   - **Windows:** `%APPDATA%\Claude\claude_desktop_config.json`
   - **macOS:** `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Linux:** `~/.config/Claude/claude_desktop_config.json`

2. **Add the configuration:**

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

3. **Restart Claude Desktop**

### Other MCP Clients

For any MCP-compatible client that supports the stdio transport:

**Command:**
```bash
npx @perplexity-ai/mcp-server
```

**Environment Variables:**
- `PERPLEXITY_API_KEY` - Your API key (required)
- `PERPLEXITY_TIMEOUT_MS` - Request timeout in milliseconds (optional, default: 300000)

## Environment Variables

### Setting API Key

**Windows (PowerShell):**
```powershell
$env:PERPLEXITY_API_KEY="your_key_here"
```

**Windows (Command Prompt):**
```cmd
set PERPLEXITY_API_KEY=your_key_here
```

**macOS/Linux:**
```bash
export PERPLEXITY_API_KEY=your_key_here
```

**Permanent Setup (macOS/Linux):**

Add to your shell profile (`~/.bashrc`, `~/.zshrc`, etc.):
```bash
export PERPLEXITY_API_KEY="your_key_here"
export PERPLEXITY_TIMEOUT_MS="600000"
```

Then reload:
```bash
source ~/.bashrc  # or ~/.zshrc
```

### Configuration Options

- **PERPLEXITY_API_KEY** (required)
  - Your Perplexity API key from the API Portal
  
- **PERPLEXITY_TIMEOUT_MS** (optional)
  - Request timeout in milliseconds
  - Default: 300000 (5 minutes)
  - Recommended for deep research: 600000 (10 minutes)

## Verification

After installation, verify the setup:

1. **Check if the server starts:**
   ```bash
   npx @perplexity-ai/mcp-server
   ```
   
   You should see log output indicating the server is running.

2. **Test in your MCP client:**
   - Open your MCP-compatible client
   - Look for Perplexity tools in the available tools list
   - Try running a simple search query

3. **Verify tools are available:**
   - `perplexity_search` - Web search
   - `perplexity_ask` - Conversational AI with search
   - `perplexity_research` - Deep research
   - `perplexity_reason` - Advanced reasoning

## Troubleshooting

### Installation Issues

**Problem: `command not found: npx`**
- **Solution:** Install Node.js from [nodejs.org](https://nodejs.org/)

**Problem: Permission denied**
- **Solution (macOS/Linux):** Use `sudo npm install -g @perplexity-ai/mcp-server`
- **Solution (Windows):** Run terminal as Administrator

**Problem: Package not found**
- **Solution:** Ensure you have an active internet connection and npm registry access

### Configuration Issues

**Problem: API Key not recognized**
- **Solution:** Verify the environment variable is set correctly in your client's configuration
- Check for extra spaces or quotes in your API key

**Problem: Server not connecting**
- **Solution:** 
  1. Restart your MCP client completely
  2. Check that the command path is correct
  3. Verify Node.js is in your system PATH
  4. Review client logs for specific error messages

**Problem: Tools not appearing**
- **Solution:**
  1. Ensure the configuration JSON is valid (no trailing commas, proper brackets)
  2. Restart the MCP client
  3. Check client documentation for MCP server discovery

### Runtime Issues

**Problem: Timeout errors**
- **Solution:** Increase `PERPLEXITY_TIMEOUT_MS` to 600000 or higher
- Deep research queries may need more time

**Problem: API errors**
- **Solution:** 
  1. Verify your API key is valid at the [API Portal](https://www.perplexity.ai/account/api/group)
  2. Check your API usage quota
  3. Ensure you have an active internet connection

**Problem: Rate limiting**
- **Solution:** Check your API plan limits and consider upgrading if needed

## Updating

### Update npx version (automatic):
No action needed - npx always uses the latest version with the `-y` flag.

### Update global installation:
```bash
npm update -g @perplexity-ai/mcp-server
```

### Update local installation:
```bash
npm update @perplexity-ai/mcp-server
```

## Uninstallation

### Remove global installation:
```bash
npm uninstall -g @perplexity-ai/mcp-server
```

### Remove from MCP client:
1. Open your client's configuration file
2. Remove the `perplexity` entry from `mcpServers`
3. Restart the client

## Getting Help

If you encounter issues:

1. **Check the logs** - Your MCP client typically provides logs for debugging
2. **Review documentation** - Visit the [DeepWiki page](https://deepwiki.com/ppl-ai/modelcontextprotocol)
3. **Community support** - Visit [community.perplexity.ai](https://community.perplexity.ai)
4. **Report issues** - [File an issue on GitHub](https://github.com/perplexityai/modelcontextprotocol/issues)

## Next Steps

After successful installation:

1. **Explore the tools** - Try each of the four available tools
2. **Read the README** - Learn about specific tool capabilities
3. **Integrate into workflows** - Start using Perplexity search in your development process
4. **Share feedback** - Help improve the MCP server by reporting issues or suggestions

---

**Note:** This MCP server requires an active internet connection and valid Perplexity API credentials to function.
