import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { perplexityFetch, parseResponse } from "../utils/api-client.js";

export const PERPLEXITY_AGENT_TOOL: Tool = {
  name: "perplexity_agent",
  description:
    "Access the Perplexity Agent API (POST /v1/responses) — the primary recommended API. " +
    "Supports multi-provider models (Claude, GPT, Gemini, Grok), presets (fast-search, pro-search, deep-research, advanced-deep-research), " +
    "built-in tools (web_search, fetch_url), multi-step reasoning, fallback model chains, structured JSON output, and more.",
  inputSchema: {
    type: "object",
    properties: {
      query: { type: "string", description: "The user query/prompt to send to the agent" },
      model: { type: "string", description: "Model to use (e.g., 'anthropic/claude-opus-4-6', 'openai/gpt-5.2', 'google/gemini-2.5-pro', 'xai/grok-4-1-fast-non-reasoning')" },
      models: {
        type: "array",
        items: { type: "string" },
        maxItems: 5,
        description: "Fallback model chain (up to 5 models). First available model is used.",
      },
      preset: {
        type: "string",
        enum: ["fast-search", "pro-search", "deep-research", "advanced-deep-research"],
        description: "Search preset to use",
      },
      system: { type: "string", description: "System prompt for the agent" },
      instructions: { type: "string", description: "Additional instructions for the agent" },
      language: { type: "string", description: "Preferred response language (ISO 639-1 code)" },
      max_steps: { type: "integer", minimum: 1, maximum: 10, description: "Maximum reasoning steps (1-10) for multi-step agent reasoning" },
      reasoning: {
        type: "object",
        properties: {
          effort: { type: "string", enum: ["low", "medium", "high"], description: "Reasoning effort level" },
        },
        description: "Reasoning configuration",
      },
      tools: {
        type: "array",
        items: { type: "object" },
        description: "Built-in tools configuration (web_search with filters, fetch_url, custom function tools)",
      },
      response_format: {
        type: "object",
        description: "Structured output format. Use type 'json_schema' with a schema property for structured JSON output.",
      },
      stream: { type: "boolean", description: "Enable streaming via SSE. Default: false" },
    },
    required: ["query"],
  },
};

interface AgentResponse {
  id?: string;
  output?: Array<{ type: string; content?: string; text?: string }>;
  citations?: string[];
  search_results?: Array<{ title: string; url: string; snippet?: string; date?: string }>;
  error?: { message: string };
  // Fallback for simpler response shapes
  content?: string;
  choices?: Array<{ message: { content: string } }>;
}

export async function handlePerplexityAgent(args: Record<string, unknown>, apiKey: string, timeoutMs: number) {
  if (typeof args.query !== "string" || !args.query.trim()) {
    throw new Error("Invalid arguments for perplexity_agent: 'query' must be a non-empty string");
  }

  const body: Record<string, unknown> = {
    query: args.query,
  };

  if (typeof args.model === "string") body.model = args.model;
  if (Array.isArray(args.models)) body.models = args.models;
  if (typeof args.preset === "string") body.preset = args.preset;
  if (typeof args.system === "string") body.system = args.system;
  if (typeof args.instructions === "string") body.instructions = args.instructions;
  if (typeof args.language === "string") body.language = args.language;
  if (typeof args.max_steps === "number") body.max_steps = args.max_steps;
  if (args.reasoning && typeof args.reasoning === "object") body.reasoning = args.reasoning;
  if (Array.isArray(args.tools)) body.tools = args.tools;
  if (args.response_format && typeof args.response_format === "object") body.response_format = args.response_format;
  if (args.stream === true) body.stream = true;

  const response = await perplexityFetch(
    "https://api.perplexity.ai/v1/responses",
    apiKey,
    timeoutMs,
    { method: "POST", body: JSON.stringify(body) }
  );

  const data = await parseResponse<AgentResponse>(response);

  // Format the response
  let content = "";

  if (data.output && Array.isArray(data.output)) {
    content = data.output
      .map((item) => item.content || item.text || "")
      .filter(Boolean)
      .join("\n\n");
  } else if (data.content) {
    content = data.content;
  } else if (data.choices && data.choices[0]) {
    content = data.choices[0].message.content;
  } else {
    content = JSON.stringify(data, null, 2);
  }

  // Append citations
  if (data.citations && data.citations.length > 0) {
    content += "\n\nCitations:\n";
    data.citations.forEach((citation, index) => {
      content += `[${index + 1}] ${citation}\n`;
    });
  }

  // Append search results
  if (data.search_results && data.search_results.length > 0) {
    content += "\n\nSearch Results:\n";
    data.search_results.forEach((result, index) => {
      content += `[${index + 1}] ${result.title} — ${result.url}`;
      if (result.date) content += ` (${result.date})`;
      content += "\n";
    });
  }

  return { content: [{ type: "text", text: content }], isError: false };
}
