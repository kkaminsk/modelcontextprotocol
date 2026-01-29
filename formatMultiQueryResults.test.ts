import { describe, it, expect } from "vitest";
import {
  formatMultiQueryResults,
  type PerplexitySearchResponse,
} from "./utils.js";

describe("formatMultiQueryResults", () => {
  it("should format a single query result", () => {
    const results: Array<{
      query: string;
      data: PerplexitySearchResponse | null;
      error: string | null;
    }> = [
      {
        query: "test query",
        data: {
          results: [{ title: "Result 1", url: "https://example.com" }],
        },
        error: null,
      },
    ];
    const result = formatMultiQueryResults(results);
    expect(result).toContain('## Query 1: "test query"');
    expect(result).toContain("Found 1 results");
    expect(result).toContain("**Result 1**");
  });

  it("should format multiple query results", () => {
    const results: Array<{
      query: string;
      data: PerplexitySearchResponse | null;
      error: string | null;
    }> = [
      {
        query: "first query",
        data: {
          results: [{ title: "First Result", url: "https://first.com" }],
        },
        error: null,
      },
      {
        query: "second query",
        data: {
          results: [{ title: "Second Result", url: "https://second.com" }],
        },
        error: null,
      },
    ];
    const result = formatMultiQueryResults(results);
    expect(result).toContain('## Query 1: "first query"');
    expect(result).toContain('## Query 2: "second query"');
    expect(result).toContain("**First Result**");
    expect(result).toContain("**Second Result**");
    expect(result).toContain("---"); // Separator between queries
  });

  it("should format a query with error", () => {
    const results: Array<{
      query: string;
      data: PerplexitySearchResponse | null;
      error: string | null;
    }> = [
      {
        query: "error query",
        data: null,
        error: "API rate limit exceeded",
      },
    ];
    const result = formatMultiQueryResults(results);
    expect(result).toContain('## Query 1: "error query"');
    expect(result).toContain("**Error:** API rate limit exceeded");
  });

  it("should format mixed success and error results", () => {
    const results: Array<{
      query: string;
      data: PerplexitySearchResponse | null;
      error: string | null;
    }> = [
      {
        query: "successful query",
        data: {
          results: [{ title: "Good Result", url: "https://good.com" }],
        },
        error: null,
      },
      {
        query: "failed query",
        data: null,
        error: "Network timeout",
      },
    ];
    const result = formatMultiQueryResults(results);
    expect(result).toContain('## Query 1: "successful query"');
    expect(result).toContain("**Good Result**");
    expect(result).toContain('## Query 2: "failed query"');
    expect(result).toContain("**Error:** Network timeout");
  });

  it("should handle query with null data and no error", () => {
    const results: Array<{
      query: string;
      data: PerplexitySearchResponse | null;
      error: string | null;
    }> = [
      {
        query: "empty query",
        data: null,
        error: null,
      },
    ];
    const result = formatMultiQueryResults(results);
    expect(result).toContain('## Query 1: "empty query"');
    expect(result).toContain("No search results found.");
  });
});
