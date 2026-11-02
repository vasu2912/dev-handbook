---
title: Sagas and distributed transactions
description: Compare local transactions, two-phase commit, and saga coordination with explicit compensation and recovery.
---

A local transaction can atomically change orders and inventory when both belong to one transactional database. Separate service databases require another coordination model. Calling three services inside a Spring `@Transactional` method does not include their remote changes in its database transaction.

## Two-phase commit

Two-phase commit coordinates participating transaction managers. During prepare, participants make a durable promise about whether they can commit. The coordinator records a decision and tells them to commit or abort.

This can provide an atomic outcome across supported participants. An unavailable coordinator or an unresolved decision can leave prepared participants holding resources. Ordinary HTTP APIs are not automatically participants. Coordination protocol details determine recovery and availability.

## Saga coordination

A saga records a sequence of local commits and the business actions needed when a later step fails.

```text
Create pending order -> reserve stock -> authorize payment -> confirm order
                           |
                   payment rejected
                           v
                    release stock -> cancel order
```

A compensation is a new operation. Releasing reserved stock changes current state; it does not erase that the reservation happened. Refunding a captured payment may have fees and cannot unsend a receipt.

| Style         | Control flow                                       | Tradeoff                                                           |
| ------------- | -------------------------------------------------- | ------------------------------------------------------------------ |
| Choreography  | Participants react to events                       | Fewer central decisions, but the workflow can become hard to trace |
| Orchestration | A coordinator records progress and issues commands | Explicit recovery state, but another component to operate          |

## The state that makes recovery possible

Persist the saga identifier, current step, participant operation identifiers, outcomes, and pending compensations. After a restart, the coordinator must distinguish an unsent request from a request whose reply was lost.

Participants need idempotent commands. Timeouts create uncertainty, so reconciliation can be necessary before deciding to compensate. Compensation itself can fail and need retry or manual repair.

Sagas do not supply global isolation. Two workflows may observe intermediate states. Reservations, version checks, and explicit business states such as `PAYMENT_PENDING` protect decisions that cannot tolerate those observations.

Use a local transaction when one owner can enforce the invariant. Use a saga when the workflow legitimately spans owners and has defined recovery behavior. Connect publication to commits with the [outbox pattern](/microservices/outbox-and-delivery/).

## Sources

- [Microsoft: Saga pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/saga)
- [PostgreSQL: two-phase transactions](https://www.postgresql.org/docs/current/two-phase.html)
- [Microsoft: Compensating Transaction pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/compensating-transaction)
