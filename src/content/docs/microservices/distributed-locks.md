---
title: Distributed locks and fencing
description: Make sure only one worker does a job at a time, understand why a lock with an expiry can still let two workers in, and fence writes so a stale worker can't do damage.
---

Billing runs on three instances, and each one has a scheduler that starts the nightly invoice job at 02:00. Without coordination, all three start it, and every customer gets three invoices. You need exactly one of them to run the job.

**A distributed lock lets workers in different processes agree that only one of them holds a resource at a time.** The worker that acquires the lock runs the job; the others skip it.

The catch is that a lock needs an expiry, or a crashed holder would block everyone forever. And once a lock can expire, a worker that pauses for a few seconds can wake up still believing it holds a lock that someone else now owns. This article covers when you don't need a lock at all, how leases work and fail, how fencing tokens make them safe, and how to choose a lock service.

## First, check whether you need a lock

Many problems that look like they need a lock are better solved where the data lives. **Enforce the rule at the point where the data changes.**

- **Unique usernames:** a unique constraint. Two concurrent signups for `ada` can't both commit.
- **Reserving the last item:** a conditional update that only succeeds if stock remains:

  ```sql
  UPDATE inventory SET available = available - 1
  WHERE sku = 'A-17' AND available > 0;   -- 0 rows updated means sold out
  ```

- **Concurrent edits to a document:** a version check, so the second save fails with a conflict instead of overwriting.

These are enforced by the database in the same transaction as the change, so there's no window where two workers both think they're allowed. Reach for a distributed lock when the protected work isn't a single database write, such as running a job, calling an API, or writing a file. See [database locking](/databases/transactions-and-locking/) for the row-level options.

## A lock with an expiry is a lease

A worker acquires the lock for a limited time, say 30 seconds. If it crashes, the lock expires and another worker can proceed. That's the point. [Figure](#fig-lease-pause) shows the problem it creates.

```mermaid #fig-lease-pause The lease pause problem. Worker A's lease expires while it is paused, worker B takes over, and A writes anyway when it wakes.
sequenceDiagram
  participant A as Worker A
  participant L as Lock service
  participant B as Worker B
  participant S as Storage
  A->>L: acquire (30 s)
  Note over A: long pause
  Note over L: lease expires
  B->>L: acquire (30 s)
  B->>S: write
  Note over A: wakes up, still thinks it holds the lock
  A->>S: write (stale)
```

1. **Worker A** acquires the lease and starts working.
2. A pauses for longer than 30 seconds: a long garbage-collection pause, a VM migration, or a network partition.
3. The lease expires. **Worker B** acquires it and writes.
4. A resumes, has no idea time passed, and writes too. Two workers have now done the job, and A's write may overwrite B's newer one.

Renewing the lease while working ("heartbeating") makes this rarer, but it can't prevent it. A worker that is paused can't renew, and it can't notice that it failed to.

**A lease limits how long a lock is held; it doesn't guarantee only one holder.** Whether that matters depends on what the lock protects.

## Making a lock safe

There are three levels of lock, and each fixes a failure of the one before it.

### Naive approach: set a key, delete it when done

**How it works.** `SET lock:invoices 1` to acquire, `DEL lock:invoices` to release.

**Where it breaks.** With no expiry, a crashed worker holds the lock forever. Add an expiry, and a slow worker A can delete the lock that now belongs to worker B, letting a third worker in.

### Better approach: a lease with an owner token

**How it works.** Acquire with a random token and an expiry in one atomic command:

```text
SET lock:invoices token-7f3a NX PX 30000   # only if absent, expires in 30 s
```

Release only if the token still matches, in one atomic step, using a Lua script:

```lua
if redis.call("GET", KEYS[1]) == ARGV[1] then
  return redis.call("DEL", KEYS[1])
else
  return 0
end
```

A separate `GET` followed by `DEL` has a race: the lock can expire and be taken by B between the two commands.

**Where it breaks.** The token stops A from deleting B's lock. It does nothing to stop A from writing after its lease expired. The pause problem above is still there.

### Strong approach: fencing tokens checked by the resource

**How it works.** Every time the lock is granted, the lock service hands out a number that only ever increases: 41, then 42, then 43. The worker sends its number with every write, and the storage rejects any write with a number lower than the highest it has accepted. The current holder can write as often as it needs to with its own number.

```sql
UPDATE reports SET body = '...', fence = 42
WHERE id = 7 AND fence <= 42;   -- 0 rows updated means a newer holder already wrote
```

