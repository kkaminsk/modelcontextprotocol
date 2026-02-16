#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";

/**
 * Definition of the Perplexity Ask Tool.
 * This tool accepts an array of messages and returns a chat completion response
 * from the Perplexity API, with citations appended to the message if provided.
 */
const PERPLEXITY_ASK_TOOL: Tool = {
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
            role: {
              type: "string",
              description: "Role of the message (e.g., system, user, assistant)",
            },
            content: {
              type: "string",
              description: "The content of the message",
            },
          },
          required: ["role", "content"],
        },
        description: "Array of conversation messages",
      },
      model: {
        type: "string",
        enum: ["sonar", "sonar-pro"],
        description: "Model to use: 'sonar' for fast/cost-effective queries, 'sonar-pro' for higher quality (default)",
      },
      search_domain_filter: {
        type: "array",
        items: { type: "string" },
        maxItems: 20,
        description: "Domain filter list. Prefix with '-' to exclude (denylist), otherwise include (allowlist). Maximum 20 domains. Examples: ['wikipedia.org', 'github.com'] for allowlist, ['-reddit.com', '-twitter.com'] for denylist.",
      },
      temperature: {
        type: "number",
        minimum: 0,
        maximum: 2,
        description: "Controls randomness. 0 = deterministic, 2 = maximum creativity. Default: 0.2",
      },
      max_tokens: {
        type: "integer",
        minimum: 1,
        description: "Maximum tokens in the response. Model-specific limits apply.",
      },
      top_p: {
        type: "number",
        minimum: 0,
        maximum: 1,
        description: "Nucleus sampling threshold. Default: 0.9",
      },
      top_k: {
        type: "integer",
        minimum: 0,
        description: "Top-k sampling. 0 = disabled. Default: 0",
      },
      search_mode: {
        type: "string",
        enum: ["web", "academic", "sec"],
        description: "Source type filter: 'web' for general internet (default), 'academic' for scholarly articles and papers, 'sec' for SEC filings and financial documents",
      },
      search_recency_filter: {
        type: "string",
        enum: ["day", "week", "month", "year"],
        description: "Filter results by recency. 'day' = last 24 hours, 'week' = last 7 days, 'month' = last 30 days, 'year' = last 365 days.",
      },
      search_after_date: {
        type: "string",
        pattern: "^\\d{2}/\\d{2}/\\d{4}$",
        description: "Only include results published after this date. Format: MM/DD/YYYY",
      },
      search_before_date: {
        type: "string",
        pattern: "^\\d{2}/\\d{2}/\\d{4}$",
        description: "Only include results published before this date. Format: MM/DD/YYYY",
      },
      last_updated_after: {
        type: "string",
        pattern: "^\\d{2}/\\d{2}/\\d{4}$",
        description: "Only include results last updated after this date. Format: MM/DD/YYYY",
      },
      last_updated_before: {
        type: "string",
        pattern: "^\\d{2}/\\d{2}/\\d{4}$",
        description: "Only include results last updated before this date. Format: MM/DD/YYYY",
      },
      stream: {
        type: "boolean",
        description: "Enable streaming responses. When true, response is delivered incrementally. Default: false",
      },
      return_images: {
        type: "boolean",
        description: "Include relevant images from search results in the response. Default: false",
      },
      return_related_questions: {
        type: "boolean",
        description: "Include related question suggestions for follow-up queries. Default: false",
      },
    },
    required: ["messages"],
  },
};

/**
 * Definition of the Perplexity Research Tool.
 * This tool performs deep research queries using the Perplexity API.
 */
const PERPLEXITY_RESEARCH_TOOL: Tool = {
  name: "perplexity_research",
  description:
    "Performs deep research using the Perplexity API. " +
    "Accepts an array of messages (each with a role and content) " +
    "and returns a comprehensive research response with citations.",
  inputSchema: {
    type: "object",
    properties: {
      messages: {
        type: "array",
        items: {
          type: "object",
          properties: {
            role: {
              type: "string",
              description: "Role of the message (e.g., system, user, assistant)",
            },
            content: {
              type: "string",
              description: "The content of the message",
            },
          },
          required: ["role", "content"],
        },
        description: "Array of conversation messages",
      },
      reasoning_effort: {
        type: "string",
        enum: ["low", "medium", "high"],
        description: "Controls research depth: 'low' for quick overviews, 'medium' for balanced research (default), 'high' for comprehensive deep research",
      },
      search_domain_filter: {
        type: "array",
        items: { type: "string" },
        maxItems: 20,
        description: "Domain filter list. Prefix with '-' to exclude (denylist), otherwise include (allowlist). Maximum 20 domains. Examples: ['wikipedia.org', 'github.com'] for allowlist, ['-reddit.com', '-twitter.com'] for denylist.",
      },
      temperature: {
        type: "number",
        minimum: 0,
        maximum: 2,
        description: "Controls randomness. 0 = deterministic, 2 = maximum creativity. Default: 0.2",
      },
      max_tokens: {
        type: "integer",
        minimum: 1,
        description: "Maximum tokens in the response. Model-specific limits apply.",
      },
      top_p: {
        type: "number",
        minimum: 0,
        maximum: 1,
        description: "Nucleus sampling threshold. Default: 0.9",
      },
      top_k: {
        type: "integer",
        minimum: 0,
        description: "Top-k sampling. 0 = disabled. Default: 0",
      },
      search_mode: {
        type: "string",
        enum: ["web", "academic", "sec"],
        description: "Source type filter: 'web' for general internet (default), 'academic' for scholarly articles and papers, 'sec' for SEC filings and financial documents",
      },
      search_recency_filter: {
        type: "string",
        enum: ["day", "week", "month", "year"],
        description: "Filter results by recency. 'day' = last 24 hours, 'week' = last 7 days, 'month' = last 30 days, 'year' = last 365 days.",
      },
      search_after_date: {
        type: "string",
        pattern: "^\\d{2}/\\d{2}/\\d{4}$",
        description: "Only include results published after this date. Format: MM/DD/YYYY",
      },
      search_before_date: {
        type: "string",
        pattern: "^\\d{2}/\\d{2}/\\d{4}$",
        description: "Only include results published before this date. Format: MM/DD/YYYY",
      },
      last_updated_after: {
        type: "string",
        pattern: "^\\d{2}/\\d{2}/\\d{4}$",
        description: "Only include results last updated after this date. Format: MM/DD/YYYY",
      },
      last_updated_before: {
        type: "string",
        pattern: "^\\d{2}/\\d{2}/\\d{4}$",
        description: "Only include results last updated before this date. Format: MM/DD/YYYY",
      },
      return_images: {
        type: "boolean",
        description: "Include relevant images from search results in the response. Default: false",
      },
      return_related_questions: {
        type: "boolean",
        description: "Include related question suggestions for follow-up queries. Default: false",
      },
    },
    required: ["messages"],
  },
};

