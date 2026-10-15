---
title: Request lifecycle
description: Trace an HTTP request from the listening port through application code and back to the client.
sidebar:
  order: 2
---

The external lifecycle is request in, response out. This page follows the internal lifecycle between those two events.

<div data-anatomy="backend--architecture--request-lifecycle-1"></div>

1. The operating system sends the request to the port where the server listens.
2. The router matches the method and path, including dynamic segments such as `/users/123`.
3. Middleware can reject the request, add context, or prepare shared state.
4. The handler extracts and validates input, calls the service, and chooses the response format and status code.
5. The service applies business rules and coordinates repository or external calls.
6. The repository runs a database operation. The result then travels back up the path.

| Layer | Owns | Does not own |
| --- | --- | --- |
| Handler or controller | Input and output formats, validation, status codes | Business rules and SQL |
| Service | Business processing and orchestration | HTTP objects and response codes |
| Repository | Database queries and persistence mapping | Business orchestration |

## Why split the layers

The split gives each change a likely home. A response format can change in the handler. A rule can change in the service. A query can change in the repository. Tests can cross a small interface at each seam.

The split also has a cost. Three thin wrappers add indirection without hiding complexity. Keep a smaller application together until a separate interface buys locality or reuse. [How to use this handbook](/guides/how-to-use-this-handbook/) uses the same depth test throughout this handbook.

Continue with [handlers and controllers](/backend/architecture/handlers-and-controllers/), [services](/backend/architecture/services/), and [repositories](/backend/architecture/repositories/). For the network side of the contract, read [HTTP and APIs](/backend/http-and-apis/).
