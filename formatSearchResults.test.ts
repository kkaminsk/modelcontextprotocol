import { describe, it, expect } from "vitest";
import {
  formatSearchResults,
  type PerplexitySearchResponse,
} from "./utils.js";

describe("formatSearchResults", () => {
  it("should return 'No search results found.' for empty results array", () => {
    const data: PerplexitySearchResponse = { results: [] };
    const result = formatSearchResults(data);
    expect(result).toContain("Found 0 search results");
  });

  it("should return 'No search results found.' for undefined results", () => {
    const data = {} as PerplexitySearchResponse;
    const result = formatSearchResults(data);
    expect(result).toBe("No search results found.");
  });

  it("should format a single result with all fields", () => {
    const data: PerplexitySearchResponse = {
      results: [
        {
          title: "Test Title",
          url: "https://example.com",
          snippet: "This is a test snippet",
          date: "2024-01-15",
        },
      ],
    };
    const result = formatSearchResults(data);
    expect(result).toContain("Found 1 search results");
    expect(result).toContain("**Test Title**");
    expect(result).toContain("URL: https://example.com");
    expect(result).toContain("This is a test snippet");
    expect(result).toContain("Date: 2024-01-15");
  });

  it("should format multiple results", () => {
    const data: PerplexitySearchResponse = {
      results: [
        { title: "First Result", url: "https://first.com" },
        { title: "Second Result", url: "https://second.com" },
        { title: "Third Result", url: "https://third.com" },
      ],
    };
    const result = formatSearchResults(data);
    expect(result).toContain("Found 3 search results");
    expect(result).toContain("1. **First Result**");
    expect(result).toContain("2. **Second Result**");
    expect(result).toContain("3. **Third Result**");
  });

  it("should handle missing optional fields (snippet, date)", () => {
    const data: PerplexitySearchResponse = {
      results: [{ title: "Title Only", url: "https://example.com" }],
    };
    const result = formatSearchResults(data);
    expect(result).toContain("**Title Only**");
    expect(result).toContain("URL: https://example.com");
    expect(result).not.toContain("Date:");
  });
});
