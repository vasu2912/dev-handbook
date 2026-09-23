---
title: List APIs
description: Shape collection endpoints with predictable pagination, sorting, filtering, and defaults.
sidebar:
  order: 6
---

Collection endpoints need a limit. Returning every row makes response size, database work, and client rendering grow without a bound. Pagination also gives a client a stable way to request the next slice.

## Return a pagination envelope

```json
{
	"data": [{"id": "book_123", "title": "Dune"}],
	"total": 47,
	"page": 2,
	"limit": 10,
	"totalPages": 5
}
```

`total` is the full matching count, not the number of items in the current page. `page` and `totalPages` let a client decide whether another page exists. Return an object rather than a bare array so metadata can grow without changing the top-level type.

With offset pagination, `page=2&limit=10` selects the second group of ten items. Validate a positive limit, cap it on the server, and choose a default such as `page=1` and `limit=20`.

## Sort every list

Database row order is not a contract. Give every list a deterministic default, then let clients choose from an allowlist of fields.

| Parameter | Example | Default |
| --- | --- | --- |
| `sortBy` | `?sortBy=name` | `createdAt` |
| `sortOrder` | `?sortOrder=asc` | `desc` |

Add a tie-breaker such as `id` when the primary sort field is not unique. Otherwise rows with the same timestamp can move between pages.

## Filter with query parameters

Use query parameters for optional filters:

```text
GET /books?status=available&authorId=42&page=1&limit=20
```

Validate each filter and keep the names consistent with resource fields. A filter that matches no rows returns `200 OK` with an empty `data` array.

## Choose offset or cursor pagination

| | Offset | Cursor, or keyset |
| --- | --- | --- |
| Request | `?page=2&limit=10` | `?cursor=eyJpZCI6MTIz&limit=10` |
| Mechanism | Skip a number of rows | Continue after an encoded position |
| Changes during paging | Inserts or deletes can cause drift | Stable when the cursor sort is stable |
| Good fit | Small lists and fixed-page UIs | Feeds, infinite scroll, and large tables |

Offset is easy to inspect and works for many administrative lists. Cursor pagination avoids repeated skips and page drift at scale, but the server must define cursor expiry and the sort key. Choose based on the data and client interaction.

## Set useful defaults

A request with no query parameters should produce a useful result. Common defaults are `page=1`, a bounded `limit`, `sortBy=createdAt`, and `sortOrder=desc`. Defaults belong in the handler or query adapter so the service receives a complete input.

See [CRUD endpoints](/backend/api-design/crud-endpoints/) for the list response status and [databases](/system-design/databases/) for query and index choices.
