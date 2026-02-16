/**
 * Perplexity API client utilities.
 */

import { PerplexityChatResponse, PerplexitySearchResponse, PerplexityAsyncResponse, CommonOptions, DateFilters, AsyncResearchResult } from "../types/index.js";

/**
 * Build the request body for chat completions, applying common options.
 */
export function buildChatBody(
  messages: Array<{ role: string; content: string }>,
  model: string,
  options?: CommonOptions,
  stream?: boolean
): Record<string, unknown> {
  const body: Record<string, unknown> = { model, messages };

  if (stream) body.stream = true;

  if (options?.reasoning_effort) body.reasoning_effort = options.reasoning_effort;

  if (options?.search_domain_filter && options.search_domain_filter.length > 0) {
    if (options.search_domain_filter.length > 20) throw new Error("search_domain_filter cannot exceed 20 domains");
    body.search_domain_filter = options.search_domain_filter;
  }

  if (options?.temperature !== undefined) {
    if (options.temperature < 0 || options.temperature > 2) throw new Error("temperature must be between 0 and 2");
    body.temperature = options.temperature;
  }
  if (options?.max_tokens !== undefined) {
    if (options.max_tokens < 1) throw new Error("max_tokens must be at least 1");
    body.max_tokens = options.max_tokens;
  }
  if (options?.top_p !== undefined) {
    if (options.top_p < 0 || options.top_p > 1) throw new Error("top_p must be between 0 and 1");
    body.top_p = options.top_p;
  }
  if (options?.top_k !== undefined) {
    if (options.top_k < 0) throw new Error("top_k must be non-negative");
    body.top_k = options.top_k;
  }

  if (options?.search_mode) body.search_mode = options.search_mode;
  if (options?.search_recency_filter) body.search_recency_filter = options.search_recency_filter;
  if (options?.search_after_date) body.search_after_date_filter = options.search_after_date;
  if (options?.search_before_date) body.search_before_date_filter = options.search_before_date;
  if (options?.last_updated_after) body.last_updated_after = options.last_updated_after;
  if (options?.last_updated_before) body.last_updated_before = options.last_updated_before;
  if (options?.return_images) body.return_images = true;
  if (options?.return_related_questions) body.return_related_questions = true;
  if (options?.search_context_size) body.search_context_size = options.search_context_size;
  if (options?.output_level) body.output_level = options.output_level;
  if (options?.search_language_filter && options.search_language_filter.length > 0) {
    body.search_language_filter = options.search_language_filter;
  }
  if (options?.enable_search_classifier !== undefined) body.enable_search_classifier = options.enable_search_classifier;
  if (options?.disable_search) body.disable_search = true;
  if (options?.search_type) body.search_type = options.search_type;
  if (options?.response_format) body.response_format = options.response_format;

  return body;
}

/**
 * Format citations, images, and related questions onto message content.
 */
export function appendExtras(content: string, data: { citations?: string[]; images?: Array<{ url: string; origin_url: string; height: number; width: number }>; related_questions?: string[]; search_results?: Array<{ title: string; url: string; snippet?: string; date?: string }> }): string {
  let result = content;

  if (data.citations && data.citations.length > 0) {
    result += "\n\nCitations:\n";
    data.citations.forEach((citation, index) => {
      result += `[${index + 1}] ${citation}\n`;
    });
  }

  if (data.images && data.images.length > 0) {
    result += "\n\nImages:\n";
    data.images.forEach((img, index) => {
      result += `[${index + 1}] ${img.url} (${img.width}x${img.height}) - Source: ${img.origin_url}\n`;
    });
  }

  if (data.related_questions && data.related_questions.length > 0) {
    result += "\n\nRelated Questions:\n";
    data.related_questions.forEach((question, index) => {
      result += `${index + 1}. ${question}\n`;
    });
  }

  if (data.search_results && data.search_results.length > 0) {
    result += "\n\nSearch Results:\n";
    data.search_results.forEach((sr, index) => {
      result += `[${index + 1}] ${sr.title} — ${sr.url}`;
      if (sr.date) result += ` (${sr.date})`;
      if (sr.snippet) result += `\n    ${sr.snippet}`;
      result += "\n";
    });
  }

  return result;
}

/**
 * Make an authenticated fetch to the Perplexity API with timeout.
 */
