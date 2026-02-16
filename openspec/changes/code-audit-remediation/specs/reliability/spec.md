## MODIFIED Requirements

### Requirement: Streaming timeout covers full stream lifecycle (M7)
The streaming chat completion function SHALL maintain timeout protection during the entire stream read, not just the initial connection.

#### Problem
In `performStreamingChatCompletion()`, the `AbortController` timeout is cleared after `fetch()` resolves. If the stream stalls during chunk reading, the process hangs indefinitely.

#### Fix
Keep the abort controller active during stream reading. Reset the timeout on each received chunk to implement an inactivity timeout.

#### Scenario: Stalled stream is aborted
- **GIVEN** a streaming API response that stops sending data
- **WHEN** no new chunks are received for the configured timeout period
- **THEN** the stream SHALL be aborted with a timeout error

---

### Requirement: Functional CI/CD publish workflow (M5)
The GitHub Actions publish workflow SHALL authenticate with npm using a token.

#### Problem
`.github/workflows/publish.yml` runs `npm publish` without setting `NODE_AUTH_TOKEN`, causing authentication failures.

#### Fix
Add `env: NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}` to the publish step.

#### Scenario: Automated npm publish succeeds
- **GIVEN** a push to main that changes `package.json`
- **WHEN** the publish workflow runs
- **THEN** the `npm publish` step SHALL have `NODE_AUTH_TOKEN` available for authentication
