# Tasks: Upgrade MCP SDK

## Implementation Checklist

### Phase 1: Upgrade
- [x] Update `@modelcontextprotocol/sdk` version in package.json from ^1.0.1 to ^1.25.3
- [x] Run `npm install` to update package-lock.json
- [x] Update `openspec/project.md` to reflect new SDK version

### Phase 2: Validation
- [x] Run `npm run build` - verify TypeScript compilation succeeds
- [x] Check for any type errors or deprecation warnings in build output
- [x] Start server manually and verify it initializes without errors

### Phase 3: Functional Testing
- [ ] Test `perplexity_ask` tool invocation (requires API key)
- [ ] Test `perplexity_research` tool invocation (requires API key)
- [ ] Test `perplexity_reason` tool invocation (requires API key)
- [ ] Test `perplexity_search` tool invocation (requires API key)
- [ ] Test `perplexity_research_async` and `perplexity_research_status` tools (requires API key)

### Phase 4: Documentation
- [x] Update README if SDK version is mentioned (not mentioned, no change needed)
- [x] Verify CLAUDE.md reflects accurate dependency info (updated via project.md)

## Dependencies

- Phase 2 depends on Phase 1
- Phase 3 depends on Phase 2
- Phase 4 can run in parallel with Phase 3

## Notes

- Functional testing (Phase 3) requires `PERPLEXITY_API_KEY` environment variable
- Phase 3 items left unchecked as they require live API access
- Build and startup validation confirmed SDK upgrade is compatible
