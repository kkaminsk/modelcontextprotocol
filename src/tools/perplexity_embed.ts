import { Tool } from "@modelcontextprotocol/sdk/types.js";
import { perplexityFetch, parseResponse } from "../utils/api-client.js";

export const PERPLEXITY_EMBED_TOOL: Tool = {
  name: "perplexity_embed",
  description:
    "Generate text embeddings using the Perplexity Embeddings API. " +
    "Supports 4 models, batch input (up to 512 texts), Matryoshka dimensionality reduction, and multiple encoding formats.",
  inputSchema: {
    type: "object",
    properties: {
      input: {
        oneOf: [
          { type: "string", description: "Single text to embed" },
          { type: "array", items: { type: "string" }, minItems: 1, maxItems: 512, description: "Array of texts to embed (max 512)" },
        ],
        description: "Text or array of texts to generate embeddings for",
      },
      model: {
        type: "string",
        enum: ["pplx-embed-v1-0.6b", "pplx-embed-v1-4b", "pplx-embed-context-v1-0.6b", "pplx-embed-context-v1-4b"],
        description: "Embedding model. Default: pplx-embed-v1-4b",
      },
      dimensions: {
        type: "integer",
        minimum: 1,
        description: "Output dimensions (Matryoshka dimensionality reduction). Omit for full dimensions.",
      },
      encoding_format: {
        type: "string",
        enum: ["float", "base64_int8", "base64_binary"],
        description: "Encoding format for embeddings. Default: float",
      },
    },
    required: ["input"],
  },
};

interface EmbeddingData {
  object: string;
  embedding: number[] | string;
  index: number;
}

interface EmbeddingsResponse {
  object: string;
  data: EmbeddingData[];
  model: string;
  usage: { prompt_tokens: number; total_tokens: number };
}

export async function handlePerplexityEmbed(args: Record<string, unknown>, apiKey: string, timeoutMs: number) {
  const isValidInput = typeof args.input === "string" ||
    (Array.isArray(args.input) && args.input.every((i: unknown) => typeof i === "string"));
  if (!isValidInput) {
    throw new Error("Invalid arguments for perplexity_embed: 'input' must be a string or array of strings");
  }
  if (Array.isArray(args.input) && args.input.length > 512) {
    throw new Error("Invalid arguments for perplexity_embed: maximum 512 inputs allowed");
  }

  const body: Record<string, unknown> = {
    input: args.input,
    model: typeof args.model === "string" ? args.model : "pplx-embed-v1-4b",
  };

  if (typeof args.dimensions === "number") body.dimensions = args.dimensions;
  if (typeof args.encoding_format === "string") body.encoding_format = args.encoding_format;

  const response = await perplexityFetch(
    "https://api.perplexity.ai/v1/embeddings",
    apiKey,
    timeoutMs,
    { method: "POST", body: JSON.stringify(body) }
  );

  const data = await parseResponse<EmbeddingsResponse>(response);

  let content = `Model: ${data.model}\n`;
  content += `Usage: ${data.usage.prompt_tokens} prompt tokens, ${data.usage.total_tokens} total tokens\n`;
  content += `Embeddings: ${data.data.length}\n\n`;

  data.data.forEach((item) => {
    if (Array.isArray(item.embedding)) {
      const dims = item.embedding.length;
      const preview = item.embedding.slice(0, 5).map((n) => n.toFixed(6)).join(", ");
      content += `[${item.index}] ${dims} dimensions: [${preview}, ...]\n`;
    } else {
      content += `[${item.index}] ${typeof item.embedding === "string" ? "base64 encoded" : "encoded"}\n`;
    }
  });

  // Also include raw data as JSON for programmatic use
  content += `\n---\nRaw JSON:\n${JSON.stringify(data, null, 2)}`;

  return { content: [{ type: "text", text: content }], isError: false };
}
