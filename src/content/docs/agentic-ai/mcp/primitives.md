---
title: MCP tools, resources, and prompts
description: Choose the MCP primitive that matches model-controlled actions, application-controlled context, or user-selected templates.
---

MCP tools, resources, and prompts have different control relationships. Choosing the right primitive makes user consent and application behavior easier to understand.

<div data-anatomy="agentic-ai--mcp--primitives-1"></div>

## Tools are model-controlled proposals

A server exposes tools with names, descriptions, and input schemas. The host can place selected definitions in model context. The model may propose `tools/call`, and the client sends the call only after host policy permits it.

Tool results can contain text, structured content, resource links, images, audio, or errors according to the protocol types supported by the implementation. Treat returned content as untrusted external input.

## Resources are application-controlled context

Resources are identified by URIs. A client lists or reads them through resource methods. Resource templates describe parameterized URI patterns.

Use a resource when the host or user chooses what context to read. Use a tool when the model needs to propose an operation. A customer record could be a resource when selected directly by the application, or a `getCustomer` tool when the model searches by approved identifier.

## Prompts are user-controlled templates

MCP prompts are reusable templates exposed by a server. A user can select a prompt and supply its arguments. The client retrieves the resulting messages and decides how to use them.

An MCP prompt is not the same as an invisible system policy. A server-provided prompt must not gain authority to override host rules.

## List methods support discovery

Clients can list available tools, resources, and prompts. The modern specification lets list and resource-read results include cache lifetime and scope information. Hosts should obey that metadata and avoid sharing user-scoped results across authorization contexts.

Capability discovery is not authorization. A gateway can filter what a caller may discover, and the server must authorize each invocation or read.

## Schemas are contracts, not policy

Tool input and output schemas use JSON Schema. Protocol revision `2026-07-28` supports full JSON Schema 2020-12 for tool schemas while keeping an object root for tool inputs.

Schema validation proves structure. Domain services still check resource existence, relationships, tenant ownership, and action permission.

## Name primitives for stable meaning

Names become part of model selection and operational telemetry. Prefer domain actions such as `searchIncidents` and `createChangeRequest` over transport names such as `postApiV2`.

Version a breaking contract deliberately. Do not change a familiar tool name from read-only to destructive behavior.

## Sources

- [MCP server primitives](https://modelcontextprotocol.io/specification/2026-07-28/server)
- [JSON Schema 2020-12](https://json-schema.org/draft/2020-12)
