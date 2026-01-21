# Design: Upgrade MCP SDK

## Current SDK Usage Analysis

The codebase uses the following imports from `@modelcontextprotocol/sdk`:

```typescript
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
```

### API Surface Used

| API | Usage | Risk Level |
|-----|-------|------------|
| `Server` class | Server initialization with name/version/capabilities | Low - stable core API |
| `StdioServerTransport` | Stdio communication transport | Low - stable core API |
| `server.setRequestHandler()` | Register handlers for ListTools/CallTool | Low - stable core API |
| `server.connect()` | Connect server to transport | Low - stable core API |
| `ListToolsRequestSchema` | Schema for tools/list request | Low - stable |
| `CallToolRequestSchema` | Schema for tools/call request | Low - stable |
| `Tool` type | Type definition for tool schema | Low - stable |

## SDK Changes Impact Assessment

### v1.0.1 → v1.25.3 Breaking Changes

1. **Schema Strictness (v1.25.0)**
   - Impact: Tool input schemas must strictly comply with MCP spec
   - Current schemas use standard JSON Schema (`type`, `properties`, `required`)
   - **Risk: Low** - existing schemas are compliant

2. **Server Framework Refactor (v1.24.2)**
   - Express moved to separate module
   - **Risk: None** - we use StdioServerTransport, not HTTP/Express

3. **Zod v4 Support (v1.23.0)**
   - Backwards compatible with Zod v3.25+
   - **Risk: None** - we don't use Zod directly

### Security Fixes Gained

- ReDoS vulnerability in URI template regex (v1.25.2)
- HTTP connection resource leaks (v1.24.3)

### New Features Available (Not Used)

- Task support (v1.25.0)
- Fetch transport (v1.25.0)
- SSE polling (v1.23.0)
- URL Elicitation (v1.23.0)
- Sampling with Tools (v1.23.0)

## Migration Strategy

### Approach: Direct Upgrade

Since our SDK usage is limited to stable core APIs (Server, StdioServerTransport, schemas), a direct version bump is the recommended approach.

```diff
- "@modelcontextprotocol/sdk": "^1.0.1",
+ "@modelcontextprotocol/sdk": "^1.25.3",
```

### Validation Steps

1. **Type Check**: Run `npm run build` to verify TypeScript compilation
2. **Smoke Test**: Start server and verify tool listing works
3. **Integration Test**: Call each tool with sample inputs

## Decision

**Proceed with direct upgrade** - the APIs used are stable and well-tested across the version range. No code changes expected beyond `package.json`.
