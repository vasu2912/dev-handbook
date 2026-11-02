---
title: API integration contracts
description: Explain idempotency keys, webhook verification, schema evolution, asynchronous responses, and safe file uploads.
---

An integration contract defines repeated requests, delayed completion, errors, and changes over time. A valid JSON schema is only part of that agreement.

## Idempotency keys

Idempotency means repeating an operation has the same intended effect as performing it once. Repeated responses can differ without violating that property. HTTP method semantics alone do not deduplicate arbitrary application code.

For payment creation, a caller supplies a stable key for one intended operation. The server scopes it to the caller and operation, stores a request fingerprint, and atomically claims execution. Reusing a key with different parameters must fail rather than silently returning an unrelated result.

```text
New key + new request       -> claim and execute
Same key + same request     -> return stored outcome or pending state
Same key + different input  -> reject conflicting reuse
```

An unfinished claim needs recovery. If the payment provider committed but the local response record did not, reconciliation or the provider's own idempotency mechanism is required. Expiration defines how long deduplication is guaranteed. Concurrent requests must not both win the claim.

## Webhooks

A webhook delivers an event through an HTTP callback. Verify authenticity using the provider's specified signature algorithm and the exact request bytes. Timestamp validation can restrict replay but does not replace event deduplication. A provider retry can carry a valid signature.

After verification, durably record accepted work before acknowledging it. Process slower business work separately. Delivery can be duplicated or reordered, so use event identity and resource version or reconciliation as appropriate. Acknowledging before durable acceptance risks losing the event.

## Contract evolution

Adding an optional field is often compatible, but strict parsers can reject unknown fields. Adding an enum value can break exhaustive clients. Changing units or meaning can break a client even when the JSON types remain unchanged.

Document pagination order, error structure, time formats, and retry rules. A `202 Accepted` response means work was accepted for processing; expose an operation identifier and status lookup when the client needs completion evidence.

## File uploads

Direct uploads through signed storage URLs reduce application bandwidth but still need authorization, size limits, short validity, and controlled object identity. Treat filenames, content type, and uploaded bytes as untrusted. Prevent path traversal, isolate storage, and scan content where the use case requires it.

See [API design](/backend/api-design/), [outbox delivery](/microservices/outbox-and-delivery/), and [OAuth](/backend/security/oauth-and-oidc/) for related contracts.

## Sources

- [Stripe: idempotent requests](https://docs.stripe.com/api/idempotent_requests)
- [Stripe: webhooks](https://docs.stripe.com/webhooks)
- [RFC 9110: HTTP semantics](https://www.rfc-editor.org/rfc/rfc9110.html)
- [OWASP: file upload guidance](https://cheatsheetseries.owasp.org/cheatsheets/File_Upload_Cheat_Sheet.html)
