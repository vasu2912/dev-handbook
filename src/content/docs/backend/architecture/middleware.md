---
title: Middleware
description: Apply cross-cutting request and response behavior in a deliberate order around handlers.
sidebar:
  order: 6
---

Middleware runs between routing and the handler, or around the whole request pipeline. It receives the request, the response, and a `next` function. Calling `next()` transfers control to the next processing context. A middleware can stop the chain by returning a response without calling `next()`.

<svg role="img" aria-labelledby="middleware-title middleware-desc" viewBox="0 0 680 220" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:system-ui,sans-serif">
  <title id="middleware-title">Middleware onion flow</title>
  <desc id="middleware-desc">A request enters CORS, logging, and authentication middleware, reaches the handler, then returns through the same middleware in reverse order. Authentication can reject the request before the handler.</desc>
  <defs><marker id="middleware-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3z" fill="var(--diagram-muted)"/></marker></defs>
  <g fill="var(--diagram-bg)" stroke="var(--diagram-muted)" stroke-width="1.5"><rect x="10" y="82" width="110" height="48" rx="8" fill="var(--diagram-purple-bg)" stroke="var(--diagram-purple)"/><rect x="150" y="82" width="110" height="48" rx="8" fill="var(--diagram-purple-bg)" stroke="var(--diagram-purple)"/><rect x="290" y="82" width="110" height="48" rx="8" fill="var(--diagram-purple-bg)" stroke="var(--diagram-purple)"/><rect x="430" y="82" width="110" height="48" rx="8" fill="var(--diagram-green-bg)" stroke="var(--diagram-green)"/><rect x="570" y="82" width="100" height="48" rx="8" fill="var(--diagram-yellow-bg)" stroke="var(--diagram-yellow)"/></g>
  <g text-anchor="middle" fill="var(--diagram-ink)" font-size="12"><text x="65" y="111">CORS</text><text x="205" y="111">logging</text><text x="345" y="111">auth</text><text x="485" y="111">handler</text><text x="620" y="111">response</text></g>
  <g stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#middleware-arrow)"><path d="M120 106h28"/><path d="M260 106h28"/><path d="M400 106h28"/><path d="M540 106h28"/></g>
  <path d="M620 136v48H65v-48" fill="none" stroke="var(--diagram-muted)" stroke-dasharray="5 4" marker-end="url(#middleware-arrow)"/><text x="340" y="207" text-anchor="middle" fill="var(--diagram-muted)" font-size="12">response path runs outward through middleware</text>
</svg>

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
