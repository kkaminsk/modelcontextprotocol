## Context

The Perplexity MCP Server has no automated tests, making it risky to refactor or add features. This change establishes a testing foundation.

## Goals / Non-Goals

**Goals:**
- Establish test infrastructure with Vitest
- Create unit tests for pure functions (formatting, validation)
- Create mock tests for tool handlers
- Enable test-driven development for future changes

**Non-Goals:**
- End-to-end tests with real Perplexity API (too slow, requires API key)
- 100% code coverage (diminishing returns)
- UI or visual testing (not applicable)

## Decisions

### Decision 1: Use Vitest over Jest
**Choice:** Vitest

**Rationale:**
- Native ESM support (project uses `"type": "module"`)
- Native TypeScript support without additional configuration
- Faster execution than Jest
- Compatible with Jest API (familiar syntax)
- Active development and growing ecosystem

### Decision 2: Test File Location
**Choice:** Colocated `*.test.ts` files next to source

**Rationale:**
- Easier to find tests for a given file
- Single-file architecture means fewer test files anyway
- Can use `__tests__/` folder if files proliferate later

### Decision 3: Mock Strategy
**Choice:** Mock `fetch` globally for API tests

**Rationale:**
- All API calls use native fetch
- Mocking at fetch level allows testing full handler flow
- Avoids need for real API key in tests
- Can simulate various response scenarios (success, error, timeout)

### Decision 4: Coverage Targets
**Choice:** No enforced minimum initially

**Rationale:**
- Start with critical path coverage
- Avoid test bloat for trivial code
- Add coverage requirements as test suite matures

## Test Structure

```
index.ts                    # Source file
index.test.ts               # Main test file OR
__tests__/
  formatting.test.ts        # Format function tests
  validation.test.ts        # Validation logic tests
  handlers.test.ts          # Tool handler tests
  mocks/
    fetch.ts                # Fetch mock utilities
vitest.config.ts            # Vitest configuration
```

## Risks / Trade-offs

| Risk | Mitigation |
|------|------------|
| Tests become stale | Run tests in CI on every PR |
| Over-mocking hides bugs | Test at handler level, not just unit level |
| Slow test suite | Use Vitest's speed, avoid unnecessary setup |

## Open Questions

- Should we add GitHub Actions workflow for CI? (Depends on project CI setup)
