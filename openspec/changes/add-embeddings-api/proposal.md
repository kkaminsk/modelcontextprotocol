## Why

The Perplexity API offers an Embeddings endpoint (`POST /v1/embeddings`) with 4 models, Matryoshka dimensionality reduction, batch input (up to 512), and multiple encoding formats. The MCP server has no support for embeddings.

## What Changes

- **New**: `perplexity_embed` tool wrapping `POST /v1/embeddings`
- **New**: `src/tools/perplexity_embed.ts` — tool definition and handler

## Capabilities

### New Capabilities
- `embeddings-api`: Text embedding generation with model selection, dimensionality control, batch input, and encoding format options

## Impact

- **Risk**: Low — additive new tool
- **Breaking changes**: None
- **Effort**: ~1 hour
