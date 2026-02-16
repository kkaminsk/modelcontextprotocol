/**
 * MCP server configuration and tool registration.
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";

import { PERPLEXITY_ASK_TOOL, handlePerplexityAsk } from "./tools/perplexity_ask.js";
import { PERPLEXITY_RESEARCH_TOOL, handlePerplexityResearch } from "./tools/perplexity_research.js";
import { PERPLEXITY_REASON_TOOL, handlePerplexityReason } from "./tools/perplexity_reason.js";
import { PERPLEXITY_SEARCH_TOOL, handlePerplexitySearch } from "./tools/perplexity_search.js";
import {
  PERPLEXITY_RESEARCH_ASYNC_TOOL,
  PERPLEXITY_RESEARCH_STATUS_TOOL,
  handlePerplexityResearchAsync,
  handlePerplexityResearchStatus,
} from "./tools/perplexity_research_async.js";
import { PERPLEXITY_AGENT_TOOL, handlePerplexityAgent } from "./tools/perplexity_agent.js";
import { PERPLEXITY_EMBED_TOOL, handlePerplexityEmbed } from "./tools/perplexity_embed.js";

export function createServer(apiKey: string, timeoutMs: number): Server {
  const server = new Server(
    { name: "@perplexity-ai/mcp-server", version: "0.2.3" },
    { capabilities: { tools: {} } }
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({
    tools: [
      PERPLEXITY_ASK_TOOL,
      PERPLEXITY_RESEARCH_TOOL,
      PERPLEXITY_REASON_TOOL,
      PERPLEXITY_SEARCH_TOOL,
      PERPLEXITY_RESEARCH_ASYNC_TOOL,
      PERPLEXITY_RESEARCH_STATUS_TOOL,
      PERPLEXITY_AGENT_TOOL,
      PERPLEXITY_EMBED_TOOL,
    ],
  }));

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    try {
      const { name, arguments: args } = request.params;
      if (!args) throw new Error("No arguments provided");

      switch (name) {
        case "perplexity_ask":
          return await handlePerplexityAsk(args as Record<string, unknown>, apiKey, timeoutMs);
        case "perplexity_research":
          return await handlePerplexityResearch(args as Record<string, unknown>, apiKey, timeoutMs);
        case "perplexity_reason":
          return await handlePerplexityReason(args as Record<string, unknown>, apiKey, timeoutMs);
        case "perplexity_search":
          return await handlePerplexitySearch(args as Record<string, unknown>, apiKey, timeoutMs);
        case "perplexity_research_async":
          return await handlePerplexityResearchAsync(args as Record<string, unknown>, apiKey, timeoutMs);
        case "perplexity_research_status":
          return await handlePerplexityResearchStatus(args as Record<string, unknown>, apiKey, timeoutMs);
        case "perplexity_agent":
          return await handlePerplexityAgent(args as Record<string, unknown>, apiKey, timeoutMs);
        case "perplexity_embed":
          return await handlePerplexityEmbed(args as Record<string, unknown>, apiKey, timeoutMs);
        default:
          return { content: [{ type: "text", text: `Unknown tool: ${name}` }], isError: true };
      }
    } catch (error) {
      return {
        content: [{ type: "text", text: `Error: ${error instanceof Error ? error.message : String(error)}` }],
        isError: true,
      };
    }
  });

  return server;
}
