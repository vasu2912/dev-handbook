---
title: Distributed locks and fencing
description: Understand leases, ownership tokens, stale workers, fencing, and when database constraints are a better fit.
---

A distributed lock coordinates workers in different processes. It is useful when only one worker should refresh a report or run a scheduled task at a time. Correctness depends on what happens after pauses, expiry, and network failure.

## A lock with an expiry is a lease

A worker acquires a lease for a limited interval. Expiry lets another worker make progress if the first crashes. The first worker can also pause longer than the interval and later resume without realizing ownership changed.

```text
Worker A acquires lease -> A pauses -> lease expires
Worker B acquires lease -> B writes
Worker A resumes       -> A attempts an obsolete write
```

Renewal reduces accidental expiry but does not eliminate that sequence. A network partition can prevent a worker from discovering that renewal failed.

## Ownership tokens and fencing tokens

A unique ownership token prevents A from deleting B's replacement lock during release. In Redis, acquisition commonly uses `SET key token NX PX duration`, followed by an atomic compare-and-delete release. A separate `GET` and `DEL` has a race.

A fencing token solves a different problem. Each acquisition receives a monotonically increasing number. The protected resource rejects writes carrying a number lower than one it has already accepted. After accepting B's token 42, storage rejects A's token 41.

Fencing only works if the resource checks the token atomically with the protected write. A random UUID identifies an owner but does not establish an order. An external API without fencing or idempotency support cannot be made safe merely by placing a lease around its call.

## Simpler correctness boundaries

For unique usernames, use a database unique constraint. For stock reservation, use an atomic conditional update. For concurrent edits, use a version check. These mechanisms enforce the invariant where the data changes.

Use leases for coordination with an explicit failure model. Distinguish duplicate work that wastes CPU from duplicate work that charges a customer. Clock assumptions, failover behavior, and the source of fencing tokens matter more as the consequence grows.

See [database locking](/databases/transactions-and-locking/) and [idempotent delivery](/microservices/outbox-and-delivery/).

## Sources

- [Redis: distributed locks](https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/)
- [Martin Kleppmann: distributed locking and fencing](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)
