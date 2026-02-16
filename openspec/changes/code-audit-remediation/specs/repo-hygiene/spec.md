## MODIFIED Requirements

### Requirement: Updated .gitignore (M2)
The `.gitignore` SHALL exclude Python virtual environments and other non-project artifacts.

#### Fix
Add `.venv/` and `perplexity-ask/` entries to `.gitignore`.

#### Scenario: Python venvs are ignored
- **GIVEN** a developer creates a `.venv/` directory
- **WHEN** they run `git status`
- **THEN** the `.venv/` directory SHALL NOT appear as untracked

---

### Requirement: Remove unnecessary URL object construction (L2)
Static API URL strings SHALL be used directly rather than wrapped in `new URL()` objects.

#### Fix
Replace `new URL("https://api.perplexity.ai/...").toString()` with the string literal.

#### Scenario: Clean URL usage
- **GIVEN** the API client functions
- **WHEN** constructing fetch requests
- **THEN** static URL strings SHALL be passed directly to `fetch()`

---

### Requirement: CHANGELOG (L5)
The project SHALL maintain a CHANGELOG.md documenting version history.

#### Scenario: Version history is discoverable
- **GIVEN** a user wants to know what changed in a release
- **WHEN** they open CHANGELOG.md
- **THEN** they SHALL find entries organized by version with change descriptions
