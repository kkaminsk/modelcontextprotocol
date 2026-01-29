## ADDED Requirements

### Requirement: Test Framework Configuration
The project SHALL have a configured test framework that supports TypeScript and ESM modules.

#### Scenario: Test command is available
- **WHEN** a developer runs `npm test`
- **THEN** the test suite executes and reports results

#### Scenario: Watch mode is available
- **WHEN** a developer runs `npm run test:watch`
- **THEN** tests re-run automatically when files change

#### Scenario: Coverage reporting is available
- **WHEN** a developer runs `npm run test:coverage`
- **THEN** a coverage report is generated showing line, branch, and function coverage

### Requirement: Unit Tests for Formatting Functions
Formatting functions SHALL have unit tests covering success and edge cases.

#### Scenario: formatSearchResults handles empty results
- **WHEN** formatSearchResults is called with an empty results array
- **THEN** it returns a message indicating no results found

#### Scenario: formatSearchResults formats complete results
- **WHEN** formatSearchResults is called with results containing title, url, snippet, and date
- **THEN** all fields are included in the formatted output

#### Scenario: formatMultiQueryResults handles mixed results
- **WHEN** formatMultiQueryResults is called with some successful and some failed queries
- **THEN** successful results are formatted and errors are displayed with the error message

### Requirement: Unit Tests for Validation Logic
Input validation logic SHALL have unit tests covering boundary conditions.

#### Scenario: Domain filter limit is tested
- **WHEN** more than 20 domains are provided in search_domain_filter
- **THEN** an error is thrown

#### Scenario: Temperature bounds are tested
- **WHEN** temperature is set outside 0-2 range
- **THEN** an error is thrown

#### Scenario: Batch query limit is tested
- **WHEN** more than 5 queries are provided to perplexity_search
- **THEN** an error is thrown

### Requirement: Mock Tests for Tool Handlers
Tool handlers SHALL have tests using mocked API responses.

#### Scenario: Handler returns formatted response on success
- **WHEN** a tool handler receives valid arguments and the mocked API returns success
- **THEN** the handler returns a properly formatted MCP response with isError: false

#### Scenario: Handler returns error response on API failure
- **WHEN** a tool handler receives valid arguments but the mocked API returns an error
- **THEN** the handler returns an MCP response with isError: true and error details

#### Scenario: Handler validates required arguments
- **WHEN** a tool handler is called without required arguments
- **THEN** the handler returns an error response indicating missing arguments
