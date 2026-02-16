## 1. Dependency Cleanup (High + Medium Severity)

- [ ] 1.1 Remove `openspec` from dependencies in `package.json` — **1 min**
- [ ] 1.2 Remove `axios` from dependencies in `package.json` — **1 min**
- [ ] 1.3 Remove `dotenv` from dependencies in `package.json` — **1 min**
- [ ] 1.4 Delete orphaned `perplexity-ask/` directory — **1 min**
- [ ] 1.5 Regenerate `package-lock.json` — **2 min**

## 2. Code Quality (High + Medium Severity)

- [ ] 2.1 Extract shared `buildCommonOptions(args)` helper function to eliminate option-building duplication — **15 min**
- [ ] 2.2 Add TypeScript interfaces for API responses (`ChatCompletionResponse`, `SearchResponse`) — **15 min**
- [ ] 2.3 Fix server metadata: sync name and version with `package.json` values — **2 min**
- [ ] 2.4 Add message array content validation (check each message has string `role` and `content`) — **10 min**

## 3. Repo Hygiene

- [ ] 3.1 Delete `.venv/` directory from repository — **1 min**
- [ ] 3.2 Add `.venv/` to `.gitignore` — **1 min**
- [ ] 3.3 Remove unnecessary `new URL()` constructions for static API URLs — **5 min**
- [ ] 3.4 Add `CHANGELOG.md` — **5 min**

## 4. Reliability

- [ ] 4.1 Fix streaming timeout: keep AbortController active during stream reading — **10 min**
- [ ] 4.2 Fix GitHub Actions publish workflow: add `NODE_AUTH_TOKEN` env var — **2 min**

## 5. Validation

- [ ] 5.1 Run `npm run build` to confirm TypeScript compilation succeeds — **1 min**
- [ ] 5.2 Verify no `any` types remain in modified functions — **2 min**