/**
 * Definition of the Perplexity Reason Tool.
 * This tool performs reasoning queries using the Perplexity API.
 */
const PERPLEXITY_REASON_TOOL: Tool = {
  name: "perplexity_reason",
  description:
    "Performs reasoning tasks using the Perplexity API. " +
    "Accepts an array of messages (each with a role and content) " +
    "and returns a well-reasoned response using the sonar-reasoning-pro model.",
  inputSchema: {
    type: "object",
    properties: {
      messages: {
        type: "array",
        items: {
          type: "object",
          properties: {
            role: {
              type: "string",
              description: "Role of the message (e.g., system, user, assistant)",
            },
            content: {
              type: "string",
              description: "The content of the message",
            },
          },
          required: ["role", "content"],
        },
        description: "Array of conversation messages",
      },
      search_domain_filter: {
        type: "array",
        items: { type: "string" },
        maxItems: 20,
        description: "Domain filter list. Prefix with '-' to exclude (denylist), otherwise include (allowlist). Maximum 20 domains. Examples: ['wikipedia.org', 'github.com'] for allowlist, ['-reddit.com', '-twitter.com'] for denylist.",
      },
      temperature: {
        type: "number",
        minimum: 0,
        maximum: 2,
        description: "Controls randomness. 0 = deterministic, 2 = maximum creativity. Default: 0.2",
      },
      max_tokens: {
        type: "integer",
        minimum: 1,
        description: "Maximum tokens in the response. Model-specific limits apply.",
      },
      top_p: {
        type: "number",
        minimum: 0,
        maximum: 1,
        description: "Nucleus sampling threshold. Default: 0.9",
      },
      top_k: {
        type: "integer",
        minimum: 0,
        description: "Top-k sampling. 0 = disabled. Default: 0",
      },
      search_mode: {
        type: "string",
        enum: ["web", "academic", "sec"],
        description: "Source type filter: 'web' for general internet (default), 'academic' for scholarly articles and papers, 'sec' for SEC filings and financial documents",
      },
      search_recency_filter: {
        type: "string",
        enum: ["day", "week", "month", "year"],
        description: "Filter results by recency. 'day' = last 24 hours, 'week' = last 7 days, 'month' = last 30 days, 'year' = last 365 days.",
      },
      search_after_date: {
        type: "string",
        pattern: "^\\d{2}/\\d{2}/\\d{4}$",
        description: "Only include results published after this date. Format: MM/DD/YYYY",
      },
      search_before_date: {
        type: "string",
        pattern: "^\\d{2}/\\d{2}/\\d{4}$",
        description: "Only include results published before this date. Format: MM/DD/YYYY",
      },
      last_updated_after: {
        type: "string",
        pattern: "^\\d{2}/\\d{2}/\\d{4}$",
        description: "Only include results last updated after this date. Format: MM/DD/YYYY",
      },
      last_updated_before: {
        type: "string",
        pattern: "^\\d{2}/\\d{2}/\\d{4}$",
        description: "Only include results last updated before this date. Format: MM/DD/YYYY",
      },
      stream: {
        type: "boolean",
        description: "Enable streaming responses. When true, response is delivered incrementally. Default: false",
      },
    },
    required: ["messages"],
  },
};

/**
 * Definition of the Perplexity Search Tool.
 * This tool performs web search using the Perplexity Search API.
 */
const PERPLEXITY_SEARCH_TOOL: Tool = {
  name: "perplexity_search",
  description:
    "Performs web search using the Perplexity Search API. " +
    "Supports single query or batch of up to 5 queries. " +
    "Returns ranked search results with titles, URLs, snippets, and metadata.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        oneOf: [
          { type: "string", description: "Single search query" },
          {
            type: "array",
            items: { type: "string" },
            minItems: 1,
            maxItems: 5,
            description: "Array of up to 5 search queries"
          }
        ],
        description: "Search query or array of queries (max 5)",
      },
      max_results: {
        type: "number",
        description: "Maximum number of results to return (1-20, default: 10)",
        minimum: 1,
        maximum: 20,
      },
      max_tokens_per_page: {
        type: "number",
        description: "Maximum tokens to extract per webpage (default: 1024)",
        minimum: 256,
        maximum: 2048,
      },
      country: {
        type: "string",
        description: "ISO 3166-1 alpha-2 country code for regional results (e.g., 'US', 'GB')",
      },
      search_domain_filter: {
        type: "array",
        items: { type: "string" },
        maxItems: 20,
        description: "Domain filter list. Prefix with '-' to exclude (denylist), otherwise include (allowlist). Maximum 20 domains. Examples: ['wikipedia.org', 'github.com'] for allowlist, ['-reddit.com', '-twitter.com'] for denylist.",
      },
      search_recency_filter: {
        type: "string",
        enum: ["day", "week", "month", "year"],
        description: "Filter results by recency. 'day' = last 24 hours, 'week' = last 7 days, 'month' = last 30 days, 'year' = last 365 days.",
      },
      search_after_date: {
        type: "string",
        pattern: "^\\d{2}/\\d{2}/\\d{4}$",
        description: "Only include results published after this date. Format: MM/DD/YYYY",
      },
      search_before_date: {
        type: "string",
        pattern: "^\\d{2}/\\d{2}/\\d{4}$",
        description: "Only include results published before this date. Format: MM/DD/YYYY",
      },
      last_updated_after: {
        type: "string",
        pattern: "^\\d{2}/\\d{2}/\\d{4}$",
        description: "Only include results last updated after this date. Format: MM/DD/YYYY",
      },
      last_updated_before: {
        type: "string",
        pattern: "^\\d{2}/\\d{2}/\\d{4}$",
        description: "Only include results last updated before this date. Format: MM/DD/YYYY",
      },
    },
    required: ["query"],
  },
};

