---
title: MCP security and operations
description: Apply OAuth, audience restrictions, scopes, gateways, tenant isolation, rate limits, audit records, and traces.
---

An MCP server is a resource server with AI-specific discovery and content paths. Apply normal service security first, then account for model-driven selection and untrusted content.

## Keep identity through the full call path

The host begins with a user or workload identity. The server needs an access token intended for that resource. It verifies the issuer, audience or resource binding, expiry, signature, and scopes before applying domain authorization.

Do not place API keys in prompts or tool arguments. Do not reuse one broad service credential for every user unless the product intentionally acts only as that service identity and accepts the audit consequences.

## OAuth discovery does not remove authorization

Protected Resource Metadata identifies authorization servers and resource information. Authorization-server metadata describes endpoints and supported behavior. Modern MCP authorization hardening includes issuer validation and credentials bound to the issuer that created them.

Scopes describe granted categories of access. The server still checks the tenant, object, relationship, and action for each call.

## A gateway centralizes cross-cutting policy

An enterprise gateway can authenticate clients, filter discovery, apply rate limits, route by method and tool name, record traces, and enforce organization policy. It should not become the only authorization layer. Domain servers know facts the gateway does not, such as whether a user may refund one specific invoice.

Header-based routing in MCP `2026-07-28` helps gateways inspect `Mcp-Method` and `Mcp-Name`. The gateway must also reject or pass through server rejection when headers disagree with the JSON-RPC body.

## Isolate tenants before retrieval or execution

Bind tenant identity to the authenticated request context. Do not accept a model-provided `tenantId` as authority. Apply tenant filters to resources, caches, tool results, task state, logs, and subscriptions.

Cache entries need an authorization scope. A tool list or resource fetched for one user must not leak into another user's session because the URI matched.

## Treat server metadata and output as untrusted

A malicious server can publish deceptive tool descriptions or return prompt-injection text. Hosts should require server approval, restrict tools, display consequential actions, sanitize rendering, and keep results inside the same untrusted-data boundary used for web pages and emails.

## Trace across protocol and domain calls

Propagate W3C Trace Context through supported MCP metadata and downstream HTTP calls. Record spans for discovery, tool calls, resource reads, policy checks, approvals, and domain operations. Redact sensitive arguments and results.

Track latency, errors, rate limits, tool selection, input-required rounds, task duration, cancellation, and per-tenant usage.

## Sources

- [MCP authorization specification](https://modelcontextprotocol.io/specification/2026-07-28/basic/authorization)
- [RFC 9728: OAuth 2.0 Protected Resource Metadata](https://www.rfc-editor.org/rfc/rfc9728.html)
- [RFC 9207: OAuth 2.0 Authorization Server Issuer Identification](https://www.rfc-editor.org/rfc/rfc9207.html)
- [W3C Trace Context](https://www.w3.org/TR/trace-context/)
