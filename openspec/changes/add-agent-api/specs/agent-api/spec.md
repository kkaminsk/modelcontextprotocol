## NEW Requirements

### Requirement: Agent API tool
The MCP server SHALL expose a `perplexity_agent` tool that sends requests to `POST /v1/responses`.

#### Scenario: Basic agent query with preset
- **GIVEN** a user calls `perplexity_agent` with `query: "What is quantum computing?"` and `preset: "fast-search"`
- **WHEN** the request is sent to the Perplexity API
- **THEN** the tool SHALL POST to `https://api.perplexity.ai/v1/responses` with the query and preset
- **AND** return the response content with any citations

#### Scenario: Multi-provider model selection
- **GIVEN** a user calls `perplexity_agent` with `model: "anthropic/claude-opus-4-6"`
- **WHEN** the request is processed
- **THEN** the tool SHALL include the model in the request body

#### Scenario: Fallback model chain
- **GIVEN** a user provides `models: ["openai/gpt-5.2", "anthropic/claude-opus-4-6"]`
- **WHEN** the request is processed
- **THEN** the tool SHALL include the models array for fallback chain support

#### Scenario: Structured JSON output
- **GIVEN** a user provides `response_format` with a JSON schema
- **WHEN** the request is processed
- **THEN** the tool SHALL include the response_format in the request body

#### Scenario: Multi-step reasoning
- **GIVEN** a user sets `max_steps: 5`
- **WHEN** the request is processed
- **THEN** the tool SHALL include max_steps to enable multi-step agent reasoning

#### Scenario: Built-in tools configuration
- **GIVEN** a user provides `tools` array with web_search filters
- **WHEN** the request is processed
- **THEN** the tool SHALL pass the tools configuration to the API
