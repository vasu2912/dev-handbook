---
title: MCP mental model
description: Understand MCP hosts, clients, servers, capabilities, trust boundaries, and the role of model reasoning.
---

The Model Context Protocol, or MCP, standardizes how an AI application connects to external capabilities and context. It defines messages and contracts between a host, its clients, and MCP servers.

MCP does not decide which tool the model should call. It does not make a tool safe. It gives the surrounding system a common way to discover and invoke capabilities.

<div data-anatomy="agentic-ai--mcp-1"></div>

## The host owns the user experience and policy

The host is the AI application. It coordinates the model, user consent, security policy, and one or more MCP clients. Examples include an IDE, desktop assistant, or custom agent service.

The host decides which servers may connect, which capabilities appear to the model, what context crosses each boundary, and how a person approves an action.

## A client speaks to one server

An MCP client is the protocol component the host uses for a server connection or request path. The client translates host operations into MCP requests and interprets results.

Keep server boundaries isolated. One server should not receive the host's entire conversation or another server's results unless the host explicitly provides that information.

## A server exposes focused capabilities

An MCP server can expose:

- **Tools**, which the model may propose calling
- **Resources**, which the application can read as context
- **Prompts**, which users can select as reusable templates

Servers can be local processes or remote services. A local server is not automatically trustworthy. It runs code and may access files or credentials granted by the host.

## The protocol boundary does not replace the domain boundary

Wrapping `POST /refunds` as an MCP tool does not change refund policy. The server still needs user identity, tenant scope, input validation, authorization, idempotency, and an audit record.

MCP standardizes the connection. The underlying service remains responsible for its business invariants.

## Modern MCP is stateless at the protocol layer

Protocol revision `2026-07-28` removed the required initialization handshake and protocol session. Each request carries its protocol version and relevant client metadata. A client may call `server/discover` to learn capabilities, but discovery is optional.

Application state can still exist. A server that needs state across calls can return an explicit handle and require it in later arguments.

Read [transports and lifecycle](/agentic-ai/mcp/transports-and-lifecycle/) before using examples written for older session-based revisions.

## Sources

- [MCP specification 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28)
- [The 2026-07-28 specification release](https://blog.modelcontextprotocol.io/posts/2026-07-28/)

*Last verified: September 23, 2026.*
