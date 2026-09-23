---
title: API consistency
description: Keep resource names, payload shapes, status codes, and documentation predictable across an HTTP API.
sidebar:
  order: 7
---

Consistency is the feature clients feel on every endpoint. Use the same route patterns, field names, envelopes, error shape, and method semantics across resources.

## Use names clients can read

Use `camelCase` in JSON when that matches the client ecosystem:

```json
{
	"createdAt": "2026-08-30T10:15:00Z",
	"shippingAddress": {
		"postalCode": "560001"
	}
}
```

Do not call the same idea `description` on one resource and `desc` on another. Avoid abbreviations that only make sense to the team that designed the endpoint. Keep database naming conversion inside the repository or serializer.

## Standardize the contract

Use one error envelope with a stable machine-readable code, a human-readable message, and a request ID. Use one pagination shape for collection endpoints. Make server-owned fields read-only in the public request schema.

Status codes should carry the same meaning everywhere. A missing item returns `404`; an empty filtered list returns `200` with an empty array. A duplicate or version conflict returns `409` rather than a generic `400`.

## Design and test before implementation

Write the interface in an OpenAPI document or exercise it with Swagger, Insomnia, or Postman before writing business logic. A client view exposes ambiguous names, missing error cases, and awkward pagination early. Keep the interactive documentation with the implementation and test examples in CI when possible.

## Checklist

- Resources use lowercase plural nouns and stable hyphenated paths.
- A slash shows a meaningful parent-child relationship, with shallow nesting.
- `GET`, `POST`, `PATCH` or `PUT`, and `DELETE` carry consistent CRUD meaning.
- Custom actions use a clear `POST` path and document their result.
- Lists paginate, sort deterministically, and filter with validated query parameters.
- JSON uses one naming convention and avoids unexplained abbreviations.
- Errors use one shape with stable codes and request IDs.
- The OpenAPI contract and client examples describe the actual behavior.

Read [REST](/backend/api-design/rest/) for the constraints behind these conventions and [HTTP and APIs](/backend/http-and-apis/) for the core request and response concepts.
