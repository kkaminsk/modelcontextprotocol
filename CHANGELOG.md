# Changelog

All notable changes to the Perplexity MCP Server will be documented in this file.

## [0.2.3] - 2026-02-15

### Fixed
- Removed bogus `openspec` dependency (supply chain risk)
- Removed unused `axios` and `dotenv` dependencies
- Fixed server metadata name/version to match package.json
- Fixed GitHub Actions publish workflow missing `NODE_AUTH_TOKEN`
- Fixed streaming timeout not covering full stream read lifecycle
- Added message content validation before API calls

### Improved
- Extracted shared `buildCommonOptions()` helper to eliminate code duplication
- Added TypeScript interfaces for API responses (replaced `any` types)
- Removed unnecessary `new URL()` constructions for static API URLs

### Removed
- Deleted orphaned `.venv/` Python virtual environment
- Deleted orphaned `perplexity-ask/` directory

### Added
- CHANGELOG.md
- Code audit report (CodeAudit.md)
- OpenSpec remediation proposals

## [0.2.2] - 2025-12-21

### Added
- Async research API support (`perplexity_research_async`, `perplexity_research_status`)
- Streaming support for `perplexity_ask` and `perplexity_reason`
- Multi-query batch search (up to 5 queries)
- Image and related question return options
- Date filtering parameters
- Search mode selection (web, academic, sec)
- Domain filtering support

## [0.1.0] - Initial Release

### Added
- `perplexity_ask` tool with sonar/sonar-pro models
- `perplexity_research` tool with sonar-deep-research model
- `perplexity_reason` tool with sonar-reasoning-pro model
- `perplexity_search` tool for web search
