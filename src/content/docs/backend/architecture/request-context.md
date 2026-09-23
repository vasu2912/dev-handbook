---
title: Request context
description: Carry per-request identity, tracing metadata, cancellation, and deadlines across middleware and application code.
sidebar:
  order: 7
---

Request context is state scoped to one request. Middleware writes values into it. Later middleware, handlers, and downstream calls read those values without threading the same argument through every function.

Typical values include:

- authenticated `userId`, role, and permissions;
- a `requestId` used in every log line and downstream call;
- a cancellation signal and deadline;
- locale or other request-wide metadata when the application needs it.

## Keep identity server-derived

Authentication middleware verifies credentials and writes the resulting identity into context. A handler can use that identity to set `ownerId` or check permission. It must not use an `ownerId` supplied by the request body when the server already knows the authenticated owner.

```text
auth middleware: verify token -> context.userId = 42
handler: read context.userId -> create record with ownerId = 42
```

This prevents a client from naming another user as the owner. Authorization still belongs at the use-case seam where the application can check the requested action and resource.

## Trace one request

Generate a request ID once near the entry point. Include it in logs, response headers, and calls to other services. A single ID lets an operator follow one request across handlers, databases, and external providers.

```text
request -> context.requestId = req_01J...
        -> handler logs req_01J...
        -> downstream call sends X-Request-Id: req_01J...
        -> error response returns requestId: req_01J...
```

## Stop work when the request ends

Attach a deadline to the context before calling a slow database or external service. If the client disconnects or the deadline expires, propagate cancellation so the downstream operation can stop.

```text
client -> server context (5 second deadline) -> service -> repository -> database
                                             deadline fires -> cancel query
                                             handler returns timeout response
```

Cancellation only works when each adapter observes and passes the signal. A context that stores values should remain small and typed where the language permits it. Do not use it as a general-purpose global store or hide business inputs that make a service interface hard to understand.

For the middleware that creates and consumes context, read [middleware](/backend/architecture/middleware/). For service transaction and adapter seams, read [services](/backend/architecture/services/) and [repositories](/backend/architecture/repositories/).
