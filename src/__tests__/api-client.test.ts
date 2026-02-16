import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildChatBody, appendExtras, formatSearchResults, formatMultiQueryResults } from '../utils/api-client.js';

describe('buildChatBody', () => {
  const messages = [{ role: 'user', content: 'hello' }];

  it('builds basic body', () => {
    const body = buildChatBody(messages, 'sonar-pro');
    expect(body).toEqual({ model: 'sonar-pro', messages });
  });

  it('adds stream flag', () => {
    const body = buildChatBody(messages, 'sonar', undefined, true);
    expect(body.stream).toBe(true);
  });

  it('adds reasoning_effort', () => {
    const body = buildChatBody(messages, 'sonar-deep-research', { reasoning_effort: 'high' });
    expect(body.reasoning_effort).toBe('high');
  });

  it('adds search_domain_filter', () => {
    const body = buildChatBody(messages, 'sonar', { search_domain_filter: ['example.com'] });
    expect(body.search_domain_filter).toEqual(['example.com']);
  });

  it('throws if search_domain_filter exceeds 20', () => {
    const domains = Array.from({ length: 21 }, (_, i) => `d${i}.com`);
    expect(() => buildChatBody(messages, 'sonar', { search_domain_filter: domains })).toThrow('cannot exceed 20');
  });

  it('validates temperature range', () => {
    expect(() => buildChatBody(messages, 'sonar', { temperature: -1 })).toThrow('between 0 and 2');
    expect(() => buildChatBody(messages, 'sonar', { temperature: 3 })).toThrow('between 0 and 2');
  });

  it('validates max_tokens', () => {
    expect(() => buildChatBody(messages, 'sonar', { max_tokens: 0 })).toThrow('at least 1');
  });

  it('validates top_p range', () => {
    expect(() => buildChatBody(messages, 'sonar', { top_p: -0.1 })).toThrow('between 0 and 1');
    expect(() => buildChatBody(messages, 'sonar', { top_p: 1.1 })).toThrow('between 0 and 1');
  });

  it('validates top_k non-negative', () => {
    expect(() => buildChatBody(messages, 'sonar', { top_k: -1 })).toThrow('non-negative');
  });

  it('adds all optional fields', () => {
    const body = buildChatBody(messages, 'sonar', {
      temperature: 0.5,
      max_tokens: 100,
      top_p: 0.9,
      top_k: 5,
      search_mode: 'academic',
      search_recency_filter: 'week',
      search_after_date: '01/01/2024',
      search_before_date: '12/31/2024',
      last_updated_after: '06/01/2024',
      last_updated_before: '09/01/2024',
      return_images: true,
      return_related_questions: true,
    });
    expect(body.temperature).toBe(0.5);
    expect(body.max_tokens).toBe(100);
    expect(body.search_mode).toBe('academic');
    expect(body.search_recency_filter).toBe('week');
    expect(body.search_after_date_filter).toBe('01/01/2024');
    expect(body.search_before_date_filter).toBe('12/31/2024');
    expect(body.return_images).toBe(true);
    expect(body.return_related_questions).toBe(true);
  });
});

describe('appendExtras', () => {
  it('returns content unchanged when no extras', () => {
    expect(appendExtras('hello', {})).toBe('hello');
  });

  it('appends citations', () => {
    const result = appendExtras('content', { citations: ['https://a.com', 'https://b.com'] });
    expect(result).toContain('Citations:');
    expect(result).toContain('[1] https://a.com');
    expect(result).toContain('[2] https://b.com');
  });

  it('appends images', () => {
    const result = appendExtras('content', {
      images: [{ url: 'https://img.com/1.jpg', origin_url: 'https://src.com', height: 100, width: 200 }],
    });
    expect(result).toContain('Images:');
    expect(result).toContain('200x100');
    expect(result).toContain('https://img.com/1.jpg');
  });

  it('appends related questions', () => {
    const result = appendExtras('content', { related_questions: ['What is X?', 'How does Y work?'] });
    expect(result).toContain('Related Questions:');
    expect(result).toContain('1. What is X?');
    expect(result).toContain('2. How does Y work?');
  });

  it('appends all extras together', () => {
    const result = appendExtras('content', {
      citations: ['https://a.com'],
      images: [{ url: 'https://img.com/1.jpg', origin_url: 'https://src.com', height: 50, width: 100 }],
      related_questions: ['Q1?'],
    });
    expect(result).toContain('Citations:');
    expect(result).toContain('Images:');
    expect(result).toContain('Related Questions:');
  });

  it('skips empty arrays', () => {
    const result = appendExtras('content', { citations: [], images: [], related_questions: [] });
    expect(result).toBe('content');
  });
});

describe('formatSearchResults', () => {
  it('handles no results', () => {
    expect(formatSearchResults({})).toBe('No search results found.');
    expect(formatSearchResults({ results: [] })).toContain('Found 0 search results');
  });

  it('formats results correctly', () => {
    const result = formatSearchResults({
      results: [
        { title: 'Test Page', url: 'https://test.com', snippet: 'A test page', date: '2024-01-01' },
        { title: 'Another', url: 'https://another.com' },
      ],
    });
    expect(result).toContain('Found 2 search results');
    expect(result).toContain('**Test Page**');
    expect(result).toContain('URL: https://test.com');
    expect(result).toContain('A test page');
    expect(result).toContain('Date: 2024-01-01');
    expect(result).toContain('**Another**');
  });
});

describe('formatMultiQueryResults', () => {
  it('formats multiple queries', () => {
    const result = formatMultiQueryResults([
      { query: 'q1', data: { results: [{ title: 'R1', url: 'https://r1.com' }] }, error: null },
      { query: 'q2', data: null, error: 'API error' },
    ]);
    expect(result).toContain('Query 1: "q1"');
    expect(result).toContain('**R1**');
    expect(result).toContain('Query 2: "q2"');
    expect(result).toContain('**Error:** API error');
  });

  it('handles query with no results', () => {
    const result = formatMultiQueryResults([
      { query: 'q1', data: { results: undefined }, error: null },
    ]);
    expect(result).toContain('No search results found.');
  });
});
