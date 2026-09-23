---
title: Identity and sandboxing
description: Scope credentials, propagate user identity, isolate tenants, restrict networks, and contain code execution.
---

An agent should receive enough authority for the current task and no more. Prompts do not reduce the permissions attached to a credential.

## Distinguish three identities

A production request can involve:

- The human user
- The agent application or workload
- The external service account or delegated token

Record which identity authorized the action and which credential performed it. A shared backend credential may be operationally convenient, but it weakens per-user authorization and audit evidence.

## Bind identity outside model arguments

Derive the user, tenant, and granted scopes from authenticated request context. Do not ask the model to provide them as ordinary tool fields.

The model may supply the target resource identifier. The tool combines that identifier with trusted identity context and asks the authorization layer for a decision.

## Use short-lived, scoped credentials

Prefer credentials limited by audience, scope, tenant, action, and time. Do not place credentials in prompts, conversation memory, tool results, or trace attributes.

If a tool needs a downstream token, obtain it through a trusted credential service. The model should never handle the token string.

## Tenant isolation crosses every store

Apply tenant scope to databases, retrieval indexes, vector metadata, caches, memory, task state, logs, evaluation datasets, and MCP resources. A shared cache key such as `customer:42` is unsafe if two tenants can have customer `42`.

Test negative access paths. A correct happy-path query does not prove isolation.

## Sandboxes limit code effects

A code sandbox needs controls for:

- Filesystem mounts and writable paths
- Processes and system calls
- CPU, memory, storage, and execution time
- Network destinations and DNS
- Environment variables and credentials
- Package installation
- Output size

Use a short-lived environment built from a known image. Mount the minimum input and collect explicit output. Do not mount the host's credential directories or container runtime socket.

## Restrict network egress

An HTTP client that accepts any URL can reach internal metadata services, local admin endpoints, or attacker-controlled hosts. Parse and normalize destinations, resolve DNS safely, block private and link-local ranges where appropriate, and use an allowlist for high-risk tools.

Revalidate redirects. The first URL can be allowed while a later redirect targets a forbidden address.

## Sources

- [OWASP Server-Side Request Forgery Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html)
- [OAuth 2.0 Security Best Current Practice, RFC 9700](https://www.rfc-editor.org/rfc/rfc9700.html)
