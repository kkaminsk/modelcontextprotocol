## Why

The entire Perplexity MCP Server (~1,660 lines) lives in a single `index.ts` file. This makes the codebase difficult to navigate, test, and maintain. Tool definitions, API client logic, validation, types, and server setup are all interleaved. The code audit (CodeAudit.md) flagged this as a critical architectural issue.

## What Changes

- **Refactor**: Split monolithic `index.ts` into modular `src/` directory structure
  - `src/index.ts` — entry point (stdio transport)
  - `src/server.ts` — MCP server config and tool registration
  - `src/config.ts` — environment variable handling
  - `src/types/index.ts` — shared TypeScript interfaces
  - `src/utils/validation.ts` — input validation (validateMessages, buildCommonOptions)
  - `src/utils/api-client.ts` — API client (fetch, streaming, search, formatting)
  - `src/tools/` — one file per tool with definition + handler
- **Update**: `tsconfig.json` rootDir → `src/`, exclude tests
- **Update**: Dockerfile unchanged (already references `dist/`)

## Capabilities

### Modified Capabilities
- `modular-refactor`: Decompose single file into proper module hierarchy with clear separation of concerns

## Impact

- **Risk reduction**: Enables unit testing, easier code review, and independent module evolution
- **Breaking changes**: None — all existing functionality preserved, same build output
- **Effort**: ~60 minutes
- **Dependencies**: None
