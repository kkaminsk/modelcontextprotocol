# OpenSpec Proposal 006: Date Filtering Parameters

**Priority:** P1 - High
**Status:** Completed
**Date:** 2025-12-21
**Affected Tools:** `perplexity_ask`, `perplexity_research`, `perplexity_reason`, `perplexity_search`

## Summary

Add date-based filtering parameters to control the recency and date range of search results.

## Problem Statement

Users cannot filter search results by:

1. Recency (last day, week, month, year)
2. Publication date ranges
3. Last updated date ranges

This limits the ability to find current information or research historical data.

## Proposed Solution

### Schema Update

```typescript
search_recency_filter: {
  type: "string",
  enum: ["day", "week", "month", "year"],
  description: "Filter results by recency. 'day' = last 24 hours, 'week' = last 7 days, etc."
},
search_after_date: {
  type: "string",
  pattern: "^\\d{2}/\\d{2}/\\d{4}$",
  description: "Only include results published after this date. Format: MM/DD/YYYY"
},
search_before_date: {
  type: "string",
  pattern: "^\\d{2}/\\d{2}/\\d{4}$",
  description: "Only include results published before this date. Format: MM/DD/YYYY"
},
last_updated_after: {
  type: "string",
  pattern: "^\\d{2}/\\d{2}/\\d{4}$",
  description: "Only include results last updated after this date. Format: MM/DD/YYYY"
},
last_updated_before: {
  type: "string",
  pattern: "^\\d{2}/\\d{2}/\\d{4}$",
  description: "Only include results last updated before this date. Format: MM/DD/YYYY"
}
```

### Implementation

```typescript
interface DateFilterOptions {
  search_recency_filter?: "day" | "week" | "month" | "year";
  search_after_date?: string;
  search_before_date?: string;
  last_updated_after?: string;
  last_updated_before?: string;
}

function validateDateFormat(date: string): boolean {
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!regex.test(date)) return false;

  const [month, day, year] = date.split('/').map(Number);
  const dateObj = new Date(year, month - 1, day);
  return dateObj.getMonth() === month - 1 &&
         dateObj.getDate() === day &&
         dateObj.getFullYear() === year;
}

function buildDateFilters(options: DateFilterOptions): Record<string, unknown> {
  const params: Record<string, unknown> = {};

  if (options.search_recency_filter) {
    params.search_recency_filter = options.search_recency_filter;
  }

  if (options.search_after_date) {
    if (!validateDateFormat(options.search_after_date)) {
      throw new Error("search_after_date must be in MM/DD/YYYY format");
    }
    params.search_after_date_filter = options.search_after_date;
  }

  if (options.search_before_date) {
    if (!validateDateFormat(options.search_before_date)) {
      throw new Error("search_before_date must be in MM/DD/YYYY format");
    }
    params.search_before_date_filter = options.search_before_date;
  }

  // Similar for last_updated filters

  return params;
}
```

## Filter Types

### Recency Filter
Quick filter for common time ranges:

| Value | Time Range |
|-------|------------|
| `day` | Last 24 hours |
| `week` | Last 7 days |
| `month` | Last 30 days |
| `year` | Last 365 days |

### Date Range Filters
For precise date control:

- `search_after_date` + `search_before_date`: Publication date range
- `last_updated_after` + `last_updated_before`: Last modified date range

## Examples

### Breaking News (Last 24 Hours)
```json
{
  "messages": [{"role": "user", "content": "Latest AI announcements"}],
  "search_recency_filter": "day"
}
```

### This Week's Updates
```json
{
  "messages": [{"role": "user", "content": "React framework updates"}],
  "search_recency_filter": "week"
}
```

### Specific Date Range
```json
{
  "messages": [{"role": "user", "content": "COVID-19 vaccine trials"}],
  "search_after_date": "01/01/2024",
  "search_before_date": "06/30/2024"
}
```

### Recently Updated Documentation
```json
{
  "messages": [{"role": "user", "content": "TypeScript documentation"}],
  "last_updated_after": "01/01/2025"
}
```

## Validation Rules

1. Date format must be MM/DD/YYYY
2. Dates must be valid calendar dates
3. `search_after_date` must be before `search_before_date` if both specified
4. Same validation for `last_updated_*` filters
5. Cannot combine `search_recency_filter` with date range filters

## Backward Compatibility

- All parameters optional
- Existing behavior unchanged when omitted
- No impact on current tool usage

## Testing

1. Verify recency filter limits results appropriately
2. Test date range filtering
3. Validate date format enforcement
4. Test invalid date handling
5. Verify filter combinations work correctly

## References

- [Perplexity API - Date Filters](https://docs.perplexity.ai/api-reference/chat-completions-post)
