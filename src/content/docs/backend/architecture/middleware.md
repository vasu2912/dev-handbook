---
title: Middleware
description: Apply cross-cutting request and response behavior in a deliberate order around handlers.
sidebar:
  order: 6
---

Middleware runs between routing and the handler, or around the whole request pipeline. It receives the request, the response, and a `next` function. Calling `next()` transfers control to the next processing context. A middleware can stop the chain by returning a response without calling `next()`.

<div data-anatomy="backend--architecture--middleware-1"></div>

Middleware can run code before `next()` and after it returns. That creates an onion-shaped flow. Logging starts a timer before `next()` and records duration after it. CORS can check the origin on entry and set response headers on exit.

## Good middleware candidates

- CORS checks and response headers.
- Authentication that verifies a token and adds identity to context.
- Rate limiting that can reject a request with `429 Too Many Requests`.
- Request logging, metrics, tracing, and compression.
- Body parsing and shared validation.
- Global error handling that maps thrown errors to one response shape.

The test is practical. Use middleware when behavior applies to every request or a route group and needs request or response access. A handler's unique business rule belongs in the handler or service.

## Order changes behavior

```text
CORS -> request logging -> authentication -> route handler -> error handling
```

Reject disallowed origins and rate-limit requests early. Authenticate before sensitive work. Put error handling where the framework can observe errors from downstream handlers. In frameworks where errors travel forward through the chain, register the global error handler last. Confirm the framework's error model before choosing an order.

Return one structured error shape from the global handler:

```json
{
	"error": {
		"code": "INSUFFICIENT_FUNDS",
		"message": "You do not have enough balance.",
		"status": 400
	}
}
```

The code is stable for programs, the message is readable for people, and the status matches the HTTP result. Log the original exception with the request ID from [request context](/backend/architecture/request-context/).
