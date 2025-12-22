# OpenSpec Change Proposals

This directory contains proposals for addressing technical disconnects between the current Perplexity MCP Server implementation and the full Perplexity API capabilities.

**Source Document:** [perplexityremediation.md](../perplexityremediation.md)
**Date:** 2025-12-21

## Active Proposals

### P2 - Medium (Enhanced Functionality)

| # | Proposal | Affected Tools | Status |
|---|----------|----------------|--------|
| [008](008-streaming-support.md) | Streaming Response Support | `ask`, `reason` | Proposed |
| [009](009-images-related-questions.md) | Images & Related Questions | `ask`, `research` | Proposed |

### P3 - Low (Nice to Have)

| # | Proposal | Affected Tools | Status |
|---|----------|----------------|--------|
| [010](010-multi-query-search.md) | Multi-Query Search | `perplexity_search` | Proposed |

## Archived (Implemented)

See [archive/2025-12-21-perplexity-api-enhancements/](archive/2025-12-21-perplexity-api-enhancements/) for completed proposals:

- 001 - Reasoning Effort Parameter
- 002 - Search Domain Filter
- 003 - Async Research API
- 004 - Search Mode Parameter
- 005 - Temperature & Max Tokens
- 006 - Date Filtering Parameters
- 007 - Sonar Model Selection

## Proposal Status Key

| Status | Meaning |
|--------|---------|
| Proposed | Initial proposal, awaiting review |
| Approved | Reviewed and approved for implementation |
| In Progress | Currently being implemented |
| Completed | Implemented and released |
| Deferred | Postponed to future release |
| Rejected | Not implementing |

## Contributing

When adding new proposals:

1. Use the next available proposal number
2. Follow the existing template structure
3. Include schema updates, implementation details, and examples
4. Add entry to this index
5. Reference the original remediation document section
