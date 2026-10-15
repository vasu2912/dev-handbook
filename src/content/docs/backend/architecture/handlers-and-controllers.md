---
title: Handlers and controllers
description: Translate HTTP requests into validated service inputs and service results into stable responses.
sidebar:
  order: 3
---

A handler is the function mapped to a route. A controller is the same role in a class-based framework. The name changes with the framework. The responsibility does not.

The runtime gives the handler a request object and a response object. The handler reads path parameters, query parameters, headers, and the body from the request. It sets status, headers, and the response body on the response.


<div data-anatomy="backend--architecture--handlers-and-controllers-1"></div>
## Keep the handler flow explicit

```text
request
  -> extract path, query, headers, and body
  -> deserialize JSON into a native value
  -> validate and apply defaults
  -> call the service with trusted input and request context
  -> map the result or error to a status and response body
```

Deserialization errors are client errors. Return `400 Bad Request` and stop before the service runs. Validate path parameters, body fields, and query parameters as separate inputs so each error names the field that failed.

Apply defaults at this seam when they are part of the HTTP contract. For example, turn a missing `sort` query parameter into `sort = createdAt` before the service runs. The service then receives one ready-to-process shape instead of branching on whether the client supplied a field.

Pass authenticated identity and permissions from the trusted [request context](/backend/architecture/request-context/). Do not accept an `ownerId` from a request body when the server can derive the owner from the authenticated user.

## Map outcomes, not implementation details

| Result | Typical response |
| --- | --- |
| A resource was returned | `200 OK` with the representation |
| A resource was created | `201 Created` with the resource and its location |
| The operation succeeded without a body | `204 No Content` |
| Input cannot be parsed or validated | `400 Bad Request` or `422 Unprocessable Entity` |
| The caller is missing valid credentials | `401 Unauthorized` |
| The caller lacks permission | `403 Forbidden` |
| A requested resource is missing | `404 Not Found` |
| State conflicts with the request | `409 Conflict` |
| An unexpected failure occurred | `500 Internal Server Error` |

The handler should expose a stable error shape. Keep stack traces, SQL, and provider messages in logs, not in the response.

```json
{
	"code": "account_not_found",
	"message": "The account does not exist.",
	"requestId": "req_01J..."
}
```

## What does not belong here

Do not put business rules, multi-step transactions, or database queries in a handler. Those details make route code hard to test and force every transport to repeat the same decisions. Put them in a [service](/backend/architecture/services/), then keep the handler focused on formats and status codes.

See [CRUD endpoints](/backend/api-design/crud-endpoints/) for a complete route map and [middleware](/backend/architecture/middleware/) for work that applies to many handlers.