/**
 * Definition of the Perplexity Async Research Tool.
 * This tool starts an async deep research job and returns a request_id for polling.
 */
const PERPLEXITY_RESEARCH_ASYNC_TOOL: Tool = {
  name: "perplexity_research_async",
  description:
    "Start an async deep research job. Returns a request_id to poll for results. " +
    "Use for complex research that may take several minutes. " +
    "Poll with perplexity_research_status to check progress and retrieve results.",
  inputSchema: {
    type: "object",
    properties: {
      messages: {
        type: "array",
        items: {
          type: "object",
          properties: {
            role: {
              type: "string",
              description: "Role of the message (e.g., system, user, assistant)",
            },
            content: {
              type: "string",
              description: "The content of the message",
            },
          },
          required: ["role", "content"],
        },
        description: "Array of conversation messages",
      },
      reasoning_effort: {
        type: "string",
        enum: ["low", "medium", "high"],
        description: "Controls research depth: 'low' for quick overviews, 'medium' for balanced research (default), 'high' for comprehensive deep research",
      },
      search_domain_filter: {
        type: "array",
        items: { type: "string" },
        maxItems: 20,
        description: "Domain filter list. Prefix with '-' to exclude (denylist), otherwise include (allowlist). Maximum 20 domains.",
      },
    },
    required: ["messages"],
  },
};

/**
 * Definition of the Perplexity Research Status Tool.
 * This tool checks the status of an async research job and retrieves results when complete.
 */
const PERPLEXITY_RESEARCH_STATUS_TOOL: Tool = {
  name: "perplexity_research_status",
  description:
    "Check status of an async research job and retrieve results when complete. " +
    "Use the request_id returned from perplexity_research_async.",
  inputSchema: {
    type: "object",
    properties: {
      request_id: {
        type: "string",
        description: "The request_id returned from perplexity_research_async",
      },
    },
    required: ["request_id"],
  },
};

// --- TypeScript interfaces for API responses ---

interface PerplexityMessage {
  role: string;
  content: string;
}

interface PerplexityChatChoice {
  message: PerplexityMessage;
  index: number;
  finish_reason: string;
}

interface PerplexityChatResponse {
  choices: PerplexityChatChoice[];
  citations?: string[];
  images?: Array<{ url: string; origin_url: string; height: number; width: number }>;
  related_questions?: string[];
}

interface PerplexitySearchResult {
  title: string;
  url: string;
  snippet?: string;
  date?: string;
}

interface PerplexitySearchResponse {
  results?: PerplexitySearchResult[];
}

interface PerplexityAsyncResponse {
  request_id: string;
  status: string;
  created_at?: string;
  completed_at?: string;
  error?: string;
  choices?: PerplexityChatChoice[];
  citations?: string[];
}

