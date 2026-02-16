## MODIFIED Requirements

### Requirement: Search API parameter parity
The perplexity_search tool SHALL support all current Search API parameters.

#### Scenario: Search language filter
- **GIVEN** a user sets `search_language_filter: ["en", "fr"]` on perplexity_search
- **WHEN** the request is sent
- **THEN** the API request body SHALL include the language filter array

#### Scenario: User location
- **GIVEN** a user provides `user_location` with latitude, longitude, and country
- **WHEN** the request is processed
- **THEN** the API request body SHALL include the user_location object for localized results
