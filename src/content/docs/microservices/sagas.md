---
title: Sagas and distributed transactions
description: Keep a multi-service workflow like checkout correct without one shared transaction, using steps that can be compensated and state that survives crashes.
---

Checkout creates an order, reserves stock, and charges the card. In the monolith, one database transaction did all three: if the charge failed, the order and the reservation rolled back together. Now Orders, Inventory, and Payments each have their own database. When the card is declined, the stock stays reserved and the last unit of a popular item can't be sold to anyone.

Wrapping the calls in Spring's `@Transactional` doesn't help. It covers only the local database connection. Remote calls to other services are outside it.

**A saga is a sequence of local transactions, one per service, where each step has a compensating action that undoes its business effect if a later step fails.** The catch is that a saga gives up isolation: other requests can see the in-between states, and an "undo" is really a new action. This article covers why a single transaction stops working, the options for replacing it, how to build a saga that survives crashes, and how to protect against the in-between states.

## Why one transaction stops working

[Figure](#fig-saga-failure) shows checkout across three services when the card is declined.

```mermaid #fig-saga-failure Checkout without a shared transaction. By the time Payments declines the card, the order and the stock reservation are already committed.
sequenceDiagram
  participant O as Orders
  participant I as Inventory
  participant P as Payments
  O->>O: insert order (committed)
  O->>I: reserve 1 unit
  I-->>O: reserved (committed)
  O->>P: charge card
  P-->>O: declined
  Note over O,I: order and reservation are already committed
```

Each service committed its own transaction. There is no shared transaction to roll back. Something has to release the reservation and cancel the order, and something has to remember that this is necessary if Orders crashes right after the decline.

## Options for keeping it consistent

There are three ways teams try to solve this, in order of how often they hold up in production.

### Naive approach: call in sequence and hope

**How it works.** Orders calls each service in turn and returns an error if one fails.

**Where it breaks.** Everything that committed before the failure stays committed. Stock leaks, orders sit half-created, and nobody finds out until a customer complains or a report doesn't add up.

### Better approach: two-phase commit

**How it works.** A coordinator asks every participant to **prepare**: each one writes everything it needs to disk and promises it can commit. If all say yes, the coordinator records the decision and tells everyone to **commit**. If any says no, everyone aborts. PostgreSQL supports this with `PREPARE TRANSACTION`, and Java has the XA standard. [Figure](#fig-two-phase-commit) shows a round in which both participants vote yes.

```mermaid #fig-two-phase-commit Two-phase commit. The coordinator asks every participant to prepare, and commits only after all of them vote yes.
sequenceDiagram
  participant C as Coordinator
  participant O as Orders DB
  participant I as Inventory DB
  C->>O: prepare
  C->>I: prepare
  O-->>C: yes
  I-->>C: yes
  C->>O: commit
  C->>I: commit
```

**Where it breaks.** Prepared participants hold their locks until they hear the decision. If the coordinator crashes between the phases, they wait, and rows that checkout needs stay locked. Ordinary HTTP APIs, most message brokers, and third parties such as payment providers can't take part at all. PostgreSQL even ships with prepared transactions disabled: `max_prepared_transactions` defaults to 0.

### Strong approach: a saga with compensation

**How it works.** Each step is a normal local transaction that commits immediately. For each step, you also define a compensating action. If a later step fails, the saga runs the compensations for the completed steps in reverse order.

**Where it breaks.** Other requests can see intermediate states, such as stock that is reserved for an order that will be cancelled. Compensations can fail too, and some actions can't truly be undone. The rest of this article is about handling exactly these problems.

Two-phase commit is the right tool when **every participant is a database you control that speaks the same commit protocol**, which is rare between services. Across service boundaries, use a saga.

## How a saga works

[Figure](#fig-saga-flow) shows checkout as a saga, including the path when payment is declined.

```mermaid #fig-saga-flow Checkout as a saga. The normal path runs left to right; a declined payment triggers the compensations, which run in reverse order.
flowchart LR
  A[Create pending order] --> B[Reserve stock]
  B --> C[Authorize payment]
  C --> D[Confirm order]
  C -->|declined| E[Release stock]
  E --> F[Cancel order]
```

1. **Orders** creates the order in state `PENDING` and commits.
2. **Inventory** reserves one unit and commits.
3. **Payments** tries to authorize the card. On success, Orders marks the order `CONFIRMED`.
4. On decline, the saga runs compensations in reverse: Inventory **releases the stock**, then Orders **cancels the order**.

**A compensation is a new business action, not an undo.** Releasing stock changes today's count; it doesn't erase that the reservation happened. A refund is a new money movement, can cost fees, and can't unsend the receipt email. Design each compensation with the business, not just the database, in mind.

### Order the steps by how reversible they are

Put the steps that are easy to compensate first, and the step that can't be undone last. That last irreversible step is the **pivot**. Once it succeeds, the saga only moves forward.

For checkout, reserving stock is easy to release, so it goes early. Capturing money is hard to reverse, so authorize the card early (an authorization can be voided) and capture it only after everything else succeeds. Steps after the pivot, such as sending the confirmation email, must be retried until they succeed rather than compensated.

## Choreography or orchestration

Someone has to decide what runs next. There are two styles.

### Choreography

Each service listens for events and reacts. Orders publishes `OrderCreated`; Inventory reserves stock and publishes `StockReserved`; Payments reacts to that, and so on, as [Figure](#fig-choreography) shows.

```mermaid #fig-choreography Choreography. Each service reacts to the previous service's event, and no single component sees the whole workflow.
flowchart LR
  O[Orders] -->|OrderCreated| I[Inventory]
  I -->|StockReserved| P[Payments]
  P -->|PaymentAuthorized| O
```

There's no central component, and each service stays simple. The downside is that the workflow exists only as the sum of everyone's event handlers. With more than three or four steps, nobody can answer "where is order 812 stuck?" without reading several codebases and logs.

Use this when **the flow is short and unlikely to change**.

### Orchestration

A coordinator owns the workflow. It sends commands ("reserve stock"), waits for replies, records progress, and decides what runs next, including compensations. [Figure](#fig-orchestration) shows the same checkout with a coordinator.

```mermaid #fig-orchestration Orchestration. One coordinator sends every command and records the saga's progress.
flowchart LR
  OR[Checkout orchestrator] -->|reserve| I[Inventory]
  OR -->|authorize| P[Payments]
  OR -->|confirm or cancel| O[Orders]
```

The workflow is in one place, so its state is easy to inspect, test, and change. The downside is one more component to run, and the risk of business logic drifting into the orchestrator. Workflow engines such as Temporal, AWS Step Functions, and Camunda provide durable orchestration so you don't build the state-keeping yourself.

Orchestration is the better default once a workflow has **more than three steps or any compensation logic**.

## Surviving crashes

A saga is only correct if it can resume after any process dies at any moment. That means its progress lives in a database, not in memory.

Persist, for each saga:

- the saga ID and the current step
- an operation ID for each command sent, reused on every retry
- each step's outcome
- which compensations are still pending

```text
saga_id  step              status     operation_id
s-812    reserve_stock     done       op-812-1
s-812    authorize_payment unknown    op-812-2
```

The hardest case is the `unknown` row. Orders sent "authorize" and timed out. **A timeout doesn't tell you whether the step happened.** Before compensating, ask Payments for the status of `op-812-2`, or retry with the same operation ID so Payments returns the original result instead of charging again. Every saga command must be idempotent for this to work.

Compensations can fail too. Retry them with backoff, and when they keep failing, put the saga in a state a person can see and repair. Some failures always need a human, and the system should make them easy to find.

:::caution[Common mistake]
Updating the saga's database and sending the next command are two separate writes. If the process crashes between them, the saga stalls or sends a command twice. Use the [transactional outbox](/microservices/outbox-and-delivery/) to make them one.
:::

## The in-between states

**Sagas don't give you isolation.** While a saga runs, other requests can see its partial results. Two customers might both see "1 in stock" while the first one's payment is still being authorized.

Here's how to protect decisions that can't tolerate that:

- **Reservations.** Inventory moves the unit from "available" to "reserved", so nobody else can take it while the saga runs.
- **Explicit pending states.** The order is `PAYMENT_PENDING`, not `CONFIRMED`. Shipping ignores pending orders, and the UI says "processing".
- **Version checks.** A step updates a row only if its version hasn't changed since the saga read it.
- **Commutative updates.** Adjusting a balance with "+5" and "-3" gives the same result in any order, so interleaving sagas can't corrupt it.

## In interviews

### When to bring it up

Bring up sagas whenever one user action must change data owned by more than one service: checkout, booking, money transfers, signup flows that provision several resources.

### How to introduce it

1. **Say why there's no shared transaction.** "Orders, Inventory, and Payments each own their data, so I can't use one transaction."
2. **List steps and compensations.** "Create a pending order, reserve stock, authorize payment, confirm. On decline: release stock, cancel the order."
3. **Pick the style.** "I'd use an orchestrator, such as a Temporal workflow, so the state of each checkout is visible and recoverable."
4. **Cover the hard cases.** "Every command carries an operation ID, so a retry after a timeout is safe, and a reservation stops other buyers from taking the unit mid-saga."

:::tip[In an interview]
Expect "why not two-phase commit?" Answer with the blocking problem and the fact that payment providers and HTTP services can't take part, not just "it doesn't scale".
:::

## Summary

A saga replaces one distributed transaction with a chain of local transactions, each paired with a compensating action.

The trade-off is availability against isolation: no service waits on another's locks, but other requests can see in-between states, and every step needs a designed recovery path.

In an interview, bring up a saga when one action spans several services' data, and name the steps, the compensations, the coordination style, and how a timeout is resolved.

Don't use a saga when one service could own the whole rule. If one database can enforce the invariant, a local transaction is simpler and stronger.

## Sources

- [Microsoft: Saga pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/saga)
- [PostgreSQL: two-phase transactions](https://www.postgresql.org/docs/current/two-phase.html)
- [Microsoft: Compensating Transaction pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/compensating-transaction)
