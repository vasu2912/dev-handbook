---
title: HTTP status codes
description: A compact lookup table for common HTTP response status codes.
tableOfContents: false
---

Use a status code to describe the outcome of the request. Use the response body for details that clients need to act on.

The [CRUD endpoint guide](/backend/api-design/crud-endpoints/) maps these codes to collection, item, and custom-action routes. [Handlers and controllers](/backend/architecture/handlers-and-controllers/) explains how application results become HTTP responses.

| Code | Class | Meaning |
| --- | --- | --- |
| `200` | Success | The request succeeded. |
| `201` | Success | The server created a resource. |
| `202` | Success | The server accepted work for later processing. |
| `204` | Success | The request succeeded without a response body. |
| `400` | Client error | The request is malformed or invalid. |
| `401` | Client error | The caller is not authenticated. |
| `403` | Client error | The caller cannot perform the operation. |
| `404` | Client error | The resource is not available at this location. |
| `409` | Client error | The request conflicts with current state. |
| `422` | Client error | The syntax is valid, but the fields fail validation. |
| `429` | Client error | The client exceeded a rate limit. |
| `500` | Server error | The server failed unexpectedly. |
| `502` | Server error | A gateway received an invalid response upstream. |
| `503` | Server error | The service cannot handle the request now. |
| `504` | Server error | A gateway did not receive an upstream response in time. |

For method semantics and safe retries, read [methods and idempotency](/backend/api-design/methods-and-idempotency/). For one stable error shape, see [middleware](/backend/architecture/middleware/).
