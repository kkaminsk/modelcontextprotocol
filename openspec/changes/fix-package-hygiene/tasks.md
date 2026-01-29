# Tasks: Fix Package Hygiene

## 1. Dependency Cleanup
- [x] 1.1 Move `axios` from dependencies to devDependencies in `package.json`
- [x] 1.2 Move `dotenv` from dependencies to devDependencies in `package.json`
- [x] 1.3 Move `openspec` from dependencies to devDependencies in `package.json`
- [x] 1.4 Run `npm install` to verify no import errors occur at runtime
- [x] 1.5 Verify build still works with `npm run build`

## 2. Version Synchronization
- [x] 2.1 Create `version.ts` constant or read from package.json at build time
- [x] 2.2 Update server metadata in `index.ts:1315-1319` to use the synchronized version
- [x] 2.3 Verify server reports correct version at startup

## 3. Magic Number Constants
- [x] 3.1 Add `DEFAULT_TIMEOUT_MS = 300000` constant at top of `index.ts`
- [x] 3.2 Add `MAX_DOMAIN_FILTERS = 20` constant
- [x] 3.3 Add `MAX_BATCH_QUERIES = 5` constant
- [x] 3.4 Add `DEFAULT_MODEL = "sonar-pro"` constant
- [x] 3.5 Replace all hardcoded values with named constants
- [x] 3.6 Update JSDoc comments to reference constant names

## 4. Validation
- [x] 4.1 Run `npm run build` to confirm successful compilation
- [x] 4.2 Manually test server startup with `node dist/index.js`
- [x] 4.3 Verify package.json is valid JSON
