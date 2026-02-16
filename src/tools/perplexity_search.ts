import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { performSearch } from "../utils/api-client.js";

export const PERPLEXITY_SEARCH_TOOL: Tool = {
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
          { type: "array", items: { type: "string" }, minItems: 1, maxItems: 5, description: "Array of up to 5 search queries" },
        ],
        description: "Search query or array of queries (max 5)",
      },
      max_results: { type: "number", description: "Maximum results to return (1-20, default: 10)", minimum: 1, maximum: 20 },
      max_tokens_per_page: { type: "number", description: "Maximum tokens per webpage (default: 1024)", minimum: 256, maximum: 2048 },
      country: { type: "string", description: "ISO 3166-1 alpha-2 country code for regional results" },
      search_domain_filter: { type: "array", items: { type: "string" }, maxItems: 20, description: "Domain filter list." },
      search_recency_filter: { type: "string", enum: ["day", "week", "month", "year"], description: "Filter results by recency." },
      search_after_date: { type: "string", pattern: "^\\d{2}/\\d{2}/\\d{4}$", description: "Only results after this date. Format: MM/DD/YYYY" },
      search_before_date: { type: "string", pattern: "^\\d{2}/\\d{2}/\\d{4}$", description: "Only results before this date. Format: MM/DD/YYYY" },
      last_updated_after: { type: "string", pattern: "^\\d{2}/\\d{2}/\\d{4}$", description: "Only results updated after. Format: MM/DD/YYYY" },
      last_updated_before: { type: "string", pattern: "^\\d{2}/\\d{2}/\\d{4}$", description: "Only results updated before. Format: MM/DD/YYYY" },
    },
    required: ["query"],
  },
};

export async function handlePerplexitySearch(args: Record<string, unknown>, apiKey: string, timeoutMs: number) {
  const isValidQuery = typeof args.query === "string" ||
    (Array.isArray(args.query) && args.query.every((q: unknown) => typeof q === "string"));
  if (!isValidQuery) {
    throw new Error("Invalid arguments for perplexity_search: 'query' must be a string or array of strings");
  }
  if (Array.isArray(args.query) && args.query.length > 5) {
    throw new Error("Invalid arguments for perplexity_search: maximum 5 queries allowed");
  }

  const query = args.query as string | string[];
  const maxResults = typeof args.max_results === "number" ? args.max_results : undefined;
  const maxTokensPerPage = typeof args.max_tokens_per_page === "number" ? args.max_tokens_per_page : undefined;
  const countryCode = typeof args.country === "string" ? args.country : undefined;
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
    query, apiKey, timeoutMs, maxResults, maxTokensPerPage, countryCode, searchDomainFilter,
    Object.keys(dateFilters).length > 0 ? dateFilters : undefined
  );
  return { content: [{ type: "text", text: result }], isError: false };
}
