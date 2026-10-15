---
title: MCP transports and lifecycle
description: Understand stdio, Streamable HTTP, the 2026 stateless lifecycle, discovery, headers, caching, and compatibility.
---

MCP supports local process communication through stdio and remote communication through Streamable HTTP. Custom transports must preserve the protocol's message and security requirements.

<div data-anatomy="agentic-ai--mcp--transports-and-lifecycle-1"></div>

## Stdio fits local, process-owned servers

With stdio, the host launches or connects to a local server process. JSON-RPC messages travel through standard input and output. Logs must not corrupt the protocol stream, so local servers write diagnostic output to standard error.

The host controls the process lifecycle. It also decides which environment variables, files, and credentials the child process receives.

## Streamable HTTP fits remote servers

Streamable HTTP sends MCP requests to an HTTP endpoint. Remote deployment adds normal web concerns: TLS, authentication, authorization, origins, rate limits, request size, load balancing, and denial-of-service protection.

In protocol revision `2026-07-28`, Streamable HTTP requests include routing headers such as `Mcp-Method` and `Mcp-Name`. Gateways can route or meter calls without parsing the JSON body. The server must reject a mismatch between headers and body.

## The modern lifecycle has no handshake session

The `2026-07-28` revision removed `initialize`, `initialized`, and the `Mcp-Session-Id` transport session. Every request carries its protocol version and relevant client capabilities in `_meta`.

The optional `server/discover` method lets a client inspect server capabilities before another request. A client can also send a self-describing request directly.

This design lets ordinary load balancers send independent requests to any compatible server instance. Application-level state remains explicit through handles, durable stores, or tool arguments.

## Caching replaces some long-lived coordination

List and resource-read results can include `ttlMs` and `cacheScope`. The client uses those fields to decide how long the result remains fresh and whether it can be shared across authorization contexts.

Notifications use an opt-in `subscriptions/listen` stream in the modern revision. Do not confuse a notification stream with a protocol session.

## Older examples use a different era

MCP revisions through `2025-11-25` use an initialization handshake and stateful session model. They can issue server-to-client requests during an active operation. Many existing SDK examples and deployments still use that lifecycle.

Name the revision in documentation, tests, and telemetry. A compatibility layer may support both eras, but the application should not mix their wire behavior in one explanation.

The legacy HTTP plus SSE transport is deprecated for new implementations in the `2026-07-28` release. Use Streamable HTTP for new remote servers.

## Sources

- [MCP 2026-07-28 release](https://blog.modelcontextprotocol.io/posts/2026-07-28/)
- [MCP TypeScript SDK support for 2026-07-28](https://ts.sdk.modelcontextprotocol.io/v2/migration/support-2026-07-28)

*Last verified: September 23, 2026.*
