---
title: CQRS and event sourcing
description: Separate read and write models, understand event histories and projections, and distinguish the two patterns.
---

CQRS separates the model that accepts changes from the model that answers queries. Event sourcing stores domain events as the authoritative history of an entity. The patterns can be used together, but neither requires the other.

## CQRS

A checkout command checks inventory and records an order through a write model. A customer order-history query may read a flattened view containing item names, payment status, and shipping summaries.

The simplest CQRS design uses separate application interfaces over one database. Separate databases become useful when read access patterns, scale, or ownership justify them. They introduce projection delivery and consistency work.

If an order is committed before the read projection updates, a query can temporarily omit it. Return the created representation, expose processing state, or let the client wait for a known projection version. A successful command does not establish that every read model is current.

## Event sourcing

Instead of overwriting `order.status`, append facts such as `OrderPlaced`, `PaymentAuthorized`, and `OrderCancelled`. Replaying an entity's events computes its current state. A snapshot can shorten replay by storing state at a known event version.

An append includes the expected stream version. Two writers using version 7 cannot both silently append version 8. One succeeds; the other reloads and reevaluates its decision.

An audit log beside mutable tables is not automatically event sourcing. In event sourcing, the event history is the source used to reconstruct domain state.

## Projections and costs

```text
Command -> validate current state -> append events -> update read projections
                                     |
                              replay or rebuild
```

Projections must tolerate redelivery and track progress. Rebuilding a projection must not resend customer emails or repeat charges. External effects require a separate controlled delivery path.

Event schemas outlive the code that produced them. Versioned readers, upcasting, snapshots, privacy requirements, and retention need deliberate designs. An event stream containing personal data creates deletion obligations that an append-only API does not solve.

Use CQRS when read and write models differ enough to repay the extra structure. Use event sourcing when reconstructing history and expressing domain transitions are central requirements. Basic CRUD rarely needs both.

## Sources

- [Microsoft: CQRS pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs)
- [Microsoft: Event Sourcing pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing)
