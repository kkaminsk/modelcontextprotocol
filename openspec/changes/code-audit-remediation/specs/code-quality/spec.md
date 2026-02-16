## MODIFIED Requirements

### Requirement: Eliminate option-building code duplication (H2)
The server SHALL use a shared helper function for extracting and validating common API request options from tool arguments.

#### Problem
The `CallToolRequestSchema` handler repeats identical option extraction logic (temperature, max_tokens, top_p, top_k, search_mode, date filters, domain filters) for `perplexity_ask`, `perplexity_research`, and `perplexity_reason` — approximately 20 lines duplicated 3 times.

#### Fix
Extract a `buildCommonOptions(args)` function that returns a typed options object. Each tool handler calls this shared function.

#### Scenario: Single point of change for option handling
- **GIVEN** a new optional parameter needs to be added to all chat completion tools
- **WHEN** a developer adds the parameter
- **THEN** the change SHALL be made in exactly one function (`buildCommonOptions`)

---

### Requirement: Type-safe API responses (M3)
The server SHALL define TypeScript interfaces for all Perplexity API response shapes and avoid `any` types.

#### Problem
`formatSearchResults()`, `formatMultiQueryResults()`, and `performSingleSearch()` all use `any` type, bypassing compile-time safety.

#### Fix
Define `PerplexitySearchResponse`, `PerplexityChatResponse` interfaces and use them in function signatures.

#### Scenario: Compile-time type checking on API responses
- **GIVEN** a Perplexity API response is received
- **WHEN** the code accesses response properties
- **THEN** TypeScript SHALL enforce the expected shape at compile time

---

### Requirement: Accurate server metadata (M4)
The MCP server SHALL report its name and version consistent with `package.json`.

#### Problem
Server is initialized with `name: "example-servers/perplexity-ask"` and `version: "0.1.0"`, while `package.json` says `@perplexity-ai/mcp-server` at `0.2.2`.

#### Fix
Update the Server constructor to use the correct name and version.

#### Scenario: Server identifies itself correctly
- **GIVEN** an MCP client connects to the server
- **WHEN** the client queries server metadata
- **THEN** the name SHALL be `@perplexity-ai/mcp-server` and version SHALL match `package.json`

---

### Requirement: Message content validation (M6)
The server SHALL validate that each message in the `messages` array contains valid `role` and `content` string properties before sending to the API.

#### Problem
Only `Array.isArray(args.messages)` is checked. Messages with missing/invalid `role` or `content` pass through to the API, producing opaque 400 errors.

#### Fix
Add validation loop checking each message has string `role` and `content`.

#### Scenario: Invalid message rejected with clear error
- **GIVEN** a tool call with `messages: [{ "role": 123 }]`
- **WHEN** the handler processes the request
- **THEN** it SHALL return an error message stating the message format is invalid
- **AND** no API request SHALL be made