interface CommonOptions {
  reasoning_effort?: "low" | "medium" | "high";
  search_domain_filter?: string[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  top_k?: number;
  search_mode?: "web" | "academic" | "sec";
  search_recency_filter?: "day" | "week" | "month" | "year";
  search_after_date?: string;
  search_before_date?: string;
  last_updated_after?: string;
  last_updated_before?: string;
  return_images?: boolean;
  return_related_questions?: boolean;
}

// --- Shared helpers ---

/**
 * Validates that each message in the array has string `role` and `content` properties.
 */
function validateMessages(messages: unknown[]): messages is Array<{ role: string; content: string }> {
  return messages.every(
    (msg) =>
      typeof msg === "object" &&
      msg !== null &&
      typeof (msg as Record<string, unknown>).role === "string" &&
      typeof (msg as Record<string, unknown>).content === "string"
  );
}

/**
 * Extracts and validates common options from tool call arguments.
 * Eliminates duplication across tool handlers.
 */
function buildCommonOptions(args: Record<string, unknown>): CommonOptions {
  const options: CommonOptions = {};

  const searchDomainFilter = Array.isArray(args.search_domain_filter)
    ? args.search_domain_filter.filter((d): d is string => typeof d === "string")
    : undefined;
  if (searchDomainFilter && searchDomainFilter.length > 0) options.search_domain_filter = searchDomainFilter;

  if (typeof args.temperature === "number") options.temperature = args.temperature;
  if (typeof args.max_tokens === "number") options.max_tokens = args.max_tokens;
  if (typeof args.top_p === "number") options.top_p = args.top_p;
  if (typeof args.top_k === "number") options.top_k = args.top_k;

  if (typeof args.search_mode === "string" && ["web", "academic", "sec"].includes(args.search_mode)) {
    options.search_mode = args.search_mode as CommonOptions["search_mode"];
  }
  if (typeof args.search_recency_filter === "string" && ["day", "week", "month", "year"].includes(args.search_recency_filter)) {
    options.search_recency_filter = args.search_recency_filter as CommonOptions["search_recency_filter"];
  }
  if (typeof args.search_after_date === "string") options.search_after_date = args.search_after_date;
  if (typeof args.search_before_date === "string") options.search_before_date = args.search_before_date;
  if (typeof args.last_updated_after === "string") options.last_updated_after = args.last_updated_after;
  if (typeof args.last_updated_before === "string") options.last_updated_before = args.last_updated_before;
  if (args.return_images === true) options.return_images = true;
  if (args.return_related_questions === true) options.return_related_questions = true;

  if (typeof args.reasoning_effort === "string" && ["low", "medium", "high"].includes(args.reasoning_effort)) {
    options.reasoning_effort = args.reasoning_effort as CommonOptions["reasoning_effort"];
  }

  return options;
}

// Retrieve the Perplexity API key from environment variables
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY;
if (!PERPLEXITY_API_KEY) {
  console.error("Error: PERPLEXITY_API_KEY environment variable is required");
  process.exit(1);
}

// Configure timeout for API requests (default: 5 minutes)
// Can be overridden via PERPLEXITY_TIMEOUT_MS environment variable
const TIMEOUT_MS = parseInt(process.env.PERPLEXITY_TIMEOUT_MS || "300000", 10);

/**
 * Performs a chat completion by sending a request to the Perplexity API.
 * Appends citations to the returned message content if they exist.
 *
 * @param {Array<{ role: string; content: string }>} messages - An array of message objects.
 * @param {string} model - The model to use for the completion.
 * @param {object} options - Additional options for the API request.
 * @param {string} options.reasoning_effort - Controls research depth for sonar-deep-research model.
 * @param {string[]} options.search_domain_filter - Domain filter list for search results.
 * @param {number} options.temperature - Controls randomness (0-2).
 * @param {number} options.max_tokens - Maximum tokens in the response.
 * @param {number} options.top_p - Nucleus sampling threshold (0-1).
 * @param {number} options.top_k - Top-k sampling (0 = disabled).
 * @param {string} options.search_mode - Source type filter (web, academic, sec).
 * @param {string} options.search_recency_filter - Filter by recency (day, week, month, year).
 * @param {string} options.search_after_date - Only results after this date (MM/DD/YYYY).
 * @param {string} options.search_before_date - Only results before this date (MM/DD/YYYY).
 * @param {string} options.last_updated_after - Only results updated after this date (MM/DD/YYYY).
 * @param {string} options.last_updated_before - Only results updated before this date (MM/DD/YYYY).
 * @returns {Promise<string>} The chat completion result with appended citations.
 * @throws Will throw an error if the API request fails.
 */
async function performChatCompletion(
  messages: Array<{ role: string; content: string }>,
  model: string = "sonar-pro",
  options?: {
    reasoning_effort?: "low" | "medium" | "high";
    search_domain_filter?: string[];
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    top_k?: number;
    search_mode?: "web" | "academic" | "sec";
    search_recency_filter?: "day" | "week" | "month" | "year";
    search_after_date?: string;
    search_before_date?: string;
    last_updated_after?: string;
    last_updated_before?: string;
    return_images?: boolean;
    return_related_questions?: boolean;
  }
): Promise<string> {
  const url = "https://api.perplexity.ai/chat/completions";
  const body: Record<string, unknown> = {
    model: model, // Model identifier passed as parameter
    messages: messages,
  };

  // Add reasoning_effort if provided (applicable for sonar-deep-research model)
  if (options?.reasoning_effort) {
    body.reasoning_effort = options.reasoning_effort;
  }

  // Add search_domain_filter if provided
  if (options?.search_domain_filter && options.search_domain_filter.length > 0) {
    if (options.search_domain_filter.length > 20) {
      throw new Error("search_domain_filter cannot exceed 20 domains");
    }
    body.search_domain_filter = options.search_domain_filter;
  }

  // Add generation parameters if provided
  if (options?.temperature !== undefined) {
    if (options.temperature < 0 || options.temperature > 2) {
      throw new Error("temperature must be between 0 and 2");
    }
    body.temperature = options.temperature;
  }
  if (options?.max_tokens !== undefined) {
    if (options.max_tokens < 1) {
      throw new Error("max_tokens must be at least 1");
    }
    body.max_tokens = options.max_tokens;
  }
  if (options?.top_p !== undefined) {
    if (options.top_p < 0 || options.top_p > 1) {
      throw new Error("top_p must be between 0 and 1");
    }
    body.top_p = options.top_p;
  }
  if (options?.top_k !== undefined) {
    if (options.top_k < 0) {
      throw new Error("top_k must be non-negative");
    }
    body.top_k = options.top_k;
  }

  // Add search_mode if provided
  if (options?.search_mode) {
    body.search_mode = options.search_mode;
  }

  // Add date filtering parameters if provided
  if (options?.search_recency_filter) {
    body.search_recency_filter = options.search_recency_filter;
  }
  if (options?.search_after_date) {
    body.search_after_date_filter = options.search_after_date;
  }
  if (options?.search_before_date) {
    body.search_before_date_filter = options.search_before_date;
  }
  if (options?.last_updated_after) {
    body.last_updated_after = options.last_updated_after;
  }
  if (options?.last_updated_before) {
    body.last_updated_before = options.last_updated_before;
  }

  // Add return_images and return_related_questions if provided
  if (options?.return_images) {
    body.return_images = true;
  }
  if (options?.return_related_questions) {
    body.return_related_questions = true;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout: Perplexity API did not respond within ${TIMEOUT_MS}ms. Consider increasing PERPLEXITY_TIMEOUT_MS.`);
    }
    throw new Error(`Network error while calling Perplexity API: ${error}`);
  }

  if (!response.ok) {
    let errorText;
    try {
      errorText = await response.text();
    } catch (parseError) {
      errorText = "Unable to parse error response";
    }
    throw new Error(
      `Perplexity API error: ${response.status} ${response.statusText}\n${errorText}`
    );
  }

  let data: PerplexityChatResponse;
  try {
    data = await response.json() as PerplexityChatResponse;
  } catch (jsonError) {
    throw new Error(`Failed to parse JSON response from Perplexity API: ${jsonError}`);
  }

  let messageContent = data.choices[0].message.content;

  // If citations are provided, append them to the message content
  if (data.citations && Array.isArray(data.citations) && data.citations.length > 0) {
    messageContent += "\n\nCitations:\n";
    data.citations.forEach((citation: string, index: number) => {
      messageContent += `[${index + 1}] ${citation}\n`;
    });
  }

  // If images are provided, append them to the message content
  if (data.images && Array.isArray(data.images) && data.images.length > 0) {
    messageContent += "\n\nImages:\n";
    data.images.forEach((img: { url: string; origin_url: string; height: number; width: number }, index: number) => {
      messageContent += `[${index + 1}] ${img.url} (${img.width}x${img.height}) - Source: ${img.origin_url}\n`;
    });
  }

  // If related questions are provided, append them to the message content
  if (data.related_questions && Array.isArray(data.related_questions) && data.related_questions.length > 0) {
    messageContent += "\n\nRelated Questions:\n";
    data.related_questions.forEach((question: string, index: number) => {
      messageContent += `${index + 1}. ${question}\n`;
    });
  }

  return messageContent;
}

/**
 * Performs a streaming chat completion by sending a request to the Perplexity API.
 * Streams content incrementally and returns the full response with citations.
 *
 * @param {Array<{ role: string; content: string }>} messages - An array of message objects.
 * @param {string} model - The model to use for the completion.
 * @param {object} options - Additional options for the API request.
 * @returns {Promise<string>} The chat completion result with appended citations.
 * @throws Will throw an error if the API request fails.
 */
async function performStreamingChatCompletion(
  messages: Array<{ role: string; content: string }>,
  model: string = "sonar-pro",
  options?: {
    search_domain_filter?: string[];
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
    top_k?: number;
    search_mode?: "web" | "academic" | "sec";
    search_recency_filter?: "day" | "week" | "month" | "year";
    search_after_date?: string;
    search_before_date?: string;
    last_updated_after?: string;
    last_updated_before?: string;
    return_images?: boolean;
    return_related_questions?: boolean;
  }
): Promise<string> {
  const url = "https://api.perplexity.ai/chat/completions";
  const body: Record<string, unknown> = {
    model: model,
    messages: messages,
    stream: true,
  };

  // Add search_domain_filter if provided
  if (options?.search_domain_filter && options.search_domain_filter.length > 0) {
    if (options.search_domain_filter.length > 20) {
      throw new Error("search_domain_filter cannot exceed 20 domains");
    }
    body.search_domain_filter = options.search_domain_filter;
  }

  // Add generation parameters if provided
  if (options?.temperature !== undefined) {
    if (options.temperature < 0 || options.temperature > 2) {
      throw new Error("temperature must be between 0 and 2");
    }
    body.temperature = options.temperature;
  }
  if (options?.max_tokens !== undefined) {
    if (options.max_tokens < 1) {
      throw new Error("max_tokens must be at least 1");
    }
    body.max_tokens = options.max_tokens;
  }
  if (options?.top_p !== undefined) {
    if (options.top_p < 0 || options.top_p > 1) {
      throw new Error("top_p must be between 0 and 1");
    }
    body.top_p = options.top_p;
  }
  if (options?.top_k !== undefined) {
    if (options.top_k < 0) {
      throw new Error("top_k must be non-negative");
    }
    body.top_k = options.top_k;
  }

  // Add search_mode if provided
  if (options?.search_mode) {
    body.search_mode = options.search_mode;
  }

  // Add date filtering parameters if provided
  if (options?.search_recency_filter) {
    body.search_recency_filter = options.search_recency_filter;
  }
  if (options?.search_after_date) {
    body.search_after_date_filter = options.search_after_date;
  }
  if (options?.search_before_date) {
    body.search_before_date_filter = options.search_before_date;
  }
  if (options?.last_updated_after) {
    body.last_updated_after = options.last_updated_after;
  }
  if (options?.last_updated_before) {
    body.last_updated_before = options.last_updated_before;
  }

  // Add return_images and return_related_questions if provided
  if (options?.return_images) {
    body.return_images = true;
  }
  if (options?.return_related_questions) {
    body.return_related_questions = true;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    // Don't clear timeout — keep it active during stream reading
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout: Perplexity API did not respond within ${TIMEOUT_MS}ms. Consider increasing PERPLEXITY_TIMEOUT_MS.`);
    }
    throw new Error(`Network error while calling Perplexity API: ${error}`);
  }

  if (!response.ok) {
    clearTimeout(timeoutId);
    let errorText;
    try {
      errorText = await response.text();
    } catch (parseError) {
      errorText = "Unable to parse error response";
    }
    throw new Error(
      `Perplexity API error: ${response.status} ${response.statusText}\n${errorText}`
    );
  }

  const reader = response.body?.getReader();
  if (!reader) {
    clearTimeout(timeoutId);
    throw new Error("No response body available for streaming");
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let fullContent = "";
  let citations: string[] = [];
  let images: Array<{ url: string; origin_url: string; height: number; width: number }> = [];
  let relatedQuestions: string[] = [];

  // Reset timeout on each chunk to act as inactivity timeout
  const resetStreamTimeout = () => {
    clearTimeout(timeoutId);
    // Note: reuse the same controller but set a new timeout
    return setTimeout(() => controller.abort(), TIMEOUT_MS);
  };
  let streamTimeoutId = resetStreamTimeout();

  try {
    while (true) {
      const { done, value } = await reader.read();
      streamTimeoutId = resetStreamTimeout();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6).trim();
          if (data === "[DONE]") {
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullContent += content;
            }
            // Capture citations from the final message if available
            if (parsed.citations && Array.isArray(parsed.citations)) {
              citations = parsed.citations;
            }
            // Capture images from the final message if available
            if (parsed.images && Array.isArray(parsed.images)) {
              images = parsed.images;
            }
            // Capture related questions from the final message if available
            if (parsed.related_questions && Array.isArray(parsed.related_questions)) {
              relatedQuestions = parsed.related_questions;
            }
          } catch {
            // Skip invalid JSON lines
          }
        }
      }
    }
  } catch (error) {
    clearTimeout(streamTimeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Stream timeout: No data received within ${TIMEOUT_MS}ms. Consider increasing PERPLEXITY_TIMEOUT_MS.`);
    }
    throw error;
  } finally {
    clearTimeout(streamTimeoutId);
    reader.releaseLock();
  }

  // Append citations if available
  if (citations.length > 0) {
    fullContent += "\n\nCitations:\n";
    citations.forEach((citation: string, index: number) => {
      fullContent += `[${index + 1}] ${citation}\n`;
    });
  }

  // Append images if available
  if (images.length > 0) {
    fullContent += "\n\nImages:\n";
    images.forEach((img, index) => {
      fullContent += `[${index + 1}] ${img.url} (${img.width}x${img.height}) - Source: ${img.origin_url}\n`;
    });
  }

  // Append related questions if available
  if (relatedQuestions.length > 0) {
    fullContent += "\n\nRelated Questions:\n";
    relatedQuestions.forEach((question, index) => {
      fullContent += `${index + 1}. ${question}\n`;
    });
  }

  return fullContent;
}

/**
 * Formats search results from the Perplexity Search API into a readable string.
 *
 * @param {any} data - The search response data from the API.
 * @returns {string} Formatted search results.
 */
function formatSearchResults(data: PerplexitySearchResponse): string {
  if (!data.results || !Array.isArray(data.results)) {
    return "No search results found.";
  }

  let formattedResults = `Found ${data.results.length} search results:\n\n`;
  
  data.results.forEach((result: PerplexitySearchResult, index: number) => {
    formattedResults += `${index + 1}. **${result.title}**\n`;
    formattedResults += `   URL: ${result.url}\n`;
    if (result.snippet) {
      formattedResults += `   ${result.snippet}\n`;
    }
    if (result.date) {
      formattedResults += `   Date: ${result.date}\n`;
    }
    formattedResults += `\n`;
  });

  return formattedResults;
}

/**
 * Formats multi-query search results into a readable string.
 *
 * @param {Array<{query: string, data: any, error: string | null}>} results - The search results per query.
 * @returns {string} Formatted multi-query search results.
 */
function formatMultiQueryResults(
  results: Array<{ query: string; data: PerplexitySearchResponse | null; error: string | null }>
): string {
  const sections = results.map((result, queryIndex) => {
    const header = `## Query ${queryIndex + 1}: "${result.query}"\n`;

    if (result.error) {
      return header + `\n**Error:** ${result.error}\n`;
    }

    if (!result.data?.results || !Array.isArray(result.data.results)) {
      return header + `\nNo search results found.\n`;
    }

    let formattedResults = `\nFound ${result.data.results.length} results:\n\n`;
    result.data.results.forEach((r: PerplexitySearchResult, index: number) => {
      formattedResults += `${index + 1}. **${r.title}**\n`;
      formattedResults += `   URL: ${r.url}\n`;
      if (r.snippet) {
        formattedResults += `   ${r.snippet}\n`;
      }
      if (r.date) {
        formattedResults += `   Date: ${r.date}\n`;
      }
      formattedResults += `\n`;
    });

    return header + formattedResults;
  });

  return sections.join("\n---\n\n");
}

