## ADDED Requirements

### Requirement: Non-Root Container Execution
The Docker container SHALL run as a non-root user by default.

#### Scenario: Container runs as node user
- **WHEN** the container is started without explicit user override
- **THEN** the process runs as the `node` user, not root

#### Scenario: Application files are accessible
- **WHEN** the container starts as the node user
- **THEN** the application in /app has read and execute permissions

### Requirement: Container Health Check
The Docker container SHALL include a health check for orchestration systems.

#### Scenario: Health check passes when server is ready
- **WHEN** the MCP server process is running and responsive
- **THEN** the HEALTHCHECK reports healthy status

#### Scenario: Health check interval is appropriate
- **WHEN** examining the Dockerfile HEALTHCHECK instruction
- **THEN** interval is 30s, timeout is 3s, and retries is 3

#### Scenario: Orchestrator can detect unhealthy state
- **WHEN** the container process crashes or hangs
- **THEN** Docker reports the container as unhealthy after the configured retries

### Requirement: Minimal Attack Surface
The Docker image SHALL follow security best practices to minimize attack surface.

#### Scenario: No unnecessary packages installed
- **WHEN** examining the final Docker image
- **THEN** only runtime dependencies are present (no build tools, dev dependencies)

#### Scenario: Production environment is set
- **WHEN** the container runs
- **THEN** NODE_ENV is set to "production"
