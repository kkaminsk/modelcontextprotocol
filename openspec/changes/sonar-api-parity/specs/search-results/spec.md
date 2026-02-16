## MODIFIED Requirements

### Requirement: Parse search_results response field
The MCP server SHALL parse and include the `search_results` field from Sonar API responses.

#### Scenario: Response includes search_results
- **GIVEN** the Perplexity API returns a response with a `search_results` array
- **WHEN** the response is formatted
- **THEN** the tool SHALL include search result metadata (title, url, date) in the output
- **AND** continue to include legacy `citations` for backward compatibility

#### Scenario: Response has no search_results
- **GIVEN** the API response does not include `search_results`
- **WHEN** the response is formatted
- **THEN** the tool SHALL fall back to displaying citations only
