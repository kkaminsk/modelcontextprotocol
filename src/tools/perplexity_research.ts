import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { validateMessages, buildCommonOptions } from "../utils/validation.js";
import { performChatCompletion } from "../utils/api-client.js";

export const PERPLEXITY_RESEARCH_TOOL: Tool = {
  name: "perplexity_research",
  description:
    "Performs deep research using the Perplexity API. " +
    "Accepts an array of messages and returns a comprehensive research response with citations.",
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
      temperature: { type: "number", minimum: 0, maximum: 2, description: "Controls randomness. Default: 0.2" },
      max_tokens: { type: "integer", minimum: 1, description: "Maximum tokens in the response." },
      top_p: { type: "number", minimum: 0, maximum: 1, description: "Nucleus sampling threshold. Default: 0.9" },
      top_k: { type: "integer", minimum: 0, description: "Top-k sampling. 0 = disabled." },
      search_mode: { type: "string", enum: ["web", "academic", "sec"], description: "Source type filter." },
      search_recency_filter: { type: "string", enum: ["day", "week", "month", "year"], description: "Filter results by recency." },
      search_after_date: { type: "string", pattern: "^\\d{2}/\\d{2}/\\d{4}$", description: "Only results after this date. Format: MM/DD/YYYY" },
      search_before_date: { type: "string", pattern: "^\\d{2}/\\d{2}/\\d{4}$", description: "Only results before this date. Format: MM/DD/YYYY" },
      last_updated_after: { type: "string", pattern: "^\\d{2}/\\d{2}/\\d{4}$", description: "Only results updated after. Format: MM/DD/YYYY" },
      last_updated_before: { type: "string", pattern: "^\\d{2}/\\d{2}/\\d{4}$", description: "Only results updated before. Format: MM/DD/YYYY" },
      return_images: { type: "boolean", description: "Include relevant images. Default: false" },
      return_related_questions: { type: "boolean", description: "Include related questions. Default: false" },
    },
    required: ["messages"],
  },
};

export async function handlePerplexityResearch(args: Record<string, unknown>, apiKey: string, timeoutMs: number) {
  if (!Array.isArray(args.messages)) {
    throw new Error("Invalid arguments for perplexity_research: 'messages' must be an array");
  }
  if (!validateMessages(args.messages)) {
    throw new Error("Invalid message format: each message must have string 'role' and 'content' properties");
  }
  const messages = args.messages as Array<{ role: string; content: string }>;
  const options = buildCommonOptions(args);
  const opts = Object.keys(options).length > 0 ? options : undefined;
  const result = await performChatCompletion(messages, "sonar-deep-research", apiKey, timeoutMs, opts);
  return { content: [{ type: "text", text: result }], isError: false };
}
