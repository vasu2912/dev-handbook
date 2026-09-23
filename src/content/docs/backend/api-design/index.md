---
title: API design
description: Design stable HTTP interfaces with clear resources, method semantics, response shapes, and failure behavior.
sidebar:
  order: 1
---

An API is an interface between programs. Design it from the client's point of view before implementation details take over. A stable resource model, predictable methods, and consistent responses save every caller from learning one-off rules.

## A practical design sequence

1. Name the resources and their relationships.
2. Choose URLs that identify collections and items.
3. Map reads, creates, updates, deletes, and custom actions to HTTP methods.
4. Define request and response bodies, status codes, errors, and retry behavior.
5. Add pagination, sorting, and filtering to collection endpoints.
6. Write an OpenAPI description and try the interface from a client before coding the service.

The detailed pages follow that sequence. Start with [REST](/backend/api-design/rest/), then read [URL design](/backend/api-design/url-design/) and [methods and idempotency](/backend/api-design/methods-and-idempotency/).

## API design map

| Page | Focus |
| --- | --- |
| [REST](/backend/api-design/rest/) | Constraints, representations, and maturity |
| [URL design](/backend/api-design/url-design/) | Resource paths, hierarchy, versioning, and parameters |
| [Methods and idempotency](/backend/api-design/methods-and-idempotency/) | Method intent, retries, and custom actions |
| [CRUD endpoints](/backend/api-design/crud-endpoints/) | Route map, response bodies, and status codes |
| [List APIs](/backend/api-design/list-apis/) | Pagination, sorting, filtering, and defaults |
| [Consistency](/backend/api-design/consistency/) | Naming, documentation, and interface rules |

Use [communication protocols](/system-design/communication-protocols/) for the network context and [availability and consistency](/system-design/availability-and-consistency/) when an API crosses replicas or regions.
