# Change: Fix Package Hygiene Issues

## Why

The code audit identified package configuration issues that affect build cleanliness and version consistency:
1. Unused runtime dependencies (`axios`, `dotenv`) increase bundle size and attack surface
2. Server metadata version (0.1.0) doesn't match package.json version (0.2.2)
3. Magic numbers scattered throughout the codebase reduce maintainability

## What Changes

- Move `axios` and `dotenv` from dependencies to devDependencies (or remove if truly unused)
- Move `openspec` to devDependencies (it's a development tool)
- Sync server metadata version with package.json by importing or reading version at runtime
- Extract magic numbers to named constants (`DEFAULT_TIMEOUT_MS`, `MAX_DOMAIN_FILTERS`, `MAX_BATCH_QUERIES`, `DEFAULT_MODEL`)

## Impact

- Affected specs: build-config (new)
- Affected code: `package.json`, `index.ts:483`, `index.ts:1315-1319`
- **No breaking changes** - internal refactoring only
- Reduced production bundle size
- Improved version consistency for debugging
