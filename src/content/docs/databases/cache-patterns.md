---
title: Cache patterns and failure modes
description: Compare cache-aside, write-through, write-behind, expiration, eviction, stampedes, and stale-data races.
---

A cache stores a reusable result closer to the caller or in a cheaper access path. The design is incomplete until it specifies freshness, invalidation, capacity, and behavior when the cache fails.

## Read and write patterns

| Pattern       | Flow                                                  | Main risk                                                 |
| ------------- | ----------------------------------------------------- | --------------------------------------------------------- |
| Cache-aside   | Application reads cache, loads on miss, and populates | Stale fills and stampedes                                 |
| Read-through  | Cache abstraction loads missing data                  | Loader behavior becomes part of the dependency            |
| Write-through | Write goes through a cache layer to backing storage   | Coordinating failures across both stores                  |
| Write-behind  | Cache acknowledges before asynchronous persistence    | Data loss or reordering unless pending writes are durable |

Cache-aside is common because the application controls loading. A write can update the database and invalidate the cache, but the two actions are usually not atomic.

## A stale-fill race

Reader A misses and loads value 10. Writer B commits value 11 and invalidates the key. A then fills the cache with 10. Invalidating after commit did not eliminate stale data.

Possible responses include short freshness bounds, version-aware population, ordered change-driven invalidation, or bypassing cache for operations requiring a current value. Repeating deletion after an arbitrary delay does not establish a universal correctness guarantee.

## Expiration, eviction, and overload

Expiration removes eligibility after a time limit. Eviction removes entries to manage capacity, using policies such as LRU or LFU approximations. Neither proves a value matched the database just before removal.

A stampede occurs when many callers recompute the same missing or expired value. Coalescing loads per key, spreading expiry times with jitter, and serving an explicitly acceptable stale value during refresh can reduce the burst.

Cache penetration repeatedly requests absent objects. Short negative caching can help when authorization and existence semantics permit it. A hot key can overload one shard even when total cache capacity looks sufficient.

Local caches reduce network calls but each instance has its own state. A shared cache centralizes some coordination while adding a network dependency. Cache failure can shift enough load to overwhelm the database, so fallback traffic still needs limits.

Read [system-design caching](/system-design/caching/) and [Spring caching](/java-spring/caching/) for placement and framework behavior.

## Sources

- [Microsoft: Cache-Aside pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside)
- [Redis: key eviction](https://redis.io/docs/latest/develop/reference/eviction/)
- [AWS Builders' Library: caching challenges](https://aws.amazon.com/builders-library/caching-challenges-and-strategies/)
