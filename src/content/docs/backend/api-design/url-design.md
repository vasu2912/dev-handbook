---
title: URL design
description: Choose resource paths, hierarchy, versioning, and parameter locations that clients can predict.
sidebar:
  order: 3
---

A URL identifies a resource or collection. Keep paths readable, stable, and consistent across the API.

```text
https://api.example.com/v1/organizations/42/projects?status=active
\____________________/  \__/ \______________/ \__________/
       host             version    resource path      query
```


<div data-anatomy="backend--api-design--url-design-1"></div>


## Use plural resource names

Use `/books` for the collection and `/books/123` for one book. The identifier selects one member of the collection. A singular `/book/123` path introduces a rule clients have to remember and makes nested paths inconsistent.

## Use lowercase hyphenated paths

Avoid spaces, underscores, and mixed case. Use `/shipping-addresses`, not `/shipping_addresses` or `/ShippingAddresses`. Keep field naming in JSON consistent with the rest of the API, usually `camelCase`.

## Let slashes show hierarchy

```text
/organizations/{organizationId}/projects/{projectId}/tasks
```

Read the path from left to right. It names a collection, one item, a child collection, and possibly one child item. Nest a child only when its meaning depends on its parent.

Keep nesting shallow. One level of context is usually enough, such as `/projects/{projectId}/tasks`. For deeper relationships, use a flat `/tasks/{taskId}` route when the task has its own identity.

## Put each parameter in the right place

| Location | Answers | Example |
| --- | --- | --- |
| Path parameter | Which required resource? | `/books/{bookId}` |
| Query parameter | How should the request be filtered or shaped? | `/books?page=2&sortBy=name` |
| Header | Which representation or request-wide metadata? | `Accept`, `Idempotency-Key` |
| Body | What data should the server create or change? | `{"title":"Dune"}` |

## Version deliberately

| Strategy | Example | Trade-off |
| --- | --- | --- |
| URI path | `/v1/books` | Visible and easy to explore, but duplicates paths |
| Media-type header | `Accept: application/vnd.api+json;version=2` | Keeps URIs clean, but is harder to explore manually |
| Query parameter | `/books?version=2` | Simple to add, but often becomes inconsistent |

URI-path versioning is common because it makes the selected contract visible in logs and links. Whichever strategy you choose, document how long old versions remain available and which changes require a new version.

Next read [methods and idempotency](/backend/api-design/methods-and-idempotency/).
