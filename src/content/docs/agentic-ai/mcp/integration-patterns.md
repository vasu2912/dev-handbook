---
title: MCP integration patterns
description: Wrap existing APIs, databases, documentation, Kafka, Kubernetes, and domain services without exposing unsafe primitives.
---

An MCP server should expose domain capabilities, not mirror every transport detail of the system behind it.

## Wrap an existing REST API at the domain level

Translate a focused MCP tool into one or more API calls. Preserve user identity, validate arguments, map typed errors, and return stable domain results.

Prefer `createIncidentComment` to `postJson`. The first tool communicates intent and supports a narrow permission. The second gives the model a generic network client.

## Keep databases behind query contracts

Expose approved read models or parameterized operations. Arbitrary model-generated SQL creates risks around injection, data discovery, resource use, tenant isolation, and destructive statements.

A reporting server might expose `getMonthlyRevenue(month, region)` and `findInvoice(invoiceId)`. The database account can then receive only the permissions those operations need.

## Use resources for browsable documentation

Resources fit documentation selected by the application or user. Resource templates can address pages or records by URI. A search tool can return resource links for results that the host may read next.

Apply access controls before listing or reading. A hidden URI is not an authorization mechanism.

## Put queues behind business events

Do not give an agent a generic `publishKafka(topic, bytes)` tool. Expose an allowed event or command with a schema, such as `requestOrderReconciliation(orderId, reason)`.

The server applies authorization, chooses the topic, sets required headers, assigns an operation identity, and records the audit event.

## Limit Kubernetes operations

An operations MCP server can expose read-only tools for deployments, pods, events, and logs. Remediation tools should map to approved runbooks and scoped service accounts.

Avoid arbitrary `kubectl` or cluster-admin access. A tool such as `restartDeployment(namespace, name, changeId)` can validate the namespace, deployment allowlist, approval, current rollout state, and change record.

## Split servers by trust and ownership

One large server reduces connection count but combines permissions and release cycles. Domain servers let teams own contracts and credentials. A gateway can give hosts one entry point while routing to those servers.

Use separate servers when capabilities have different owners, data classifications, credentials, scaling needs, or failure domains. Do not create one server per microservice merely to reproduce the existing service map.

## Version behavior deliberately

Add optional fields compatibly. Introduce a new tool name or protocol version for breaking semantics. Keep old contracts during a migration window and measure remaining callers before removal.
