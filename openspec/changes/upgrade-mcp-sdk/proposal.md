# Proposal: Upgrade MCP SDK

**Change ID:** `upgrade-mcp-sdk`
**Status:** Draft
**Author:** AI Assistant
**Created:** 2026-01-20

## Summary

Upgrade `@modelcontextprotocol/sdk` from v1.0.1 to v1.25.3 to gain access to 24+ versions of bug fixes, security patches, and new protocol features.

## Motivation

The current codebase uses MCP SDK v1.0.1, which is significantly outdated. The latest version (v1.25.3) includes:

- **Security fixes**: ReDoS vulnerability in URI template regex (v1.25.2), HTTP connection resource leaks (v1.24.3)
- **Protocol updates**: Spec version 2025-11-25 with new capabilities
- **New features**: Task support, Fetch transport, SSE polling enhancements
- **Bug fixes**: Schema validation corrections, sampling improvements

As the core dependency for this MCP server, staying current is essential for compatibility with MCP clients and security.

## Scope

### In Scope
- Upgrade `@modelcontextprotocol/sdk` from ^1.0.1 to ^1.25.3
- Verify existing API usage is compatible with new version
- Update any deprecated API calls if needed
- Validate build and runtime behavior

### Out of Scope
- Adding new MCP features (tasks, URL elicitation, etc.)
- Upgrading other dependencies (axios, dotenv, typescript)
- Changing existing tool functionality

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Breaking API changes | Low | Medium | Current usage (Server, Transport, schemas) is stable core API |
| Schema validation stricter | Medium | Low | Existing schemas should comply with MCP spec |
| Runtime incompatibility | Low | High | Manual testing with MCP client after upgrade |

## Success Criteria

1. Project builds without errors after upgrade
2. All existing tools (ask, research, reason, search, async) function correctly
3. No type errors from SDK usage
4. MCP client can connect and invoke tools successfully

## Related Documents

- [design.md](./design.md) - Technical analysis of SDK changes
- [tasks.md](./tasks.md) - Implementation checklist
