## ADDED Requirements

### Requirement: Centralized Fetch with Timeout
All Perplexity API calls SHALL use a shared fetch wrapper that handles timeouts and errors consistently.

#### Scenario: Fetch wrapper handles timeout
- **WHEN** an API call exceeds the configured timeout
- **THEN** the request is aborted and an error is thrown with a message suggesting to increase PERPLEXITY_TIMEOUT_MS

#### Scenario: Fetch wrapper handles network errors
- **WHEN** a network error occurs during an API call
- **THEN** the error is wrapped with context about which API was being called

#### Scenario: Fetch wrapper adds authorization
- **WHEN** an API call is made through the fetch wrapper
- **THEN** the Authorization header is automatically set with the Bearer token

### Requirement: Centralized Option Building
Tool handlers SHALL use a shared function to extract and validate common API options from request arguments.

#### Scenario: Option builder extracts search filters
- **WHEN** request arguments contain search_domain_filter
- **THEN** the option builder validates the array length is <= 20 and returns typed string array

#### Scenario: Option builder validates numeric ranges
- **WHEN** request arguments contain temperature, top_p, or top_k
- **THEN** the option builder validates they are within allowed ranges

#### Scenario: Option builder extracts date filters
- **WHEN** request arguments contain date filter parameters
- **THEN** the option builder extracts search_recency_filter, search_after_date, search_before_date, last_updated_after, and last_updated_before

### Requirement: Stream Error Visibility
Errors during stream response parsing SHALL be logged for debugging purposes.

#### Scenario: Invalid JSON in stream is logged
- **WHEN** a streaming response contains invalid JSON
- **THEN** the error and offending content are logged to stderr

#### Scenario: Stream continues despite parse errors
- **WHEN** a streaming response contains invalid JSON
- **THEN** processing continues with valid chunks and the error is logged (not thrown)
