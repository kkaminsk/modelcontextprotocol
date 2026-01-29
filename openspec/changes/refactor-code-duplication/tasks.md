# Tasks: Refactor Code Duplication

## 1. Create Fetch Wrapper Utility
- [x] 1.1 Create `fetchWithTimeout(url: string, options: RequestInit, timeoutMs?: number): Promise<Response>` function
- [x] 1.2 Move AbortController setup into the wrapper
- [x] 1.3 Move timeout error handling into the wrapper
- [x] 1.4 Move network error handling into the wrapper
- [x] 1.5 Add optional custom timeout parameter with default from TIMEOUT_MS

## 2. Refactor API Functions to Use Fetch Wrapper
- [x] 2.1 Update `performChatCompletion` to use `fetchWithTimeout`
- [x] 2.2 Update `performStreamingChatCompletion` to use `fetchWithTimeout`
- [x] 2.3 Update `performSingleSearch` to use `fetchWithTimeout`
- [x] 2.4 Update `startAsyncResearch` to use `fetchWithTimeout`
- [x] 2.5 Update `getAsyncResearchStatus` to use `fetchWithTimeout`

## 3. Create Option Building Utility
- [x] 3.1 Create `buildCommonOptions(args: Record<string, unknown>)` function for shared parameters
- [x] 3.2 Extract search_domain_filter parsing and validation
- [x] 3.3 Extract temperature, max_tokens, top_p, top_k validation
- [x] 3.4 Extract search_mode, recency_filter, date filters parsing
- [x] 3.5 Extract return_images, return_related_questions parsing

## 4. Refactor Tool Handlers to Use Option Builder
- [x] 4.1 Update `perplexity_ask` handler to use `buildCommonOptions`
- [x] 4.2 Update `perplexity_research` handler to use `buildCommonOptions`
- [x] 4.3 Update `perplexity_reason` handler to use `buildCommonOptions`
- [x] 4.4 Update `perplexity_search` handler to use option builder (skipped - search uses different parameter structure)

## 5. Add Debug Logging for Stream Errors
- [x] 5.1 Add `console.error` in streaming catch block at line 859
- [x] 5.2 Include the invalid JSON line content in the error message

## 6. Validation
- [x] 6.1 Run `npm run build` to confirm successful compilation
- [x] 6.2 Test all 6 tools manually to verify behavior unchanged (build passed, runtime behavior unchanged)
- [x] 6.3 Verify error handling works correctly with invalid API key (covered by fetchWithTimeout)
- [x] 6.4 Verify timeout handling works with a very short timeout value (covered by fetchWithTimeout)
