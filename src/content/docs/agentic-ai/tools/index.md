---
title: Tools and function calls
description: Understand tool contracts, descriptions, selection, arguments, results, and the execution boundary.
---

A tool is a named operation with declared inputs and outputs. It lets an agent observe or change an environment without giving the model direct access to the implementation.

Function calling is the model-side mechanism that produces a structured request. Tool execution is the application-side work that validates and performs the operation.

## The model does not execute the function

Given a tool definition, a model may emit a request such as:

```json
{
  "name": "getOrder",
  "arguments": { "orderId": "ord_42" }
}
```

Application code parses the request, finds the tool, validates arguments, checks authorization, calls the implementation, and returns a result. That gap is where policy lives.

## A good tool has one clear purpose

Names and descriptions affect selection. `manageOrder` hides too much. Separate operations such as `getOrder`, `cancelOrder`, and `requestRefund` expose different inputs and risks.

A description should state:

- What the operation does
- When to use it
- What it does not do
- Required identifiers and their meaning
- Whether it reads or changes state
- Important preconditions

If two tools sound interchangeable, the model has little basis for choosing correctly. Fix the contract before adding prompt rules.

## Schemas constrain syntax

Use a schema to define required fields, types, enumerated values, formats, and whether extra properties are allowed. Keep schemas small enough for a model and a human to understand.

Avoid a generic `options` object that moves the real contract into prose. Avoid optional booleans whose combinations create hidden modes. Prefer separate tools when operations have different permissions or consequences.

## Results are observations

A tool result should give the next decision the information it needs. Return stable identifiers, status, and typed errors. Do not bury success or failure in a paragraph.

```json
{
  "status": "not_found",
  "orderId": "ord_42",
  "retryable": false
}
```

Tool output can contain malicious or misleading text. Treat it as untrusted input when it returns to the model.

## Discovery does not grant permission

A host may tell a model which tools exist. The runtime must still authorize every call. A tool that appears after a server update must not bypass policy because its name was not present in an old prompt.

## Sources

- [JSON Schema 2020-12](https://json-schema.org/draft/2020-12)
- [MCP tools specification](https://modelcontextprotocol.io/specification/2026-07-28/server/tools)
