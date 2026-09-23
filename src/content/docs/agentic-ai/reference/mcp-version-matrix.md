---
title: MCP version matrix
description: Compare the modern 2026-07-28 MCP lifecycle with the session-based 2025 protocol era.
---

MCP examples belong to two protocol eras. Identify the revision before copying lifecycle or transport code.

| Concern | 2025 era through `2025-11-25` | Modern `2026-07-28` |
|---|---|---|
| Opening exchange | `initialize`, then `initialized` | No required handshake |
| Protocol version | Negotiated during initialization | Carried on every request |
| Protocol session | Stateful session and optional `Mcp-Session-Id` over HTTP | No protocol-level session |
| Capability discovery | Initialization result | Optional `server/discover` or self-describing request |
| Client metadata | Session-scoped | Per-request `_meta` envelope |
| Server-to-client input | Server-initiated requests during an active operation | `input_required`, followed by client retry |
| Long-running tasks | Experimental core behavior in `2025-11-25` | `io.modelcontextprotocol/tasks` extension |
| Change notifications | Session notifications and HTTP listening behavior | Opt-in `subscriptions/listen` stream |
| HTTP routing | JSON-RPC body and session routing | Required method and name headers support routing |
| List caching | Client-specific behavior | `ttlMs` and `cacheScope` on relevant results |
| Legacy HTTP plus SSE | Compatibility transport | Deprecated for new implementations |
| Roots | Supported client feature | Deprecated for new implementations |
| Sampling | Supported client feature | Deprecated for new implementations |
| Protocol logging | Supported | Deprecated in favor of standard diagnostics and telemetry |

## TypeScript SDK implications

The TypeScript SDK v2 is the stable line for MCP `2026-07-28`.

- Use `@modelcontextprotocol/server` and `@modelcontextprotocol/client` packages.
- Use `serveStdio(factory)` for modern or dual-era stdio serving.
- Use `createMcpHandler(factory)` for the modern per-request HTTP entry point.
- Use `registerTool`, `registerResource`, and `registerPrompt` with explicit configuration objects.
- Treat examples importing from `@modelcontextprotocol/sdk` as v1 material unless the page states otherwise.

## Migration rule

Write new application handlers in the modern `input_required` style. Use an SDK compatibility layer when older clients remain in scope. Do not reproduce both protocol eras manually inside each tool.

## Sources

- [MCP 2026-07-28 release](https://blog.modelcontextprotocol.io/posts/2026-07-28/)
- [MCP TypeScript SDK protocol versions](https://ts.sdk.modelcontextprotocol.io/v2/protocol-versions)
- [MCP TypeScript SDK v2 migration guide](https://ts.sdk.modelcontextprotocol.io/v2/migration/upgrade-to-v2)

*Last verified: September 23, 2026.*
