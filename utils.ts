/**
 * Shared utility functions and types for the Perplexity MCP Server.
 * This module contains testable code without side effects.
 */

// Configuration constants
export const DEFAULT_TIMEOUT_MS = 300000;
export const MAX_DOMAIN_FILTERS = 20;
export const MAX_BATCH_QUERIES = 5;
export const DEFAULT_MODEL = "sonar-pro";

// API Response Type Interfaces

/** Individual search result from the Perplexity Search API */
export interface PerplexitySearchResult {
  title: string;
  url: string;
  snippet?: string;
  date?: string;
}

/** Response from the Perplexity Search API */
export interface PerplexitySearchResponse {
  results: PerplexitySearchResult[];
}

/** Image object in chat completion responses */
export interface PerplexityImage {
  url: string;
  origin_url: string;
  height: number;
  width: number;
}

/** Message object in chat completion choices */
export interface PerplexityChatMessage {
  role: string;
  content: string;
}

/** Choice object in chat completion responses */
export interface PerplexityChatChoice {
  index: number;
  message: PerplexityChatMessage;
  finish_reason?: string;
}

/** Response from the Perplexity Chat Completions API */
export interface PerplexityChatResponse {
  id: string;
  model: string;
  choices: PerplexityChatChoice[];
  citations?: string[];
  images?: PerplexityImage[];
  related_questions?: string[];
}

/** Response from the Perplexity Async Research Status API */
export interface PerplexityAsyncStatusResponse {
  request_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  created_at?: string;
  completed_at?: string;
  choices?: PerplexityChatChoice[];
  citations?: string[];
  error?: string;
}

/** Request body for the Perplexity Search API */
export interface PerplexitySearchRequestBody {
  query: string;
  max_results: number;
  max_tokens_per_page: number;
  country?: string;
  search_domain_filter?: string[];
  search_recency_filter?: string;
  search_after_date_filter?: string;
  search_before_date_filter?: string;
  last_updated_after?: string;
  last_updated_before?: string;
}

/** Options returned by buildCommonOptions */
export interface CommonOptions {
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

/**
 * Builds common options from tool arguments with validation.
 * Extracts and validates shared parameters used across multiple tools.
 *
 * @param {Record<string, unknown>} args - The tool arguments.
 * @returns {CommonOptions} The validated options object.
 */
export function buildCommonOptions(args: Record<string, unknown>): CommonOptions {
  const options: CommonOptions = {};

  // Extract and validate search_domain_filter
  if (Array.isArray(args.search_domain_filter)) {
    const filtered = args.search_domain_filter.filter((d): d is string => typeof d === "string");
    if (filtered.length > 0) {
      options.search_domain_filter = filtered;
    }
  }

  // Extract numeric parameters with type checking
  if (typeof args.temperature === "number") {
    options.temperature = args.temperature;
  }
  if (typeof args.max_tokens === "number") {
    options.max_tokens = args.max_tokens;
  }
  if (typeof args.top_p === "number") {
    options.top_p = args.top_p;
  }
  if (typeof args.top_k === "number") {
    options.top_k = args.top_k;
  }

  // Extract search_mode with validation
  if (typeof args.search_mode === "string" && ["web", "academic", "sec"].includes(args.search_mode)) {
    options.search_mode = args.search_mode as "web" | "academic" | "sec";
  }

  // Extract search_recency_filter with validation
  if (typeof args.search_recency_filter === "string" && ["day", "week", "month", "year"].includes(args.search_recency_filter)) {
    options.search_recency_filter = args.search_recency_filter as "day" | "week" | "month" | "year";
  }

  // Extract date filters
  if (typeof args.search_after_date === "string") {
    options.search_after_date = args.search_after_date;
  }
  if (typeof args.search_before_date === "string") {
    options.search_before_date = args.search_before_date;
  }
  if (typeof args.last_updated_after === "string") {
    options.last_updated_after = args.last_updated_after;
  }
  if (typeof args.last_updated_before === "string") {
    options.last_updated_before = args.last_updated_before;
  }

  // Extract boolean options
  if (args.return_images === true) {
    options.return_images = true;
  }
  if (args.return_related_questions === true) {
    options.return_related_questions = true;
  }

  return options;
}

/**
 * Formats search results into a readable string.
 *
 * @param {PerplexitySearchResponse} data - The search response data.
 * @returns {string} Formatted search results.
 */
export function formatSearchResults(data: PerplexitySearchResponse): string {
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
 * @param {Array<{query: string, data: PerplexitySearchResponse | null, error: string | null}>} results - The search results per query.
 * @returns {string} Formatted multi-query search results.
 */
export function formatMultiQueryResults(
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
