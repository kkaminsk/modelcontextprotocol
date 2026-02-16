## 1. Module Extraction

- [x] 1.1 Create `src/types/index.ts` with all shared interfaces — **5 min**
- [x] 1.2 Create `src/config.ts` with getApiKey/getTimeoutMs — **3 min**
- [x] 1.3 Create `src/utils/validation.ts` with validateMessages and buildCommonOptions — **5 min**
- [x] 1.4 Create `src/utils/api-client.ts` with all API functions — **15 min**
- [x] 1.5 Create `src/tools/perplexity_ask.ts` with tool definition and handler — **5 min**
- [x] 1.6 Create `src/tools/perplexity_research.ts` — **5 min**
- [x] 1.7 Create `src/tools/perplexity_reason.ts` — **5 min**
- [x] 1.8 Create `src/tools/perplexity_search.ts` — **5 min**
- [x] 1.9 Create `src/tools/perplexity_research_async.ts` (includes status tool) — **5 min**
- [x] 1.10 Create `src/server.ts` with createServer factory — **5 min**
- [x] 1.11 Create `src/index.ts` entry point — **3 min**

## 2. Build Configuration

- [x] 2.1 Update `tsconfig.json` rootDir to `./src`, exclude tests — **2 min**
- [x] 2.2 Verify `npm run build` succeeds — **1 min**
- [x] 2.3 Verify Dockerfile still works (references `dist/`, no change needed) — **1 min**

## 3. Documentation

- [x] 3.1 Update CLAUDE.md architecture section — **5 min**
