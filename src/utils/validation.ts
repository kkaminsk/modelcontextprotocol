/**
 * Input validation utilities.
 */

import { CommonOptions } from "../types/index.js";

/**
 * Validates that each message in the array has string `role` and `content` properties.
 */
export function validateMessages(messages: unknown[]): messages is Array<{ role: string; content: string }> {
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
 */
export function buildCommonOptions(args: Record<string, unknown>): CommonOptions {
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
