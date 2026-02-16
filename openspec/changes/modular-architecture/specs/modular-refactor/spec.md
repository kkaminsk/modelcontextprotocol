# Modular Architecture Refactor

## Overview

Decompose the monolithic `index.ts` into a proper `src/` directory with clear separation of concerns.

## Module Boundaries

| Module | Responsibility | Exports |
|--------|---------------|---------|
| `types/index.ts` | TypeScript interfaces | All shared types |
| `config.ts` | Environment config | `getApiKey()`, `getTimeoutMs()` |
| `utils/validation.ts` | Input validation | `validateMessages()`, `buildCommonOptions()` |
| `utils/api-client.ts` | API communication | All fetch/format functions |
| `tools/*.ts` | Tool definitions + handlers | Tool constant + handler function |
| `server.ts` | Server factory | `createServer()` |
| `index.ts` | Entry point | None (side-effect only) |

## Design Decisions

- Each tool file exports both the Tool schema constant and its handler function
- API key and timeout are passed as parameters (not module-level globals) for testability
- `createServer()` factory pattern allows test instantiation without stdio transport
- Original `index.ts` kept at root for reference but excluded from compilation
