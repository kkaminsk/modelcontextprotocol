import { describe, it, expect } from 'vitest';
import { validateMessages, buildCommonOptions } from '../utils/validation.js';

describe('validateMessages', () => {
  it('returns true for valid messages', () => {
    expect(validateMessages([{ role: 'user', content: 'hello' }])).toBe(true);
  });

  it('returns true for multiple valid messages', () => {
    expect(validateMessages([
      { role: 'system', content: 'You are helpful' },
      { role: 'user', content: 'Hi' },
      { role: 'assistant', content: 'Hello!' },
    ])).toBe(true);
  });

  it('returns true for empty array', () => {
    expect(validateMessages([])).toBe(true);
  });

  it('returns false when role is missing', () => {
    expect(validateMessages([{ content: 'hello' }])).toBe(false);
  });

  it('returns false when content is missing', () => {
    expect(validateMessages([{ role: 'user' }])).toBe(false);
  });

  it('returns false for null element', () => {
    expect(validateMessages([null])).toBe(false);
  });

  it('returns false for non-object element', () => {
    expect(validateMessages(['string'])).toBe(false);
  });

  it('returns false when role is not string', () => {
    expect(validateMessages([{ role: 123, content: 'hello' }])).toBe(false);
  });

  it('returns false when content is not string', () => {
    expect(validateMessages([{ role: 'user', content: 123 }])).toBe(false);
  });
});

describe('buildCommonOptions', () => {
  it('returns empty object for empty args', () => {
    expect(buildCommonOptions({})).toEqual({});
  });

  it('extracts temperature', () => {
    expect(buildCommonOptions({ temperature: 0.5 })).toEqual({ temperature: 0.5 });
  });

  it('extracts max_tokens', () => {
    expect(buildCommonOptions({ max_tokens: 100 })).toEqual({ max_tokens: 100 });
  });

  it('extracts top_p and top_k', () => {
    expect(buildCommonOptions({ top_p: 0.8, top_k: 5 })).toEqual({ top_p: 0.8, top_k: 5 });
  });

  it('extracts search_mode when valid', () => {
    expect(buildCommonOptions({ search_mode: 'academic' })).toEqual({ search_mode: 'academic' });
  });

  it('ignores invalid search_mode', () => {
    expect(buildCommonOptions({ search_mode: 'invalid' })).toEqual({});
  });

  it('extracts search_recency_filter when valid', () => {
    expect(buildCommonOptions({ search_recency_filter: 'week' })).toEqual({ search_recency_filter: 'week' });
  });

  it('ignores invalid search_recency_filter', () => {
    expect(buildCommonOptions({ search_recency_filter: 'century' })).toEqual({});
  });

  it('extracts search_domain_filter with valid strings', () => {
    const result = buildCommonOptions({ search_domain_filter: ['example.com', 123, 'test.org'] });
    expect(result.search_domain_filter).toEqual(['example.com', 'test.org']);
  });

  it('ignores empty search_domain_filter', () => {
    expect(buildCommonOptions({ search_domain_filter: [] })).toEqual({});
  });

  it('extracts date filters', () => {
    const result = buildCommonOptions({
      search_after_date: '01/01/2024',
      search_before_date: '12/31/2024',
      last_updated_after: '06/01/2024',
      last_updated_before: '09/01/2024',
    });
    expect(result).toEqual({
      search_after_date: '01/01/2024',
      search_before_date: '12/31/2024',
      last_updated_after: '06/01/2024',
      last_updated_before: '09/01/2024',
    });
  });

  it('extracts boolean flags', () => {
    const result = buildCommonOptions({ return_images: true, return_related_questions: true });
    expect(result).toEqual({ return_images: true, return_related_questions: true });
  });

  it('ignores false boolean flags', () => {
    expect(buildCommonOptions({ return_images: false })).toEqual({});
  });

  it('extracts reasoning_effort when valid', () => {
    expect(buildCommonOptions({ reasoning_effort: 'high' })).toEqual({ reasoning_effort: 'high' });
  });

  it('ignores invalid reasoning_effort', () => {
    expect(buildCommonOptions({ reasoning_effort: 'extreme' })).toEqual({});
  });

  it('ignores non-number temperature', () => {
    expect(buildCommonOptions({ temperature: 'hot' })).toEqual({});
  });

  it('extracts all options together', () => {
    const args = {
      temperature: 0.5,
      max_tokens: 200,
      top_p: 0.9,
      top_k: 10,
      search_mode: 'web',
      search_recency_filter: 'day',
      search_domain_filter: ['example.com'],
      reasoning_effort: 'medium',
      return_images: true,
      return_related_questions: true,
      search_after_date: '01/01/2024',
    };
    const result = buildCommonOptions(args);
    expect(result).toEqual({
      temperature: 0.5,
      max_tokens: 200,
      top_p: 0.9,
      top_k: 10,
      search_mode: 'web',
      search_recency_filter: 'day',
      search_domain_filter: ['example.com'],
      reasoning_effort: 'medium',
      return_images: true,
      return_related_questions: true,
      search_after_date: '01/01/2024',
    });
  });
});