/**
 * Performs a single web search using the Perplexity Search API.
 *
 * @param {string} query - The search query string.
 * @param {number} maxResults - Maximum number of results to return (1-20).
 * @param {number} maxTokensPerPage - Maximum tokens to extract per webpage.
 * @param {string} country - Optional ISO country code for regional results.
 * @param {string[]} searchDomainFilter - Domain filter list for search results.
 * @param {object} dateFilters - Optional date filtering parameters.
 * @returns {Promise<any>} The raw search results data.
 * @throws Will throw an error if the API request fails.
 */
async function performSingleSearch(
  query: string,
  maxResults: number = 10,
  maxTokensPerPage: number = 1024,
  country?: string,
  searchDomainFilter?: string[],
  dateFilters?: {
    search_recency_filter?: "day" | "week" | "month" | "year";
    search_after_date?: string;
    search_before_date?: string;
    last_updated_after?: string;
    last_updated_before?: string;
  }
): Promise<PerplexitySearchResponse> {
  const url = "https://api.perplexity.ai/search";
  const body: Record<string, unknown> = {
    query: query,
    max_results: maxResults,
    max_tokens_per_page: maxTokensPerPage,
  };

  if (country) {
    body.country = country;
  }

  if (searchDomainFilter && searchDomainFilter.length > 0) {
    if (searchDomainFilter.length > 20) {
      throw new Error("search_domain_filter cannot exceed 20 domains");
    }
    body.search_domain_filter = searchDomainFilter;
  }

  // Add date filtering parameters if provided
  if (dateFilters?.search_recency_filter) {
    body.search_recency_filter = dateFilters.search_recency_filter;
  }
  if (dateFilters?.search_after_date) {
    body.search_after_date_filter = dateFilters.search_after_date;
  }
  if (dateFilters?.search_before_date) {
    body.search_before_date_filter = dateFilters.search_before_date;
  }
  if (dateFilters?.last_updated_after) {
    body.last_updated_after = dateFilters.last_updated_after;
  }
  if (dateFilters?.last_updated_before) {
    body.last_updated_before = dateFilters.last_updated_before;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout: Perplexity Search API did not respond within ${TIMEOUT_MS}ms. Consider increasing PERPLEXITY_TIMEOUT_MS.`);
    }
    throw new Error(`Network error while calling Perplexity Search API: ${error}`);
  }

  if (!response.ok) {
    let errorText;
    try {
      errorText = await response.text();
    } catch (parseError) {
      errorText = "Unable to parse error response";
    }
    throw new Error(
      `Perplexity Search API error: ${response.status} ${response.statusText}\n${errorText}`
    );
  }

  let data: PerplexitySearchResponse;
  try {
    data = await response.json() as PerplexitySearchResponse;
  } catch (jsonError) {
    throw new Error(`Failed to parse JSON response from Perplexity Search API: ${jsonError}`);
  }

  return data;
}

/**
 * Performs web search using the Perplexity Search API.
 * Supports single query or batch of up to 5 queries.
 *
 * @param {string | string[]} query - The search query string or array of queries (max 5).
 * @param {number} maxResults - Maximum number of results per query to return (1-20).
 * @param {number} maxTokensPerPage - Maximum tokens to extract per webpage.
 * @param {string} country - Optional ISO country code for regional results.
 * @param {string[]} searchDomainFilter - Domain filter list for search results.
 * @param {object} dateFilters - Optional date filtering parameters.
 * @returns {Promise<string>} The formatted search results.
 * @throws Will throw an error if the API request fails or query count exceeds 5.
 */
async function performSearch(
  query: string | string[],
  maxResults: number = 10,
  maxTokensPerPage: number = 1024,
  country?: string,
  searchDomainFilter?: string[],
  dateFilters?: {
    search_recency_filter?: "day" | "week" | "month" | "year";
    search_after_date?: string;
    search_before_date?: string;
    last_updated_after?: string;
    last_updated_before?: string;
  }
): Promise<string> {
  const queries = Array.isArray(query) ? query : [query];

  if (queries.length === 0) {
    throw new Error("At least one query is required");
  }
  if (queries.length > 5) {
    throw new Error("Maximum 5 queries per request");
  }

  // Single query - return simple format
  if (queries.length === 1) {
    const data = await performSingleSearch(
      queries[0],
      maxResults,
      maxTokensPerPage,
      country,
      searchDomainFilter,
      dateFilters
    );
    return formatSearchResults(data);
  }

  // Multiple queries - execute in parallel and format grouped results
  const results = await Promise.all(
    queries.map(async (q) => {
      try {
        const data = await performSingleSearch(
          q,
          maxResults,
          maxTokensPerPage,
          country,
          searchDomainFilter,
          dateFilters
        );
        return { query: q, data, error: null };
      } catch (error) {
        return { query: q, data: null, error: error instanceof Error ? error.message : String(error) };
      }
    })
  );

  return formatMultiQueryResults(results);
}

/**
 * Starts an async deep research job using the Perplexity Async API.
 * Returns a request_id that can be used to poll for results.
 *
 * @param {Array<{ role: string; content: string }>} messages - An array of message objects.
 * @param {object} options - Additional options for the async research.
 * @param {string} options.reasoning_effort - Controls research depth (low, medium, high).
 * @param {string[]} options.search_domain_filter - Domain filter list for search results.
 * @returns {Promise<{ request_id: string; status: string }>} The async job info.
 * @throws Will throw an error if the API request fails.
 */
async function startAsyncResearch(
  messages: Array<{ role: string; content: string }>,
  options?: {
    reasoning_effort?: "low" | "medium" | "high";
    search_domain_filter?: string[];
  }
): Promise<{ request_id: string; status: string }> {
  const url = "https://api.perplexity.ai/async/chat/completions";
  const body: Record<string, unknown> = {
    model: "sonar-deep-research",
    messages: messages,
  };

  if (options?.reasoning_effort) {
    body.reasoning_effort = options.reasoning_effort;
  }

  if (options?.search_domain_filter && options.search_domain_filter.length > 0) {
    if (options.search_domain_filter.length > 20) {
      throw new Error("search_domain_filter cannot exceed 20 domains");
    }
    body.search_domain_filter = options.search_domain_filter;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout: Perplexity Async API did not respond within ${TIMEOUT_MS}ms.`);
    }
    throw new Error(`Network error while calling Perplexity Async API: ${error}`);
  }

  if (!response.ok) {
    let errorText;
    try {
      errorText = await response.text();
    } catch (parseError) {
      errorText = "Unable to parse error response";
    }
    throw new Error(
      `Perplexity Async API error: ${response.status} ${response.statusText}\n${errorText}`
    );
  }

  let data: PerplexityAsyncResponse;
  try {
    data = await response.json() as PerplexityAsyncResponse;
  } catch (jsonError) {
    throw new Error(`Failed to parse JSON response from Perplexity Async API: ${jsonError}`);
  }

  return {
    request_id: data.request_id,
    status: data.status || "pending",
  };
}

