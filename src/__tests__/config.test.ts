import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getTimeoutMs } from '../config.js';

describe('getTimeoutMs', () => {
  const origEnv = process.env.PERPLEXITY_TIMEOUT_MS;

  afterEach(() => {
    if (origEnv !== undefined) {
      process.env.PERPLEXITY_TIMEOUT_MS = origEnv;
    } else {
      delete process.env.PERPLEXITY_TIMEOUT_MS;
    }
  });

  it('returns default 300000 when env not set', () => {
    delete process.env.PERPLEXITY_TIMEOUT_MS;
    expect(getTimeoutMs()).toBe(300000);
  });

  it('returns parsed value from env', () => {
    process.env.PERPLEXITY_TIMEOUT_MS = '60000';
    expect(getTimeoutMs()).toBe(60000);
  });
});
