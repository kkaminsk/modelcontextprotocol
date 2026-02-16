#!/usr/bin/env node

/**
 * Entry point for the Perplexity MCP Server.
 */

import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getApiKey, getTimeoutMs } from "./config.js";
import { createServer } from "./server.js";

const apiKey = getApiKey();
const timeoutMs = getTimeoutMs();
const server = createServer(apiKey, timeoutMs);

async function runServer() {
  try {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Perplexity MCP Server running on stdio with Ask, Research, Reason, Search, and Async Research tools");
  } catch (error) {
    console.error("Fatal error running server:", error);
    process.exit(1);
  }
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