export async function perplexityFetch(
  url: string,
  apiKey: string,
  timeoutMs: number,
  init: RequestInit = {}
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
        ...(init.headers as Record<string, string> || {}),
      },
      signal: controller.signal,
    });
    if (!init.headers || !(init as any)._keepTimeout) clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout: Perplexity API did not respond within ${timeoutMs}ms. Consider increasing PERPLEXITY_TIMEOUT_MS.`);
    }
    throw new Error(`Network error while calling Perplexity API: ${error}`);
  }
}

/**
 * Parse response or throw with status info.
 */
export async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorText: string;
    try {
      errorText = await response.text();
    } catch {
      errorText = "Unable to parse error response";
    }
    throw new Error(`Perplexity API error: ${response.status} ${response.statusText}\n${errorText}`);
  }

  try {
    return await response.json() as T;
  } catch (jsonError) {
    throw new Error(`Failed to parse JSON response from Perplexity API: ${jsonError}`);
  }
}

/**
 * Perform a non-streaming chat completion.
 */
export async function performChatCompletion(
  messages: Array<{ role: string; content: string }>,
  model: string,
  apiKey: string,
  timeoutMs: number,
  options?: CommonOptions
): Promise<string> {
  const body = buildChatBody(messages, model, options);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout: Perplexity API did not respond within ${timeoutMs}ms. Consider increasing PERPLEXITY_TIMEOUT_MS.`);
    }
    throw new Error(`Network error while calling Perplexity API: ${error}`);
  }

  const data = await parseResponse<PerplexityChatResponse>(response);
  return appendExtras(data.choices[0].message.content, {
    citations: data.citations,
    images: data.images,
    related_questions: data.related_questions,
    search_results: data.search_results,
  });
}

/**
 * Perform a streaming chat completion.
 */
export async function performStreamingChatCompletion(
  messages: Array<{ role: string; content: string }>,
  model: string,
  apiKey: string,
  timeoutMs: number,
  options?: CommonOptions
): Promise<string> {
  const body = buildChatBody(messages, model, options, true);

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout: Perplexity API did not respond within ${timeoutMs}ms. Consider increasing PERPLEXITY_TIMEOUT_MS.`);
    }
    throw new Error(`Network error while calling Perplexity API: ${error}`);
  }

  if (!response.ok) {
    clearTimeout(timeoutId);
    let errorText: string;
    try { errorText = await response.text(); } catch { errorText = "Unable to parse error response"; }
    throw new Error(`Perplexity API error: ${response.status} ${response.statusText}\n${errorText}`);
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
  let searchResults: Array<{ title: string; url: string; snippet?: string; date?: string }> = [];

  const resetStreamTimeout = () => {
    clearTimeout(timeoutId);
    return setTimeout(() => controller.abort(), timeoutMs);
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
          if (data === "[DONE]") continue;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) fullContent += content;
            if (parsed.citations && Array.isArray(parsed.citations)) citations = parsed.citations;
            if (parsed.images && Array.isArray(parsed.images)) images = parsed.images;
            if (parsed.related_questions && Array.isArray(parsed.related_questions)) relatedQuestions = parsed.related_questions;
            if (parsed.search_results && Array.isArray(parsed.search_results)) searchResults = parsed.search_results;
          } catch { /* skip invalid JSON */ }
        }
      }
    }
  } catch (error) {
    clearTimeout(streamTimeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Stream timeout: No data received within ${timeoutMs}ms. Consider increasing PERPLEXITY_TIMEOUT_MS.`);
    }
    throw error;
  } finally {
    clearTimeout(streamTimeoutId);
    reader.releaseLock();
  }

  return appendExtras(fullContent, { citations, images, related_questions: relatedQuestions, search_results: searchResults });
}

/**
 * Perform a single search query.
 */
export async function performSingleSearch(
  query: string,
  apiKey: string,
  timeoutMs: number,
  maxResults: number = 10,
  maxTokensPerPage: number = 1024,
  country?: string,
  searchDomainFilter?: string[],
  dateFilters?: DateFilters,
  searchLanguageFilter?: string[],
  userLocation?: Record<string, unknown>
): Promise<PerplexitySearchResponse> {
  const body: Record<string, unknown> = {
    query,
    max_results: maxResults,
    max_tokens_per_page: maxTokensPerPage,
  };

  if (country) body.country = country;

  if (searchDomainFilter && searchDomainFilter.length > 0) {
    if (searchDomainFilter.length > 20) throw new Error("search_domain_filter cannot exceed 20 domains");
    body.search_domain_filter = searchDomainFilter;
  }

  if (dateFilters?.search_recency_filter) body.search_recency_filter = dateFilters.search_recency_filter;
  if (dateFilters?.search_after_date) body.search_after_date_filter = dateFilters.search_after_date;
  if (dateFilters?.search_before_date) body.search_before_date_filter = dateFilters.search_before_date;
  if (dateFilters?.last_updated_after) body.last_updated_after = dateFilters.last_updated_after;
  if (dateFilters?.last_updated_before) body.last_updated_before = dateFilters.last_updated_before;
  if (searchLanguageFilter && searchLanguageFilter.length > 0) body.search_language_filter = searchLanguageFilter;
  if (userLocation) body.user_location = userLocation;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch("https://api.perplexity.ai/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout: Perplexity Search API did not respond within ${timeoutMs}ms. Consider increasing PERPLEXITY_TIMEOUT_MS.`);
    }
    throw new Error(`Network error while calling Perplexity Search API: ${error}`);
  }

  return parseResponse<PerplexitySearchResponse>(response);
}

/**
 * Perform search with single or multi-query support.
 */
