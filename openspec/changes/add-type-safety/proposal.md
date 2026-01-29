# Change: Add Type Safety for API Responses

## Why

The code audit identified 5+ locations using the `any` type for API responses, which:
1. Defeats TypeScript's compile-time safety guarantees
2. Makes refactoring risky (no type errors when API structure changes)
3. Reduces IDE autocompletion and documentation
4. Can hide runtime errors that proper types would catch

## What Changes

- Define interfaces for all Perplexity API response structures
- Define interfaces for search result objects
- Define interfaces for chat completion responses
- Define interfaces for async research status responses
- Replace all `any` types with proper interfaces
- Add type guards where necessary for runtime validation

## Impact

- Affected specs: api-types (new)
- Affected code: `index.ts:902`, `index.ts:909`, `index.ts:945`, `index.ts:988`, `index.ts:990`, and related areas
- **No breaking changes** - internal type improvements only
- Better compile-time error detection
- Improved developer experience with autocompletion
