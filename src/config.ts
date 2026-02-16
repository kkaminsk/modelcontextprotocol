/**
 * Configuration and environment variable handling.
 */

export function getApiKey(): string {
  const key = process.env.PERPLEXITY_API_KEY;
  if (!key) {
    console.error("Error: PERPLEXITY_API_KEY environment variable is required");
    process.exit(1);
  }
  return key;
}

export function getTimeoutMs(): number {
  return parseInt(process.env.PERPLEXITY_TIMEOUT_MS || "300000", 10);
}
