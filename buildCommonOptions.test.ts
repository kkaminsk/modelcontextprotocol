import { describe, it, expect } from "vitest";
import {
  buildCommonOptions,
  MAX_DOMAIN_FILTERS,
  MAX_BATCH_QUERIES,
  DEFAULT_MODEL,
  DEFAULT_TIMEOUT_MS,
} from "./utils.js";

describe("buildCommonOptions", () => {
  describe("search_domain_filter validation", () => {
    it("should extract valid string array for search_domain_filter", () => {
      const args = { search_domain_filter: ["example.com", "test.org"] };
      const result = buildCommonOptions(args);
      expect(result.search_domain_filter).toEqual(["example.com", "test.org"]);
    });

    it("should filter out non-string values from search_domain_filter", () => {
      const args = { search_domain_filter: ["valid.com", 123, null, "also-valid.org"] };
      const result = buildCommonOptions(args);
      expect(result.search_domain_filter).toEqual(["valid.com", "also-valid.org"]);
    });

    it("should not set search_domain_filter for empty array", () => {
      const args = { search_domain_filter: [] };
      const result = buildCommonOptions(args);
      expect(result.search_domain_filter).toBeUndefined();
    });

    it("should not set search_domain_filter for non-array", () => {
      const args = { search_domain_filter: "not-an-array" };
      const result = buildCommonOptions(args);
      expect(result.search_domain_filter).toBeUndefined();
    });
  });

  describe("temperature validation", () => {
    it("should extract valid temperature", () => {
      const args = { temperature: 0.5 };
      const result = buildCommonOptions(args);
      expect(result.temperature).toBe(0.5);
    });

    it("should accept temperature at boundaries (0 and 2)", () => {
      expect(buildCommonOptions({ temperature: 0 }).temperature).toBe(0);
      expect(buildCommonOptions({ temperature: 2 }).temperature).toBe(2);
    });

    it("should not set temperature for non-number", () => {
      const args = { temperature: "0.5" };
      const result = buildCommonOptions(args);
      expect(result.temperature).toBeUndefined();
    });
  });

  describe("max_tokens validation", () => {
    it("should extract valid max_tokens", () => {
      const args = { max_tokens: 1000 };
      const result = buildCommonOptions(args);
      expect(result.max_tokens).toBe(1000);
    });

    it("should not set max_tokens for non-number", () => {
      const args = { max_tokens: "1000" };
      const result = buildCommonOptions(args);
      expect(result.max_tokens).toBeUndefined();
    });
  });

  describe("top_p validation", () => {
    it("should extract valid top_p", () => {
      const args = { top_p: 0.9 };
      const result = buildCommonOptions(args);
      expect(result.top_p).toBe(0.9);
    });

    it("should accept top_p at boundaries (0 and 1)", () => {
      expect(buildCommonOptions({ top_p: 0 }).top_p).toBe(0);
      expect(buildCommonOptions({ top_p: 1 }).top_p).toBe(1);
    });

    it("should not set top_p for non-number", () => {
      const args = { top_p: "0.9" };
      const result = buildCommonOptions(args);
      expect(result.top_p).toBeUndefined();
    });
  });

  describe("top_k validation", () => {
    it("should extract valid top_k", () => {
      const args = { top_k: 50 };
      const result = buildCommonOptions(args);
      expect(result.top_k).toBe(50);
    });

    it("should accept top_k of 0 (disabled)", () => {
      const args = { top_k: 0 };
      const result = buildCommonOptions(args);
      expect(result.top_k).toBe(0);
    });

    it("should not set top_k for non-number", () => {
      const args = { top_k: "50" };
      const result = buildCommonOptions(args);
      expect(result.top_k).toBeUndefined();
    });
  });

  describe("search_mode validation", () => {
    it("should extract valid search_mode values", () => {
      expect(buildCommonOptions({ search_mode: "web" }).search_mode).toBe("web");
      expect(buildCommonOptions({ search_mode: "academic" }).search_mode).toBe("academic");
      expect(buildCommonOptions({ search_mode: "sec" }).search_mode).toBe("sec");
    });

    it("should not set invalid search_mode", () => {
      const args = { search_mode: "invalid" };
      const result = buildCommonOptions(args);
      expect(result.search_mode).toBeUndefined();
    });

    it("should not set search_mode for non-string", () => {
      const args = { search_mode: 123 };
      const result = buildCommonOptions(args);
      expect(result.search_mode).toBeUndefined();
    });
  });

  describe("search_recency_filter validation", () => {
    it("should extract valid search_recency_filter values", () => {
      expect(buildCommonOptions({ search_recency_filter: "day" }).search_recency_filter).toBe("day");
      expect(buildCommonOptions({ search_recency_filter: "week" }).search_recency_filter).toBe("week");
      expect(buildCommonOptions({ search_recency_filter: "month" }).search_recency_filter).toBe("month");
      expect(buildCommonOptions({ search_recency_filter: "year" }).search_recency_filter).toBe("year");
    });

    it("should not set invalid search_recency_filter", () => {
      const args = { search_recency_filter: "hour" };
      const result = buildCommonOptions(args);
      expect(result.search_recency_filter).toBeUndefined();
    });
  });

  describe("date filters", () => {
    it("should extract date filter strings", () => {
      const args = {
        search_after_date: "01/01/2024",
        search_before_date: "12/31/2024",
        last_updated_after: "06/01/2024",
        last_updated_before: "09/30/2024",
      };
      const result = buildCommonOptions(args);
      expect(result.search_after_date).toBe("01/01/2024");
      expect(result.search_before_date).toBe("12/31/2024");
      expect(result.last_updated_after).toBe("06/01/2024");
      expect(result.last_updated_before).toBe("09/30/2024");
    });

    it("should not set date filters for non-strings", () => {
      const args = {
        search_after_date: 123,
        search_before_date: null,
      };
      const result = buildCommonOptions(args);
      expect(result.search_after_date).toBeUndefined();
      expect(result.search_before_date).toBeUndefined();
    });
  });

  describe("boolean options", () => {
    it("should extract return_images when true", () => {
      const args = { return_images: true };
      const result = buildCommonOptions(args);
      expect(result.return_images).toBe(true);
    });

    it("should not set return_images when false", () => {
      const args = { return_images: false };
      const result = buildCommonOptions(args);
      expect(result.return_images).toBeUndefined();
    });

    it("should extract return_related_questions when true", () => {
      const args = { return_related_questions: true };
      const result = buildCommonOptions(args);
      expect(result.return_related_questions).toBe(true);
    });

    it("should not set return_related_questions when false", () => {
      const args = { return_related_questions: false };
      const result = buildCommonOptions(args);
      expect(result.return_related_questions).toBeUndefined();
    });
  });

  describe("empty input", () => {
    it("should return empty object for empty args", () => {
      const result = buildCommonOptions({});
      expect(result).toEqual({});
    });
  });
});

describe("Constants", () => {
  it("should have correct MAX_DOMAIN_FILTERS value", () => {
    expect(MAX_DOMAIN_FILTERS).toBe(20);
  });

  it("should have correct MAX_BATCH_QUERIES value", () => {
    expect(MAX_BATCH_QUERIES).toBe(5);
  });

  it("should have correct DEFAULT_MODEL value", () => {
    expect(DEFAULT_MODEL).toBe("sonar-pro");
  });

  it("should have correct DEFAULT_TIMEOUT_MS value", () => {
    expect(DEFAULT_TIMEOUT_MS).toBe(300000);
  });
});