In the pause scenario, B holds token 42 and writes first. When A wakes up and writes with token 41, storage rejects it. ZooKeeper's transaction IDs and etcd's revision numbers are natural sources of fencing tokens, and so is a database sequence.

**Where it breaks.** Fencing only works if the protected resource checks the token in the same atomic step as the write. A random UUID can't be a fencing token, because it has no order. A third-party API that doesn't accept a token can't be protected this way; the best you can do there is an [idempotency key](/engineering/api-integrations/).

The deciding question is **what happens if two workers run at once?** If the answer is "some wasted CPU", a lease with an owner token is enough. If the answer is "a customer is charged twice", you need fencing or a database-level guarantee.

## Efficiency locks and correctness locks

**Decide which kind of lock you need before choosing a tool.**

An **efficiency lock** avoids duplicate work. If it occasionally fails and two workers rebuild the same cache, nothing breaks; you just spent extra CPU. A Redis lease with an owner token is a good fit.

A **correctness lock** protects an invariant. If it fails, data is corrupted or money moves twice. It needs fencing tokens from a store built on consensus, such as etcd or ZooKeeper, or the guarantee should move into the database itself.

Redis's multi-node Redlock algorithm tries to make Redis locks safe for correctness. It has been widely debated, notably in Martin Kleppmann's critique, because it depends on timing assumptions and doesn't produce fencing tokens. Treat any Redis lock as an efficiency lock.

## Choosing a lock service

### Redis

Fast and probably already in your stack. Use it for **efficiency locks** with `SET NX PX`, an owner token, and the atomic release script.

### Your database

If the workers already share a PostgreSQL database, an advisory lock needs no new infrastructure. `pg_try_advisory_lock(42)` returns true for one session and false for the others, and the lock is released automatically if that session's connection drops. Use it when **the protected work is close to that database** and the lock is held briefly.

### etcd or ZooKeeper

Built on consensus, with leases that expire when a client's session ends, and revision or transaction numbers you can use as fencing tokens. Use them for **correctness locks and leader election**, if you can operate them or already run Kubernetes, which runs on etcd.

## Common problems

### The lease is shorter than the work

The invoice job takes 45 seconds and the lease lasts 30. Every run, the lease expires mid-job and another worker starts. Size the lease well above the job's worst-case duration, renew it while working, and check before each step that you still hold it.

### Clocks

Lease expiry depends on time. A lock service whose clock jumps forward can expire leases early. Prefer services that measure lease duration with monotonic clocks, and never compare timestamps from different machines to decide who holds a lock.

### A lock around a side effect it can't fence

Wrapping "call the payment API" in a lock doesn't make the call happen once: a paused holder can still call it after expiry. Use the provider's idempotency key instead, and make your own consumers [idempotent](/microservices/outbox-and-delivery/).

## In interviews

### When to bring it up

Bring up locks for scheduled jobs that must run once, leader election, or exclusive access to something that isn't a single database row. When the problem is about one row, such as booking a seat, reach for a conditional update or a reservation instead, and say why.

### How to introduce it

1. **Try the database first.** "Seat booking is a conditional update on the seat row, so no distributed lock is needed."
2. **Name the lock's purpose.** "For the nightly invoice job, I need only one instance to run it. Duplicate runs would double-bill, so this is a correctness lock."
3. **Pick the mechanism.** "I'd take a lease in etcd and use its revision as a fencing token."
4. **Fence the writes.** "The invoice table rejects writes with a token lower than the last one it accepted."

:::tip[In an interview]
Expect "what if the lock holder pauses?" The answer that stands out names the lease expiry problem and fixes it with fencing tokens.
:::

## Summary

A distributed lock lets one worker act at a time, but because it must expire, it is really a lease.

The trade-off is progress against safety: expiry lets the system recover from crashed holders, and it also lets a paused holder come back after someone else has taken over.

In an interview, try a database constraint or conditional update first, and when you need a lock, say whether it's for efficiency or correctness, and fence the writes if it's for correctness.

Don't treat a lease as a guarantee of a single holder. If a duplicate would corrupt data or move money, the resource itself must reject stale writers.

## Sources

- [Redis: distributed locks](https://redis.io/docs/latest/develop/clients/patterns/distributed-locks/)
- [Martin Kleppmann: distributed locking and fencing](https://martin.kleppmann.com/2016/02/08/how-to-do-distributed-locking.html)
