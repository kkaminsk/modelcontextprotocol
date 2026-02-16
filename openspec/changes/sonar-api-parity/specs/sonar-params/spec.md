## MODIFIED Requirements

### Requirement: Sonar API parameter parity
The ask, research, and reason tools SHALL support all current Sonar API parameters.

#### Scenario: Search context size
- **GIVEN** a user sets `search_context_size: "high"` on perplexity_ask
- **WHEN** the request is sent
- **THEN** the API request body SHALL include `search_context_size: "high"`

#### Scenario: Output level
- **GIVEN** a user sets `output_level: "concise"`
- **WHEN** the request is processed
- **THEN** the API request body SHALL include `output_level: "concise"`

#### Scenario: Search language filter
- **GIVEN** a user sets `search_language_filter: ["en", "de"]`
- **WHEN** the request is processed
- **THEN** the API request body SHALL include the language filter array

#### Scenario: Disable search
- **GIVEN** a user sets `disable_search: true`
- **WHEN** the request is processed
- **THEN** the API request body SHALL include `disable_search: true`

#### Scenario: Search type pro
- **GIVEN** a user sets `search_type: "pro"`
- **WHEN** the request is processed
- **THEN** the API request body SHALL include `search_type: "pro"` for multi-step reasoning

#### Scenario: Structured JSON output
- **GIVEN** a user provides `response_format` with type "json_schema"
- **WHEN** the request is processed
- **THEN** the API request body SHALL include the response_format object
