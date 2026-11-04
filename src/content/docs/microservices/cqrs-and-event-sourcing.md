---
title: CQRS and event sourcing
description: Give reads and writes their own models when one model can't serve both, store history as events when the history itself matters, and know when neither is worth it.
---

The customer's order history page joins orders, order items, products, payments, and shipments. It runs against the same tables checkout writes to. During a sale, history queries compete with checkout for the same rows and indexes, and both slow down. Meanwhile, the support team wants to search orders by email, product, and date range, which the write tables were never indexed for.

**CQRS (command query responsibility segregation) splits the model that changes data from the model that answers questions.** Checkout writes to tables shaped for correct updates. The history page reads from a view shaped for that page. **Event sourcing** goes further and stores every change as an event, such as `OrderPlaced` or `OrderCancelled`, and treats that history as the source of truth.

The two are often mentioned together, but neither requires the other. The catch is that both add moving parts: read models that lag behind writes, and with event sourcing, events you must keep readable for years. This article covers CQRS, event sourcing, the projections that connect them, and when each one is worth its cost.

## CQRS

[Figure](#fig-cqrs-flow) shows the flow with a separate read model.

```mermaid #fig-cqrs-flow CQRS with a separate read model. Commands update the write model, and a projector keeps the history view current from events.
flowchart LR
  CMD[Place order] --> W[Write model]
  W --> WDB[(Orders tables)]
  W -->|OrderPlaced| PR[Projector]
  PR --> RDB[(Order history view)]
  Q[Show history] --> RDB
```

1. A **command** such as "place order" goes to the **write model**, which checks the rules (stock, payment) and updates normalized tables.
2. The change produces an event that a **projector** consumes.
3. The projector updates a **read model**: one flat row per order with item names, totals, payment status, and shipping status already joined.
4. The **history query** reads that row directly, with no joins.

There are three levels of separation, and most systems need only the first or second.

### Naive approach: one model for everything

**How it works.** Every screen queries the write tables, joining whatever it needs.

**Where it breaks.** Read-heavy screens compete with writes for locks, I/O, and indexes. Every new screen adds indexes that slow down writes. This is fine until reads and writes need very different shapes.

### Better approach: separate interfaces over one database

**How it works.** Keep one database, but separate the code: command handlers that enforce rules, and query handlers that read through views, materialized views, or read replicas.

**Where it breaks.** The read side is still limited to what the same database can query well. Full-text search across orders, for example, is a poor fit for the write tables.

### Strong approach: a separate read store fed by events

**How it works.** Projectors keep a dedicated store up to date: a denormalized table, an Elasticsearch index for support search, or a Redis structure for a dashboard.

**Where it breaks.** The read model is always a little behind. An order committed at 12:00:00.000 might appear in the history view at 12:00:00.300. You also now operate the projection pipeline, its lag, and its rebuilds.

Choose by asking **do reads need a different shape or a different technology than writes?** A different shape alone is usually solved by a view. A different technology, such as full-text search, needs a separate store.

### Reading your own writes

The customer places an order, the page redirects to "My orders", and the new order isn't there yet. Here's how to handle it:

- **Return the result of the command.** The checkout response includes the created order, so the next page can show it without querying.
- **Wait for a version.** The command returns version 42; the query waits briefly until the read model has reached version 42.
- **Read the user's own recent changes from the write model** and everything else from the read model.

**A successful command doesn't mean every read model is current.** Design the UI for that from the start.

## Event sourcing

Instead of storing the current state and overwriting it, store the sequence of facts that produced it:

```text
order-812  v1  OrderPlaced        items: 2, total: 59.00
order-812  v2  PaymentAuthorized  amount: 59.00
order-812  v3  ItemRemoved        sku: A-17, refund: 19.00
order-812  v4  OrderShipped       carrier: UPS
```

To get the current state of order 812, read its events in order and apply each one. A **snapshot** stores the computed state at, say, version 1,000, so loading a long-lived entity replays only the events after it. [Figure](#fig-event-sourced-write) shows how a command uses the events.

```mermaid #fig-event-sourced-write Handling a command with event sourcing. State is rebuilt from events, and new events are appended only if the version hasn't changed.
flowchart TD
  C[Command] --> L[Load events for order-812]
  L --> D[Decide using current state]
  D --> A[Append new events at expected version]
  A --> P[Projections update]
```

**Writes use the expected version to stop conflicting changes.** A writer that loaded order 812 at version 4 appends version 5 only if version 5 doesn't exist yet. In a relational table, a unique constraint on `(stream_id, version)` enforces this. If two writers both try to append version 5, one succeeds; the other reloads, re-checks its decision, and tries again.

What you gain:

- **A complete history.** You can answer "what did this order look like last Tuesday?" and "why was it refunded?"
- **New read models from old data.** A new dashboard can be built by replaying every event since the beginning.
- **Events as the integration contract.** Other services subscribe to the same facts.

:::caution[Common mistake]
An audit log written next to normal tables is not event sourcing. In event sourcing, the events are the source of truth and the current state is computed from them. If the tables and the log disagree, the log wins.
:::

## Projections

A projection turns events into a read model. Projections run continuously, and sometimes from scratch.

- **Track progress.** Store the position of the last event applied, in the same transaction as the read-model update.
- **Be idempotent.** The same event may arrive twice. Applying it again must not double a total.
- **Rebuild safely.** To fix a bug in a projection, build a new copy from the first event, then switch reads to it.

**Replaying events must never repeat side effects.** Rebuilding the history view is fine. Sending every customer their receipt email again is not. Keep emails, charges, and other external actions in a separate consumer with its own [deduplication](/microservices/outbox-and-delivery/), and leave it out of rebuilds.

## The costs of event sourcing

**Events outlive the code that wrote them.** An `OrderPlaced` from three years ago must still be readable. Plan for versioned events, and for **upcasting**: converting old event versions to the current shape as they're read.

**Deleting data is hard in an append-only log.** If events contain personal data, privacy law may require erasing it. A common technique is to encrypt each person's data with their own key and delete the key on request, which makes the data unreadable without rewriting history.

**The learning curve is real.** Every developer on the team has to think in events, versions, and projections. That's a lasting cost, not a one-time one.

## When to use each

Use CQRS when **reads and writes need very different shapes, scale, or technology**. Start with separate code over one database and add a separate store only when a query needs it.

Use event sourcing when **the history of changes is itself a requirement**: ledgers, audit-heavy domains, workflows where "how did we get here?" matters, or systems that frequently need new read models of old data.

Use neither for ordinary CRUD. A product catalog edited by a few admins doesn't need either.

## In interviews

### When to bring it up

Bring up CQRS when a design has read patterns very different from its writes: a feed, a search page, a dashboard, or reads that outnumber writes by orders of magnitude. Bring up event sourcing only when the problem stresses history, auditability, or rebuilding views, such as a banking ledger.

### How to introduce it

1. **Separate the paths.** "Checkout writes to normalized order tables; the history page reads from a denormalized view."
2. **Connect them.** "An OrderPlaced event from the outbox updates the view, typically within a second."
3. **Handle the lag.** "Checkout returns the created order, so the confirmation page doesn't depend on the view."
4. **Justify event sourcing, or don't use it.** "For the ledger I'd store transactions as events, because the history is the product. For orders, normal tables plus events are enough."

:::tip[In an interview]
Saying you'd use CQRS without naming the lag is a common gap. Have a read-your-writes answer ready.
:::

## Summary

CQRS gives reads and writes separate models, and event sourcing makes a history of events the source of truth.

The trade-off is fit against complexity: each side gets the shape it needs, at the cost of lagging read models and, with event sourcing, events that must stay readable and erasable for years.

In an interview, bring up CQRS when reads and writes have very different shapes or scale, and event sourcing only when history itself is a requirement. Explain how the read side catches up and what users see in between.

Don't adopt event sourcing for ordinary CRUD. It is a lasting commitment, and a table plus an event stream usually gives you most of the benefit.

## Sources

- [Microsoft: CQRS pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/cqrs)
- [Microsoft: Event Sourcing pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/event-sourcing)
