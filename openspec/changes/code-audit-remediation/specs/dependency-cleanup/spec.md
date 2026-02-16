## MODIFIED Requirements

### Requirement: Remove bogus and unused production dependencies (H4, M1)
The project SHALL NOT include dependencies that are unused or placeholder packages in its production dependency list.

#### Problem
`package.json` declares three unused production dependencies:
- `"openspec": "^0.0.0"` — a placeholder/non-existent package posing supply chain risk
- `"axios": "^1.6.2"` — never imported; code uses native `fetch`
- `"dotenv": "^16.3.1"` — never imported; code reads `process.env` directly

#### Fix
Remove all three from the `dependencies` section of `package.json`. Regenerate `package-lock.json`.

#### Scenario: Clean dependency list
- **GIVEN** the `package.json` file
- **WHEN** a developer inspects the `dependencies` section
- **THEN** only `@modelcontextprotocol/sdk` SHALL be listed as a production dependency

#### Scenario: No supply chain risk from placeholder packages
- **GIVEN** a fresh `npm install`
- **WHEN** the install completes
- **THEN** no `openspec`, `axios`, or `dotenv` packages SHALL be present in `node_modules`

---

### Requirement: Remove orphaned directories (L3, M2)
The repository SHALL NOT contain orphaned directories from previous project structures or unrelated toolchains.

#### Problem
- `perplexity-ask/` contains a stale `package.json` from an earlier structure
- `.venv/` is a Python virtual environment irrelevant to this Node.js project

#### Fix
Delete both directories. Add `.venv/` to `.gitignore`.

#### Scenario: Clean repository structure
- **GIVEN** the repository root
- **WHEN** listing directories
- **THEN** neither `perplexity-ask/` nor `.venv/` SHALL exist
