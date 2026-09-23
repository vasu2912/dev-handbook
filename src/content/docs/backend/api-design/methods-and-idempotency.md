---
title: Methods and idempotency
description: Match HTTP methods to their intended effects and make retries safe when clients lose a response.
sidebar:
  order: 4
---

An operation is idempotent when repeating it produces the same server state as performing it once. Idempotency describes server-side effects. It does not require the response body or status code to be identical on every call.

| Method | Usual purpose | Idempotent |
| --- | --- | --- |
| `GET` | Read a representation | Yes |
| `PUT` | Replace a resource at a known URL | Yes |
| `PATCH` | Apply a partial update | Yes when the same patch converges to the same state |
| `DELETE` | Remove a resource | Yes |
| `POST` | Create a resource or run a custom action | No by default |

`HEAD` returns headers without a response body. `OPTIONS` describes allowed operations and is used by CORS preflight. Most application endpoints use the five methods in the table.

## Understand retries

`GET` does not change server state, so a client can retry after a timeout. `PUT` and a replacement-style `PATCH` set a known state. A second `DELETE` may return `404`, but the resource remains deleted and no new deletion occurs.

`POST` usually creates a new server-generated identity. Retrying after a lost response can create two resources. For payments, orders, and other operations where a duplicate is costly, accept an `Idempotency-Key` header. Store the key with the first result and replay that result when the same key arrives again. Scope keys to the operation and authenticated caller, and expire them according to the retry window.

## Choose `PATCH` or `PUT`

Use `PUT` when the request replaces the complete representation at a known URL. Use `PATCH` when it changes selected fields. A public API should document whether a missing field means "leave unchanged," "clear," or "invalid." Do not call a partial update `PUT` and then make clients guess the semantics.

## Use `POST` for actions that are not CRUD

Some operations do not fetch, create, replace, or delete a resource. Put the operation under a clear action path, such as:

```text
POST /organizations/42/archive
POST /orders/9001/cancel
```

The method does not decide the status code. An action that creates a resource can return `201 Created`; an action that only changes state can return `200 OK` or `204 No Content`.

See [CRUD endpoints](/backend/api-design/crud-endpoints/) for the complete map and [consistency](/backend/api-design/consistency/) for documenting these choices.
