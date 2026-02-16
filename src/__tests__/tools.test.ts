import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handlePerplexityAsk } from '../tools/perplexity_ask.js';
import { handlePerplexityResearch } from '../tools/perplexity_research.js';
import { handlePerplexityReason } from '../tools/perplexity_reason.js';
import { handlePerplexitySearch } from '../tools/perplexity_search.js';
import { handlePerplexityResearchAsync, handlePerplexityResearchStatus } from '../tools/perplexity_research_async.js';

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

function mockJsonResponse(data: unknown, ok = true, status = 200) {
  return {
    ok,
    status,
    statusText: ok ? 'OK' : 'Bad Request',
    json: async () => data,
    text: async () => JSON.stringify(data),
    body: null,
  };
}

beforeEach(() => {
  mockFetch.mockReset();
});

describe('handlePerplexityAsk', () => {
  it('throws if messages is not an array', async () => {
    await expect(handlePerplexityAsk({ messages: 'not array' }, 'key', 5000)).rejects.toThrow("'messages' must be an array");
  });

  it('throws if messages have invalid format', async () => {
    await expect(handlePerplexityAsk({ messages: [{ role: 123 }] }, 'key', 5000)).rejects.toThrow('Invalid message format');
  });

  it('returns result on success', async () => {
    mockFetch.mockResolvedValueOnce(mockJsonResponse({
      choices: [{ message: { role: 'assistant', content: 'Hello!' }, index: 0, finish_reason: 'stop' }],
      citations: ['https://example.com'],
    }));

    const result = await handlePerplexityAsk({ messages: [{ role: 'user', content: 'hi' }] }, 'key', 5000);
    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('Hello!');
    expect(result.content[0].text).toContain('https://example.com');
  });

  it('uses sonar model when specified', async () => {
    mockFetch.mockResolvedValueOnce(mockJsonResponse({
      choices: [{ message: { role: 'assistant', content: 'fast' }, index: 0, finish_reason: 'stop' }],
    }));

    await handlePerplexityAsk({ messages: [{ role: 'user', content: 'hi' }], model: 'sonar' }, 'key', 5000);
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.model).toBe('sonar');
  });

  it('defaults to sonar-pro', async () => {
    mockFetch.mockResolvedValueOnce(mockJsonResponse({
      choices: [{ message: { role: 'assistant', content: 'ok' }, index: 0, finish_reason: 'stop' }],
    }));

    await handlePerplexityAsk({ messages: [{ role: 'user', content: 'hi' }] }, 'key', 5000);
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.model).toBe('sonar-pro');
  });
});

describe('handlePerplexityResearch', () => {
  it('throws if messages missing', async () => {
    await expect(handlePerplexityResearch({}, 'key', 5000)).rejects.toThrow("'messages' must be an array");
  });

  it('uses sonar-deep-research model', async () => {
    mockFetch.mockResolvedValueOnce(mockJsonResponse({
      choices: [{ message: { role: 'assistant', content: 'research result' }, index: 0, finish_reason: 'stop' }],
    }));

    await handlePerplexityResearch({ messages: [{ role: 'user', content: 'research this' }] }, 'key', 5000);
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.model).toBe('sonar-deep-research');
  });
});

describe('handlePerplexityReason', () => {
  it('uses sonar-reasoning-pro model', async () => {
    mockFetch.mockResolvedValueOnce(mockJsonResponse({
      choices: [{ message: { role: 'assistant', content: 'reasoned' }, index: 0, finish_reason: 'stop' }],
    }));

    await handlePerplexityReason({ messages: [{ role: 'user', content: 'reason' }] }, 'key', 5000);
    const body = JSON.parse(mockFetch.mock.calls[0][1].body);
    expect(body.model).toBe('sonar-reasoning-pro');
  });
});

describe('handlePerplexitySearch', () => {
  it('throws if query is invalid', async () => {
    await expect(handlePerplexitySearch({ query: 123 }, 'key', 5000)).rejects.toThrow("'query' must be a string");
  });

  it('throws if too many queries', async () => {
    await expect(handlePerplexitySearch({ query: ['a', 'b', 'c', 'd', 'e', 'f'] }, 'key', 5000)).rejects.toThrow('maximum 5 queries');
  });

  it('returns formatted results', async () => {
    mockFetch.mockResolvedValueOnce(mockJsonResponse({
      results: [{ title: 'Test', url: 'https://test.com', snippet: 'A snippet' }],
    }));

    const result = await handlePerplexitySearch({ query: 'test query' }, 'key', 5000);
    expect(result.isError).toBe(false);
    expect(result.content[0].text).toContain('**Test**');
  });

  it('handles multi-query', async () => {
    mockFetch.mockResolvedValueOnce(mockJsonResponse({ results: [{ title: 'R1', url: 'https://r1.com' }] }));
    mockFetch.mockResolvedValueOnce(mockJsonResponse({ results: [{ title: 'R2', url: 'https://r2.com' }] }));

    const result = await handlePerplexitySearch({ query: ['q1', 'q2'] }, 'key', 5000);
    expect(result.content[0].text).toContain('Query 1');
    expect(result.content[0].text).toContain('Query 2');
  });
});

describe('handlePerplexityResearchAsync', () => {
  it('throws if messages missing', async () => {
    await expect(handlePerplexityResearchAsync({}, 'key', 5000)).rejects.toThrow("'messages' must be an array");
  });

  it('returns request_id on success', async () => {
    mockFetch.mockResolvedValueOnce(mockJsonResponse({ request_id: 'abc-123', status: 'pending' }));

    const result = await handlePerplexityResearchAsync({ messages: [{ role: 'user', content: 'research' }] }, 'key', 5000);
    expect(result.content[0].text).toContain('abc-123');
  });
});

describe('handlePerplexityResearchStatus', () => {
  it('throws if request_id not string', async () => {
    await expect(handlePerplexityResearchStatus({ request_id: 123 }, 'key', 5000)).rejects.toThrow("'request_id' must be a string");
  });

  it('returns completed results', async () => {
    mockFetch.mockResolvedValueOnce(mockJsonResponse({
      request_id: 'abc-123',
      status: 'completed',
      choices: [{ message: { role: 'assistant', content: 'deep result' }, index: 0, finish_reason: 'stop' }],
      citations: ['https://cite.com'],
    }));

    const result = await handlePerplexityResearchStatus({ request_id: 'abc-123' }, 'key', 5000);
    expect(result.content[0].text).toContain('deep result');
    expect(result.content[0].text).toContain('completed');
  });

  it('shows pending status', async () => {
    mockFetch.mockResolvedValueOnce(mockJsonResponse({ request_id: 'abc-123', status: 'pending' }));

    const result = await handlePerplexityResearchStatus({ request_id: 'abc-123' }, 'key', 5000);
    expect(result.content[0].text).toContain('still in progress');
  });
});

describe('API error handling', () => {
  it('handles API error response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      statusText: 'Too Many Requests',
      text: async () => 'Rate limited',
    });

    await expect(
      handlePerplexityAsk({ messages: [{ role: 'user', content: 'hi' }] }, 'key', 5000)
    ).rejects.toThrow('429');
  });

  it('handles network error', async () => {
    mockFetch.mockRejectedValueOnce(new Error('ECONNREFUSED'));

    await expect(
      handlePerplexityAsk({ messages: [{ role: 'user', content: 'hi' }] }, 'key', 5000)
    ).rejects.toThrow('Network error');
  });
});
