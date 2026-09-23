---
title: Request lifecycle
description: Trace an HTTP request from the listening port through application code and back to the client.
sidebar:
  order: 2
---

The external lifecycle is request in, response out. This page follows the internal lifecycle between those two events.

<svg role="img" aria-labelledby="request-lifecycle-title request-lifecycle-desc" viewBox="0 0 420 540" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:system-ui,sans-serif">
  <title id="request-lifecycle-title">Request lifecycle through a backend</title>
  <desc id="request-lifecycle-desc">A request moves from a client through routing, a handler, a service, a repository, and a database. The response returns up the same path.</desc>
  <defs><marker id="lifecycle-arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3z" fill="var(--diagram-muted)"/></marker></defs>
  <g fill="var(--diagram-bg)" stroke="var(--diagram-muted)" stroke-width="1.5">
    <rect x="30" y="10" width="300" height="48" rx="8" fill="var(--diagram-purple-bg)" stroke="var(--diagram-purple)"/><rect x="30" y="86" width="300" height="48" rx="8"/><rect x="30" y="162" width="300" height="54" rx="8" fill="var(--diagram-green-bg)" stroke="var(--diagram-green)"/><rect x="30" y="244" width="300" height="54" rx="8" fill="var(--diagram-yellow-bg)" stroke="var(--diagram-yellow)"/><rect x="30" y="326" width="300" height="54" rx="8" fill="var(--diagram-accent-bg)" stroke="var(--diagram-accent)"/><rect x="30" y="408" width="300" height="54" rx="8" fill="var(--diagram-accent-light)" stroke="var(--diagram-accent)"/>
  </g>
  <g text-anchor="middle" fill="var(--diagram-ink)"><text x="180" y="40" font-weight="700">Client</text><text x="180" y="116" font-weight="700">Entry point and routing</text><text x="180" y="188" font-weight="700">Handler or controller</text><text x="180" y="270" font-weight="700">Service</text><text x="180" y="352" font-weight="700">Repository</text><text x="180" y="434" font-weight="700">Database</text></g>
  <g stroke="var(--diagram-muted)" stroke-width="1.5" marker-end="url(#lifecycle-arrow)"><path d="M180 58v26"/><path d="M180 134v26"/><path d="M180 216v26"/><path d="M180 298v26"/><path d="M180 380v26"/></g>
  <path d="M350 435h45V34h-45" fill="none" stroke="var(--diagram-muted)" stroke-dasharray="5 4" marker-end="url(#lifecycle-arrow)"/><text x="412" y="260" transform="rotate(-90 412 260)" fill="var(--diagram-muted)" font-size="12">response returns</text>
</svg>

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
