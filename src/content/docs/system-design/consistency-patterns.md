---
title: Consistency patterns
description: Compare weak, eventual, and strong consistency for replicated data.
sidebar:
  order: 5
---

When a system keeps multiple copies of data, each read must have a defined relationship to writes. The [CAP theorem](/system-design/availability-and-consistency/) defines consistency as returning the latest write or an error. Real systems choose a more specific guarantee per operation.

<svg role="img" aria-label="Write and replication timelines for strong, eventual, and weak consistency" viewBox="0 0 700 350" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:-apple-system,'Segoe UI',sans-serif;margin:20px 0"><rect width="700" height="350" fill="var(--diagram-bg)" rx="8"/><text x="120" y="30" font-size="12" font-weight="700" fill="var(--diagram-muted)">Client</text><text x="300" y="30" font-size="12" font-weight="700" fill="var(--diagram-muted)">Primary</text><text x="550" y="30" font-size="12" font-weight="700" fill="var(--diagram-muted)">Replica</text><g font-size="11" fill="var(--diagram-ink)"><rect x="20" y="50" width="660" height="80" fill="var(--diagram-white)" rx="4" stroke="var(--diagram-border)"/><text x="30" y="70" font-weight="700">Strong</text><text x="170" y="75" fill="var(--diagram-accent)">Write(A)</text><text x="390" y="85">synchronous replication</text><text x="190" y="115" fill="var(--diagram-accent)">success after replica acknowledgement</text><rect x="20" y="140" width="660" height="90" fill="var(--diagram-white)" rx="4" stroke="var(--diagram-border)"/><text x="30" y="160" font-weight="700">Eventual</text><text x="170" y="175" fill="var(--diagram-accent)">Write(A)</text><text x="190" y="190" fill="var(--diagram-accent)">success</text><text x="390" y="205">asynchronous replication</text><text x="380" y="222" fill="var(--diagram-yellow-stroke)">stale-data window</text><rect x="20" y="240" width="660" height="80" fill="var(--diagram-white)" rx="4" stroke="var(--diagram-border)"/><text x="30" y="260" font-weight="700">Weak</text><text x="170" y="275" fill="var(--diagram-accent)">Write(A)</text><text x="190" y="290" fill="var(--diagram-accent)">success</text><text x="380" y="295" fill="var(--diagram-muted)">replication may be dropped</text></g></svg>

## Weak consistency

After a write, a read may or may not see it. The system makes a best-effort attempt to propagate the value. This can fit real-time media or multiplayer games, where missing a brief interval is preferable to delaying the live stream. Memcached commonly provides this style of cache behavior.

## Eventual consistency

After a write, reads see it once asynchronous replication catches up. The delay is often milliseconds, but the interface must allow for a stale window. DNS and email use eventual propagation. This pattern fits highly available data where a temporary old value is acceptable.

## Strong consistency

After a successful write, reads see that write. Replicas acknowledge synchronously, or reads go to an authoritative copy. File systems and transactional relational databases commonly provide strong guarantees within a defined scope. The cost is higher write latency and less availability during a partition.

Write down the stale-read and lost-write behavior that callers can observe. Then use [caching](/system-design/caching/) and [database replication](/system-design/databases/) with that contract in mind.

## Further reading

- [Transactions across data centers](http://snarfed.org/transactions_across_datacenters_io.html)
