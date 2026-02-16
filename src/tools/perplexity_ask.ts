import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { validateMessages, buildCommonOptions } from "../utils/validation.js";
import { performChatCompletion, performStreamingChatCompletion } from "../utils/api-client.js";

export const PERPLEXITY_ASK_TOOL: Tool = {
  name: "perplexity_ask",
  description:
    "Real-time AI-powered answers with web search. " +
    "Supports sonar (fast/cheap) and sonar-pro (high quality) models. " +
    "Accepts an array of messages and returns a completion response with citations.",
  inputSchema: {
    type: "object",
    properties: {
      messages: {
        type: "array",
        items: {
          type: "object",
          properties: {
            role: { type: "string", description: "Role of the message (e.g., system, user, assistant)" },
            content: { type: "string", description: "The content of the message" },
          },
          required: ["role", "content"],
        },
        description: "Array of conversation messages",
      },
      model: { type: "string", enum: ["sonar", "sonar-pro"], description: "Model to use: 'sonar' for fast/cost-effective queries, 'sonar-pro' for higher quality (default)" },
      search_domain_filter: { type: "array", items: { type: "string" }, maxItems: 20, description: "Domain filter list. Prefix with '-' to exclude. Maximum 20 domains." },
      temperature: { type: "number", minimum: 0, maximum: 2, description: "Controls randomness. 0 = deterministic, 2 = maximum creativity. Default: 0.2" },
      max_tokens: { type: "integer", minimum: 1, description: "Maximum tokens in the response." },
      top_p: { type: "number", minimum: 0, maximum: 1, description: "Nucleus sampling threshold. Default: 0.9" },
      top_k: { type: "integer", minimum: 0, description: "Top-k sampling. 0 = disabled. Default: 0" },
      search_mode: { type: "string", enum: ["web", "academic", "sec"], description: "Source type filter." },
      search_recency_filter: { type: "string", enum: ["day", "week", "month", "year"], description: "Filter results by recency." },
      search_after_date: { type: "string", pattern: "^\\d{2}/\\d{2}/\\d{4}$", description: "Only include results published after this date. Format: MM/DD/YYYY" },
      search_before_date: { type: "string", pattern: "^\\d{2}/\\d{2}/\\d{4}$", description: "Only include results published before this date. Format: MM/DD/YYYY" },
      last_updated_after: { type: "string", pattern: "^\\d{2}/\\d{2}/\\d{4}$", description: "Only include results last updated after this date. Format: MM/DD/YYYY" },
      last_updated_before: { type: "string", pattern: "^\\d{2}/\\d{2}/\\d{4}$", description: "Only include results last updated before this date. Format: MM/DD/YYYY" },
      stream: { type: "boolean", description: "Enable streaming responses. Default: false" },
      return_images: { type: "boolean", description: "Include relevant images. Default: false" },
      return_related_questions: { type: "boolean", description: "Include related question suggestions. Default: false" },
      search_context_size: { type: "string", enum: ["minimal", "low", "medium", "high"], description: "Amount of search context to include" },
      output_level: { type: "string", enum: ["full", "concise"], description: "Response detail level" },
      search_language_filter: { type: "array", items: { type: "string" }, maxItems: 10, description: "ISO 639-1 language codes to filter search results (max 10)" },
      enable_search_classifier: { type: "boolean", description: "Enable/disable search classifier" },
      disable_search: { type: "boolean", description: "Disable web search entirely" },
      search_type: { type: "string", enum: ["fast", "pro"], description: "Search type. 'pro' enables multi-step Pro Search reasoning" },
      response_format: { type: "object", description: "Structured output format (e.g., { type: 'json_schema', json_schema: {...} })" },
    },
    required: ["messages"],
  },
};

export async function handlePerplexityAsk(args: Record<string, unknown>, apiKey: string, timeoutMs: number) {
  if (!Array.isArray(args.messages)) {
    throw new Error("Invalid arguments for perplexity_ask: 'messages' must be an array");
  }
  if (!validateMessages(args.messages)) {
    throw new Error("Invalid message format: each message must have string 'role' and 'content' properties");
  }
  const messages = args.messages as Array<{ role: string; content: string }>;
  const model = typeof args.model === "string" && ["sonar", "sonar-pro"].includes(args.model) ? args.model : "sonar-pro";
  const useStreaming = args.stream === true;
  const options = buildCommonOptions(args);
  const opts = Object.keys(options).length > 0 ? options : undefined;
  const result = useStreaming
    ? await performStreamingChatCompletion(messages, model, apiKey, timeoutMs, opts)
    : await performChatCompletion(messages, model, apiKey, timeoutMs, opts);
  return { content: [{ type: "text", text: result }], isError: false };
}
