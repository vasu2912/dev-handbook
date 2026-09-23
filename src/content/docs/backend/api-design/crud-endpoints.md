---
title: CRUD endpoints
description: Map collection and item operations to routes, response bodies, and precise HTTP status codes.
sidebar:
  order: 5
---

For a resource such as `organizations`, the usual CRUD map is:

| Operation | Method and path | Success |
| --- | --- | --- |
| List | `GET /organizations` | `200 OK`, paginated collection |
| Create | `POST /organizations` | `201 Created`, new entity and `Location` |
| Get one | `GET /organizations/{id}` | `200 OK`, entity |
| Replace or update | `PATCH /organizations/{id}` or `PUT /organizations/{id}` | `200 OK`, updated entity, or `204 No Content` |
| Delete | `DELETE /organizations/{id}` | `204 No Content` |
| Custom action | `POST /organizations/{id}/archive` | `200`, `201`, or `204` based on the result |

The collection and item routes repeat because the method carries the operation. Add a path segment for a custom action only when it names a real operation.

## Distinguish one item from a collection

Return `404 Not Found` when a client asks for one resource that does not exist:

```text
GET /organizations/999                 -> 404 Not Found
GET /organizations?status=archived     -> 200 OK, {"data": []}
```

An empty filtered list is a successful query. It is not a missing collection.

## Return the fields each operation needs

| Endpoint | Response body |
| --- | --- |
| Create | New entity, including server-generated `id`, `createdAt`, and `updatedAt` |
| List | Envelope with `data`, `total`, `page`, and `totalPages` |
| Get one or update | The current entity representation |
| Delete | No body with `204 No Content` |

Keep server-generated fields out of create and update input. The client sends fields it owns, such as `name`, `status`, and `description`. The server sets the identity, timestamps, and authenticated owner.

## Choose the narrowest status code

| Code | Meaning | Typical use |
| --- | --- | --- |
| `200 OK` | Operation succeeded with a representation | Fetch, update, custom action |
| `201 Created` | A resource was created | Create |
| `202 Accepted` | Work will finish later | Queue-backed operation |
| `204 No Content` | Operation succeeded without a body | Delete |
| `400 Bad Request` | Request is malformed | Invalid JSON or syntax |
| `401 Unauthorized` | Authentication is missing or invalid | No usable credentials |
| `403 Forbidden` | Authenticated caller lacks permission | Wrong role or policy |
| `404 Not Found` | Specific resource is unavailable | Unknown ID |
| `409 Conflict` | Request conflicts with current state | Duplicate or version conflict |
| `422 Unprocessable Entity` | Syntax is valid but data is semantically invalid | Domain validation failure |
| `429 Too Many Requests` | Rate limit was exceeded | Include retry information when known |
| `500 Internal Server Error` | Unexpected server failure | Log the cause and return a stable error |
| `503 Service Unavailable` | Service cannot accept work now | Maintenance or no capacity |

The four families are success (`2xx`), redirection (`3xx`), client error (`4xx`), and server error (`5xx`). Do not return `200` for an error or `500` for a client mistake.

Next read [list APIs](/backend/api-design/list-apis/) and [consistency](/backend/api-design/consistency/).