/**
 * Gets the status and results of an async research job.
 *
 * @param {string} requestId - The request_id from startAsyncResearch.
 * @returns {Promise<object>} The async job status and results.
 * @throws Will throw an error if the API request fails.
 */
async function getAsyncResearchStatus(
  requestId: string
): Promise<{
  request_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  created_at?: string;
  completed_at?: string;
  result?: string;
  error?: string;
}> {
  const url = `https://api.perplexity.ai/async/chat/completions/${encodeURIComponent(requestId)}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${PERPLEXITY_API_KEY}`,
      },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout: Perplexity Async API did not respond within ${TIMEOUT_MS}ms.`);
    }
    throw new Error(`Network error while calling Perplexity Async API: ${error}`);
  }

  if (!response.ok) {
    let errorText;
    try {
      errorText = await response.text();
    } catch (parseError) {
      errorText = "Unable to parse error response";
    }
    throw new Error(
      `Perplexity Async API error: ${response.status} ${response.statusText}\n${errorText}`
    );
  }

  let data: PerplexityAsyncResponse;
  try {
    data = await response.json() as PerplexityAsyncResponse;
  } catch (jsonError) {
    throw new Error(`Failed to parse JSON response from Perplexity Async API: ${jsonError}`);
  }

  const result: {
    request_id: string;
    status: "pending" | "processing" | "completed" | "failed";
    created_at?: string;
    completed_at?: string;
    result?: string;
    error?: string;
  } = {
    request_id: data.request_id,
    status: data.status as "pending" | "processing" | "completed" | "failed",
  };

  if (data.created_at) result.created_at = data.created_at;
  if (data.completed_at) result.completed_at = data.completed_at;
  if (data.error) result.error = data.error;

  // Format completed results with citations
  if (data.status === "completed" && data.choices && data.choices[0]) {
    let messageContent = data.choices[0].message.content;
    if (data.citations && Array.isArray(data.citations) && data.citations.length > 0) {
      messageContent += "\n\nCitations:\n";
      data.citations.forEach((citation: string, index: number) => {
        messageContent += `[${index + 1}] ${citation}\n`;
      });
    }
    result.result = messageContent;
  }

  return result;
}

// Initialize the server with tool metadata and capabilities
const server = new Server(
  {
    name: "@perplexity-ai/mcp-server",
    version: "0.2.3",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Registers a handler for listing available tools.
 * When the client requests a list of tools, this handler returns all available Perplexity tools.
 */
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    PERPLEXITY_ASK_TOOL,
    PERPLEXITY_RESEARCH_TOOL,
    PERPLEXITY_REASON_TOOL,
    PERPLEXITY_SEARCH_TOOL,
    PERPLEXITY_RESEARCH_ASYNC_TOOL,
    PERPLEXITY_RESEARCH_STATUS_TOOL,
  ],
}));

/**
 * Registers a handler for calling a specific tool.
 * Processes requests by validating input and invoking the appropriate tool.
 *
 * @param {object} request - The incoming tool call request.
 * @returns {Promise<object>} The response containing the tool's result or an error.
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;
    if (!args) {
      throw new Error("No arguments provided");
    }
    switch (name) {
      case "perplexity_ask": {
        if (!Array.isArray(args.messages)) {
          throw new Error("Invalid arguments for perplexity_ask: 'messages' must be an array");
        }
        if (!validateMessages(args.messages)) {
          throw new Error("Invalid message format: each message must have string 'role' and 'content' properties");
        }
        const messages = args.messages as Array<{ role: string; content: string }>;
        const model = typeof args.model === "string" && ["sonar", "sonar-pro"].includes(args.model)
          ? args.model
          : "sonar-pro";
        const useStreaming = args.stream === true;
        const options = buildCommonOptions(args as Record<string, unknown>);
        const optionsOrUndefined = Object.keys(options).length > 0 ? options : undefined;
        const result = useStreaming
          ? await performStreamingChatCompletion(messages, model, optionsOrUndefined)
          : await performChatCompletion(messages, model, optionsOrUndefined);
        return {
          content: [{ type: "text", text: result }],
          isError: false,
        };
      }
      case "perplexity_research": {
        if (!Array.isArray(args.messages)) {
          throw new Error("Invalid arguments for perplexity_research: 'messages' must be an array");
        }
        if (!validateMessages(args.messages)) {
          throw new Error("Invalid message format: each message must have string 'role' and 'content' properties");
        }
        const messages = args.messages as Array<{ role: string; content: string }>;
        const options = buildCommonOptions(args as Record<string, unknown>);
        const optionsOrUndefined = Object.keys(options).length > 0 ? options : undefined;
        const result = await performChatCompletion(messages, "sonar-deep-research", optionsOrUndefined);
        return {
          content: [{ type: "text", text: result }],
          isError: false,
        };
      }
      case "perplexity_reason": {
        if (!Array.isArray(args.messages)) {
          throw new Error("Invalid arguments for perplexity_reason: 'messages' must be an array");
        }
        if (!validateMessages(args.messages)) {
          throw new Error("Invalid message format: each message must have string 'role' and 'content' properties");
        }
        const messages = args.messages as Array<{ role: string; content: string }>;
        const useStreaming = args.stream === true;
        const options = buildCommonOptions(args as Record<string, unknown>);
        const optionsOrUndefined = Object.keys(options).length > 0 ? options : undefined;
        const result = useStreaming
          ? await performStreamingChatCompletion(messages, "sonar-reasoning-pro", optionsOrUndefined)
          : await performChatCompletion(messages, "sonar-reasoning-pro", optionsOrUndefined);
        return {
          content: [{ type: "text", text: result }],
          isError: false,
        };
      }
      case "perplexity_search": {
        // Validate query: must be string or array of strings
        const isValidQuery = typeof args.query === "string" ||
          (Array.isArray(args.query) && args.query.every((q: unknown) => typeof q === "string"));
        if (!isValidQuery) {
          throw new Error("Invalid arguments for perplexity_search: 'query' must be a string or array of strings");
        }
        // Validate array length if array
        if (Array.isArray(args.query) && args.query.length > 5) {
          throw new Error("Invalid arguments for perplexity_search: maximum 5 queries allowed");
        }
        const query = args.query as string | string[];
        const { max_results, max_tokens_per_page, country } = args;
        const maxResults = typeof max_results === "number" ? max_results : undefined;
        const maxTokensPerPage = typeof max_tokens_per_page === "number" ? max_tokens_per_page : undefined;
        const countryCode = typeof country === "string" ? country : undefined;
        const searchDomainFilter = Array.isArray(args.search_domain_filter)
          ? args.search_domain_filter.filter((d): d is string => typeof d === "string")
          : undefined;
        const dateFilters: Record<string, string> = {};
        if (typeof args.search_recency_filter === "string" && ["day", "week", "month", "year"].includes(args.search_recency_filter)) {
          dateFilters.search_recency_filter = args.search_recency_filter;
        }
        if (typeof args.search_after_date === "string") dateFilters.search_after_date = args.search_after_date;
        if (typeof args.search_before_date === "string") dateFilters.search_before_date = args.search_before_date;
        if (typeof args.last_updated_after === "string") dateFilters.last_updated_after = args.last_updated_after;
        if (typeof args.last_updated_before === "string") dateFilters.last_updated_before = args.last_updated_before;

        const result = await performSearch(
          query,
          maxResults,
          maxTokensPerPage,
          countryCode,
          searchDomainFilter,
          Object.keys(dateFilters).length > 0 ? dateFilters : undefined
        );
        return {
          content: [{ type: "text", text: result }],
          isError: false,
        };
      }
      case "perplexity_research_async": {
        if (!Array.isArray(args.messages)) {
          throw new Error("Invalid arguments for perplexity_research_async: 'messages' must be an array");
        }
        if (!validateMessages(args.messages)) {
          throw new Error("Invalid message format: each message must have string 'role' and 'content' properties");
        }
        const messages = args.messages as Array<{ role: string; content: string }>;
        const commonOpts = buildCommonOptions(args as Record<string, unknown>);
        const options: { reasoning_effort?: "low" | "medium" | "high"; search_domain_filter?: string[] } = {};
        if (commonOpts.reasoning_effort) options.reasoning_effort = commonOpts.reasoning_effort;
        if (commonOpts.search_domain_filter && commonOpts.search_domain_filter.length > 0) options.search_domain_filter = commonOpts.search_domain_filter;
        const result = await startAsyncResearch(
          messages,
          Object.keys(options).length > 0 ? options : undefined
        );
        return {
          content: [{
            type: "text",
            text: `Async research job started.\n\nRequest ID: ${result.request_id}\nStatus: ${result.status}\n\nUse perplexity_research_status with this request_id to check progress and retrieve results.`
          }],
          isError: false,
        };
      }
      case "perplexity_research_status": {
        if (typeof args.request_id !== "string") {
          throw new Error("Invalid arguments for perplexity_research_status: 'request_id' must be a string");
        }
        const statusResult = await getAsyncResearchStatus(args.request_id);
        let responseText = `Request ID: ${statusResult.request_id}\nStatus: ${statusResult.status}`;
        if (statusResult.created_at) responseText += `\nCreated: ${statusResult.created_at}`;
        if (statusResult.completed_at) responseText += `\nCompleted: ${statusResult.completed_at}`;
        if (statusResult.status === "failed" && statusResult.error) {
          responseText += `\nError: ${statusResult.error}`;
        }
        if (statusResult.status === "completed" && statusResult.result) {
          responseText += `\n\n--- Research Results ---\n\n${statusResult.result}`;
        }
        if (statusResult.status === "pending" || statusResult.status === "processing") {
          responseText += `\n\nThe research is still in progress. Please poll again in a few seconds.`;
        }
        return {
          content: [{ type: "text", text: responseText }],
          isError: false,
        };
      }
      default:
        // Respond with an error if an unknown tool is requested
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error) {
    // Return error details in the response
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error instanceof Error ? error.message : String(error)}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Initializes and runs the server using standard I/O for communication.
 * Logs an error and exits if the server fails to start.
 */
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

// Start the server and catch any startup errors
runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
