---
title: Design a query cache
description: A worked design for an LRU cache that serves popular search results with low latency.
sidebar:
  order: 6
---

## Define use cases and constraints

### Use cases (in scope)

- **User** sends a search request that results in a cache hit.
- **User** sends a search request that results in a cache miss.
- **Service** has high availability.

### Constraints and assumptions

- Traffic is not evenly distributed; popular queries should almost always hit.
- Fast lookups; low latency between machines.
- **Limited memory**: must decide what to keep and what to expire; cache millions of queries.
- 10 million users, 10 billion queries/month.

### Usage

- ~270 bytes per entry (`query` 50, `title` 20, `snippet` 200).
- 2.7 TB/month if all 10 billion queries are unique and all are stored.
- **4,000 requests/second**.

## Sketch the high-level design

![High-level query-cache architecture](/images/system-design/vector/query-cache-high-level.svg)

## Define the core components

Popular queries are served from a **memory cache** (Redis/Memcached) to cut read latency and spare the reverse index and document services. Limited capacity → use **LRU** to expire old entries.

1. Query API parses the query (remove markup, tokenize, fix typos, normalize).
2. On a **hit**: move the entry to the front of the LRU list and return it.
3. On a **miss**: query the reverse index and document services, then store the result at the front of the cache.

:::tip[Data structure]
A **doubly-linked list** (new items at head, expired items from tail) plus a **hash table** for O(1) lookup to each node. This is the classic LRU design.
:::

### When to update the cache

Update when page contents change, a page is added/removed, or page rank changes. The simplest approach is a **TTL** (cache-aside). See [cache](/system-design/caching/) for the trade-offs.

## Scale the design

![Scaled query-cache architecture](/images/system-design/vector/query-cache-scaled.svg)

:::caution[Iterate, do not jump]
Benchmark → profile → fix → repeat.
:::

### Scaling the cache cluster

Three options for distributing the cache across machines:

| Option | Trade-off |
| --- | --- |
| Each machine has its own cache | Simple, low hit rate |
| Each machine has a full copy | Simple, wastes memory |
| **Shard** the cache across machines | More complex, best option |

Shard with `machine = hash(query)`, using **[consistent hashing](/system-design/load-balancing/)** to minimize data movement on rebalance.

## Additional talking points

- SQL scaling patterns, NoSQL, caching levels: see [database](/system-design/databases/) and [cache](/system-design/caching/).

---
