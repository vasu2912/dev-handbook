---
title: MCP elicitation and tasks
description: Handle missing user input and long-running work through Multi Round-Trip Requests and the MCP Tasks extension.
---

Some operations need information that is not available at the start. Others outlive one HTTP response. Modern MCP addresses these cases without restoring a hidden protocol session.

![MCP Multi Round-Trip Requests pause a logical request for missing input, while tasks represent independently running work that can be inspected, updated, or cancelled](/images/agentic-ai/vector/mcp-elicitation-tasks.svg)

## Multi Round-Trip Requests carry input in-band

In protocol revision `2026-07-28`, the server cannot start an unrelated request toward the client. While handling a client request, the server can return an `input_required` result. The result contains input requests and an opaque `requestState` value.

The client gathers the requested input and retries the original operation with `inputResponses` and the unchanged `requestState`.

```text
client -> tools/call
server -> input_required + requestState
client -> user supplies approved input
client -> tools/call + inputResponses + requestState
server -> complete result
```

The server must treat returned input and `requestState` as untrusted. Sign or otherwise protect state that carries security-relevant data, apply expiry, and recheck authorization on the retried request.

## Elicitation asks a person for information

Elicitation can request structured form input or a URL-based interaction according to supported capabilities. Use it for missing parameters, consent, or an approval that needs a user-facing explanation.

The host controls how the request appears and whether it is appropriate. A server must not use elicitation to collect secrets that the host should never expose.

## Tasks represent durable asynchronous work

The Tasks extension is `io.modelcontextprotocol/tasks`. A server can return a task handle instead of a final tool result. The client observes progress through `tasks/get`, supplies requested input through `tasks/update`, and requests cancellation through `tasks/cancel`.

Task creation is server-directed after the client advertises support. The server decides that a particular operation should become a task.

## A task handle is not proof of completion

The client must inspect terminal status and final result. Cancellation may race with an external effect. The server needs durable state, idempotency, and reconciliation just like any other background job system.

When a task enters `input_required`, outstanding requests appear in task state. The client responds and keeps observing until the task reaches a terminal state.

## Bound all round trips

Set limits on input rounds, elapsed time, payload size, and retained state. A server that repeatedly asks for slightly different input can otherwise keep the user and client in an endless loop.

## Sources

- [MCP 2026-07-28 release](https://blog.modelcontextprotocol.io/posts/2026-07-28/)
- [MCP Tasks extension](https://tasks.extensions.modelcontextprotocol.io/specification/draft/tasks)
- [MCP TypeScript SDK Multi Round-Trip Requests](https://ts.sdk.modelcontextprotocol.io/v2/migration/support-2026-07-28)

*Last verified: September 23, 2026.*
