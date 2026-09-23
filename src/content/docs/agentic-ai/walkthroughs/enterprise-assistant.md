---
title: Design an enterprise assistant
description: Design a permission-preserving assistant for internal knowledge, Jira, GitHub, Slack, and customer systems.
---

The assistant answers internal questions, investigates customer issues, and prepares actions across company systems. It can read only what the signed-in employee may read. It requires approval before externally visible or destructive writes.

## Start with two modes

The read path searches documentation, code, tickets, messages, and approved customer records. The write path creates a draft action, runs policy, shows the normalized effect, and waits for approval.

Keeping these modes separate reduces accidental writes during research.

## Preserve the user's identity

The host authenticates the employee and creates a task context with user, tenant, groups, and approved scopes. An MCP gateway accepts only tokens intended for the gateway or downstream resource. Domain MCP servers apply their own authorization against Jira, GitHub, Slack, or customer systems.

Do not retrieve all company data with an administrator account and ask the model to hide unauthorized results.

## Split by domain and trust

Use focused MCP servers:

- Knowledge server for indexed documents and source resources
- Engineering server for repositories, pull requests, and build results
- Ticketing server for issue reads and approved writes
- Messaging server for search and draft messages
- Customer server for tenant-scoped support records

The gateway filters discovery, applies organization policy, routes calls, and emits common telemetry. Domain servers keep resource-level authorization and business rules.

## Keep context small

The orchestrator stores the task goal, selected customer or incident identifiers, evidence references, unresolved questions, and pending approvals. It retrieves detailed content only when needed.

Conversation summaries do not replace ticket status, repository state, or customer records.

## Treat every content system as untrusted

A Slack message, issue comment, README, or customer email can contain an indirect prompt injection. Search tools return source metadata and content as data. Write tools have narrow contracts and separate authorization.

The model cannot call a generic HTTP client or obtain raw downstream tokens.

## Make writes idempotent and reviewable

A Jira creation tool accepts a stable operation key. A message tool creates a draft first. The approval screen shows project, recipients, title, body, and linked evidence.

After execution, the tool returns the external identifier. The orchestrator verifies that identifier before marking the task complete.

## Trace the whole task

One trace connects the user request, retrievals, model calls, MCP gateway, domain server, downstream API, approval, and final verification. Audit records distinguish model proposal, policy approval, user approval, and confirmed effect.

## Evaluate permission and restraint

The evaluation set includes cross-tenant queries, documents the user cannot access, malicious issue text, conflicting sources, duplicate write retries, expired approvals, and unavailable downstream systems.

Success means a useful answer or action within permission. Refusing an unauthorized request is a successful outcome.
