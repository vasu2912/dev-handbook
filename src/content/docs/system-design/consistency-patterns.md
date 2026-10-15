---
title: Consistency patterns
description: Compare weak, eventual, and strong consistency for replicated data.
sidebar:
  order: 5
---

When a system keeps multiple copies of data, each read must have a defined relationship to writes. The [CAP theorem](/system-design/availability-and-consistency/) defines consistency as returning the latest write or an error. Real systems choose a more specific guarantee per operation.

<div data-anatomy="system-design--consistency-patterns-1"></div>

## Weak consistency

After a write, a read may or may not see it. The system makes a best-effort attempt to propagate the value. This can fit real-time media or multiplayer games, where missing a brief interval is preferable to delaying the live stream. Memcached commonly provides this style of cache behavior.

## Eventual consistency

After a write, reads see it once asynchronous replication catches up. The delay is often milliseconds, but the interface must allow for a stale window. DNS and email use eventual propagation. This pattern fits highly available data where a temporary old value is acceptable.

## Strong consistency

After a successful write, reads see that write. Replicas acknowledge synchronously, or reads go to an authoritative copy. File systems and transactional relational databases commonly provide strong guarantees within a defined scope. The cost is higher write latency and less availability during a partition.

Write down the stale-read and lost-write behavior that callers can observe. Then use [caching](/system-design/caching/) and [database replication](/system-design/databases/) with that contract in mind.

## Further reading

- [Transactions across data centers](http://snarfed.org/transactions_across_datacenters_io.html)
