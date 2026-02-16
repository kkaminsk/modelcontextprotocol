import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { validateMessages, buildCommonOptions } from "../utils/validation.js";
import { startAsyncResearch, getAsyncResearchStatus } from "../utils/api-client.js";

export const PERPLEXITY_RESEARCH_ASYNC_TOOL: Tool = {
  name: "perplexity_research_async",
  description:
    "Start an async deep research job. Returns a request_id to poll for results. " +
    "Use for complex research that may take several minutes.",
  inputSchema: {
    type: "object",
    properties: {
      messages: {
        type: "array",
        items: {
          type: "object",
          properties: {
            role: { type: "string", description: "Role of the message" },
            content: { type: "string", description: "The content of the message" },
          },
          required: ["role", "content"],
        },
        description: "Array of conversation messages",
      },
      reasoning_effort: { type: "string", enum: ["low", "medium", "high"], description: "Controls research depth." },
      search_domain_filter: { type: "array", items: { type: "string" }, maxItems: 20, description: "Domain filter list." },
    },
    required: ["messages"],
  },
};

export const PERPLEXITY_RESEARCH_STATUS_TOOL: Tool = {
  name: "perplexity_research_status",
  description:
    "Check status of an async research job and retrieve results when complete. " +
    "Use the request_id returned from perplexity_research_async.",
  inputSchema: {
    type: "object",
    properties: {
      request_id: { type: "string", description: "The request_id returned from perplexity_research_async" },
    },
    required: ["request_id"],
  },
};

export async function handlePerplexityResearchAsync(args: Record<string, unknown>, apiKey: string, timeoutMs: number) {
  if (!Array.isArray(args.messages)) {
    throw new Error("Invalid arguments for perplexity_research_async: 'messages' must be an array");
  }
  if (!validateMessages(args.messages)) {
    throw new Error("Invalid message format: each message must have string 'role' and 'content' properties");
  }
  const messages = args.messages as Array<{ role: string; content: string }>;
  const commonOpts = buildCommonOptions(args);
  const options: { reasoning_effort?: "low" | "medium" | "high"; search_domain_filter?: string[] } = {};
  if (commonOpts.reasoning_effort) options.reasoning_effort = commonOpts.reasoning_effort;
  if (commonOpts.search_domain_filter && commonOpts.search_domain_filter.length > 0) options.search_domain_filter = commonOpts.search_domain_filter;
  const result = await startAsyncResearch(messages, apiKey, timeoutMs, Object.keys(options).length > 0 ? options : undefined);
  return {
    content: [{ type: "text", text: `Async research job started.\n\nRequest ID: ${result.request_id}\nStatus: ${result.status}\n\nUse perplexity_research_status with this request_id to check progress and retrieve results.` }],
    isError: false,
  };
}

export async function handlePerplexityResearchStatus(args: Record<string, unknown>, apiKey: string, timeoutMs: number) {
  if (typeof args.request_id !== "string") {
    throw new Error("Invalid arguments for perplexity_research_status: 'request_id' must be a string");
  }
  const statusResult = await getAsyncResearchStatus(args.request_id, apiKey, timeoutMs);
  let responseText = `Request ID: ${statusResult.request_id}\nStatus: ${statusResult.status}`;
  if (statusResult.created_at) responseText += `\nCreated: ${statusResult.created_at}`;
  if (statusResult.completed_at) responseText += `\nCompleted: ${statusResult.completed_at}`;
  if (statusResult.status === "failed" && statusResult.error) responseText += `\nError: ${statusResult.error}`;
  if (statusResult.status === "completed" && statusResult.result) responseText += `\n\n--- Research Results ---\n\n${statusResult.result}`;
  if (statusResult.status === "pending" || statusResult.status === "processing") responseText += `\n\nThe research is still in progress. Please poll again in a few seconds.`;
  return { content: [{ type: "text", text: responseText }], isError: false };
}
