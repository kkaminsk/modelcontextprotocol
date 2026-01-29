## ADDED Requirements

### Requirement: Runtime Dependencies Minimization
The package SHALL only include runtime dependencies that are actively imported and used by the production code.

#### Scenario: Production bundle contains no unused packages
- **WHEN** the package is installed with `npm install --production`
- **THEN** only `@modelcontextprotocol/sdk` is installed as a runtime dependency

#### Scenario: Development tools are in devDependencies
- **WHEN** a developer examines `package.json`
- **THEN** `axios`, `dotenv`, and `openspec` appear under `devDependencies`

### Requirement: Version Consistency
The MCP server metadata version SHALL match the version declared in `package.json`.

#### Scenario: Server reports consistent version
- **WHEN** the MCP server connects to a client
- **THEN** the server metadata version matches the package.json version field

#### Scenario: Version is single source of truth
- **WHEN** a developer updates the package version
- **THEN** only `package.json` needs to be modified

### Requirement: Named Constants for Configuration
Configuration values used in multiple locations SHALL be defined as named constants.

#### Scenario: Timeout constant is defined
- **WHEN** a developer reads the timeout configuration
- **THEN** they find `DEFAULT_TIMEOUT_MS` constant with value 300000

#### Scenario: Domain filter limit constant is defined
- **WHEN** validation checks domain filter array length
- **THEN** it references `MAX_DOMAIN_FILTERS` constant with value 20

#### Scenario: Batch query limit constant is defined
- **WHEN** validation checks batch query array length
- **THEN** it references `MAX_BATCH_QUERIES` constant with value 5

#### Scenario: Default model constant is defined
- **WHEN** a tool handler needs the default model
- **THEN** it references `DEFAULT_MODEL` constant with value "sonar-pro"
