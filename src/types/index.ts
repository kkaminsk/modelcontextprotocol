/**
 * Shared TypeScript interfaces and types.
 */

export interface PerplexityMessage {
  role: string;
  content: string;
}

export interface PerplexityChatChoice {
  message: PerplexityMessage;
  index: number;
  finish_reason: string;
}

export interface PerplexityChatResponse {
  choices: PerplexityChatChoice[];
  citations?: string[];
  images?: Array<{ url: string; origin_url: string; height: number; width: number }>;
  related_questions?: string[];
}

export interface PerplexitySearchResult {
  title: string;
  url: string;
  snippet?: string;
  date?: string;
}

export interface PerplexitySearchResponse {
  results?: PerplexitySearchResult[];
}

export interface PerplexityAsyncResponse {
  request_id: string;
  status: string;
  created_at?: string;
  completed_at?: string;
  error?: string;
  choices?: PerplexityChatChoice[];
  citations?: string[];
}

export interface CommonOptions {
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

export interface DateFilters {
  search_recency_filter?: "day" | "week" | "month" | "year";
  search_after_date?: string;
  search_before_date?: string;
  last_updated_after?: string;
  last_updated_before?: string;
}

export interface AsyncResearchResult {
  request_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  created_at?: string;
  completed_at?: string;
  result?: string;
  error?: string;
}