export async function performSearch(
  query: string | string[],
  apiKey: string,
  timeoutMs: number,
  maxResults?: number,
  maxTokensPerPage?: number,
  country?: string,
  searchDomainFilter?: string[],
  dateFilters?: DateFilters,
  searchLanguageFilter?: string[],
  userLocation?: Record<string, unknown>
): Promise<string> {
  const queries = Array.isArray(query) ? query : [query];

  if (queries.length === 0) throw new Error("At least one query is required");
  if (queries.length > 5) throw new Error("Maximum 5 queries per request");

  if (queries.length === 1) {
    const data = await performSingleSearch(queries[0], apiKey, timeoutMs, maxResults, maxTokensPerPage, country, searchDomainFilter, dateFilters, searchLanguageFilter, userLocation);
    return formatSearchResults(data);
  }

  const results = await Promise.all(
    queries.map(async (q) => {
      try {
        const data = await performSingleSearch(q, apiKey, timeoutMs, maxResults, maxTokensPerPage, country, searchDomainFilter, dateFilters, searchLanguageFilter, userLocation);
        return { query: q, data, error: null };
      } catch (error) {
        return { query: q, data: null, error: error instanceof Error ? error.message : String(error) };
      }
    })
  );

  return formatMultiQueryResults(results);
}

/**
 * Format search results.
 */
export function formatSearchResults(data: PerplexitySearchResponse): string {
  if (!data.results || !Array.isArray(data.results)) return "No search results found.";

  let formatted = `Found ${data.results.length} search results:\n\n`;
  data.results.forEach((result, index) => {
    formatted += `${index + 1}. **${result.title}**\n`;
    formatted += `   URL: ${result.url}\n`;
    if (result.snippet) formatted += `   ${result.snippet}\n`;
    if (result.date) formatted += `   Date: ${result.date}\n`;
    formatted += `\n`;
  });
  return formatted;
}

/**
 * Format multi-query search results.
 */
export function formatMultiQueryResults(
  results: Array<{ query: string; data: PerplexitySearchResponse | null; error: string | null }>
): string {
  const sections = results.map((result, queryIndex) => {
    const header = `## Query ${queryIndex + 1}: "${result.query}"\n`;
    if (result.error) return header + `\n**Error:** ${result.error}\n`;
    if (!result.data?.results || !Array.isArray(result.data.results)) return header + `\nNo search results found.\n`;

    let formatted = `\nFound ${result.data.results.length} results:\n\n`;
    result.data.results.forEach((r, index) => {
      formatted += `${index + 1}. **${r.title}**\n`;
      formatted += `   URL: ${r.url}\n`;
      if (r.snippet) formatted += `   ${r.snippet}\n`;
      if (r.date) formatted += `   Date: ${r.date}\n`;
      formatted += `\n`;
    });
    return header + formatted;
  });
  return sections.join("\n---\n\n");
}

/**
 * Start an async deep research job.
 */
export async function startAsyncResearch(
  messages: Array<{ role: string; content: string }>,
  apiKey: string,
  timeoutMs: number,
  options?: { reasoning_effort?: "low" | "medium" | "high"; search_domain_filter?: string[] }
): Promise<{ request_id: string; status: string }> {
  const body: Record<string, unknown> = { model: "sonar-deep-research", messages };

  if (options?.reasoning_effort) body.reasoning_effort = options.reasoning_effort;
  if (options?.search_domain_filter && options.search_domain_filter.length > 0) {
    if (options.search_domain_filter.length > 20) throw new Error("search_domain_filter cannot exceed 20 domains");
    body.search_domain_filter = options.search_domain_filter;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch("https://api.perplexity.ai/async/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${apiKey}` },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout: Perplexity Async API did not respond within ${timeoutMs}ms.`);
    }
    throw new Error(`Network error while calling Perplexity Async API: ${error}`);
  }

  const data = await parseResponse<PerplexityAsyncResponse>(response);
  return { request_id: data.request_id, status: data.status || "pending" };
}

/**
 * Get status of async research job.
 */
export async function getAsyncResearchStatus(
  requestId: string,
  apiKey: string,
  timeoutMs: number
): Promise<AsyncResearchResult> {
  const url = `https://api.perplexity.ai/async/chat/completions/${encodeURIComponent(requestId)}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: { "Authorization": `Bearer ${apiKey}` },
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout: Perplexity Async API did not respond within ${timeoutMs}ms.`);
    }
    throw new Error(`Network error while calling Perplexity Async API: ${error}`);
  }

  const data = await parseResponse<PerplexityAsyncResponse>(response);

  const result: AsyncResearchResult = {
    request_id: data.request_id,
    status: data.status as AsyncResearchResult["status"],
  };

  if (data.created_at) result.created_at = data.created_at;
  if (data.completed_at) result.completed_at = data.completed_at;
  if (data.error) result.error = data.error;

  if (data.status === "completed" && data.choices && data.choices[0]) {
    result.result = appendExtras(data.choices[0].message.content, { citations: data.citations });
  }

  return result;
}
