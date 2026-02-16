## NEW Requirements

### Requirement: Embeddings API tool
The MCP server SHALL expose a `perplexity_embed` tool that sends requests to `POST /v1/embeddings`.

#### Scenario: Single text embedding
- **GIVEN** a user calls `perplexity_embed` with `input: "Hello world"`
- **WHEN** the request is sent to the Perplexity API
- **THEN** the tool SHALL POST to `https://api.perplexity.ai/v1/embeddings` and return the embedding vector

#### Scenario: Batch embeddings
- **GIVEN** a user provides `input` as an array of up to 512 strings
- **WHEN** the request is processed
- **THEN** the tool SHALL return an embedding for each input text

#### Scenario: Model selection
- **GIVEN** a user sets `model: "pplx-embed-v1-4b"`
- **WHEN** the request is processed
- **THEN** the tool SHALL use the specified model

#### Scenario: Dimensionality reduction
- **GIVEN** a user sets `dimensions: 256`
- **WHEN** the request is processed
- **THEN** the tool SHALL include the dimensions parameter for Matryoshka dimensionality reduction

#### Scenario: Encoding format
- **GIVEN** a user sets `encoding_format: "base64_int8"`
- **WHEN** the request is processed
- **THEN** the tool SHALL return embeddings in the specified encoding format
