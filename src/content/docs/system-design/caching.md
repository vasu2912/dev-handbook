---
title: Caching
description: Reduce repeated work and absorb uneven read traffic with caches.
sidebar:
  order: 13
---

![Cache in front of a worker pool and data store](/images/system-design/vector/cache-overview.svg)

*Original redraw based on [Scalable system design patterns](http://horicky.blogspot.com/2010/10/scalable-system-design-patterns.html).* 

A cache stores a prior result so the next request can avoid the original work. It reduces page load time and load on application servers and databases. Popular records can create a hot spot in a database even when average traffic is balanced. A cache can absorb that uneven load.

## Cache locations

- A client cache in the browser or operating system avoids a network request.
- A [CDN](/system-design/cdn/) caches content at edge locations.
- A [reverse proxy](/system-design/reverse-proxy/) can return cached static or dynamic responses.
- A database usually caches pages and indexes internally. Tune those settings for measured workloads.
- An application cache such as Redis or Memcached sits between the application and durable storage.

RAM is faster but smaller than disk. An eviction policy such as least recently used (LRU) removes cold entries to keep hot data in memory. Avoid file-based caches when nodes need to be cloned or autoscaled.

Cache rows, query results, assembled objects, or fully rendered HTML. Query caching can save work but makes invalidation hard when one changed row affects many query results. Object caching gives the application a smaller set of keys to invalidate. Useful objects include user sessions, rendered pages, activity feeds, and user-graph data.

Redis also provides persistence and data structures such as sorted sets and lists. Those features do not make it a replacement for a durable database without an explicit recovery design.

## Cache-aside

The application owns both the cache lookup and the database read:

1. Look up the key in the cache.
2. On a miss, load the value from the database.
3. Store the value in the cache.
4. Return the value.

```python
def get_user(user_id):
    key = "user.{0}".format(user_id)
    user = cache.get(key)
    if user is None:
        user = db.query(
            "SELECT * FROM users WHERE user_id = {0}".format(user_id)
        )
        if user is not None:
            cache.set(key, json.dumps(user))
    return user
```

![Cache-aside strategy](/images/system-design/vector/cache-aside.svg)

*Original redraw based on [From cache to in-memory data grid](http://www.slideshare.net/tmatyashovsky/from-cache-to-in-memory-data-grid-introduction-to-hazelcast).* 

Memcached is often used this way. Lazy loading caches only requested data, so unused records do not fill the cache.

Each miss adds cache and database trips. A database update can leave a stale entry until its TTL expires or the write path invalidates it. A new cache node starts empty and causes a burst of misses.

## Write-through

The application writes to the cache. The cache synchronously writes the durable store, then returns:

```python
set_user(12345, {"foo": "bar"})
```

```python
def set_user(user_id, values):
    user = db.query("UPDATE Users WHERE id = {0}".format(user_id), values)
    cache.set(user_id, user)
```

![Write-through strategy](/images/system-design/vector/cache-write-through.svg)

*Original redraw based on [Scalability, availability, stability, patterns](http://www.slideshare.net/jboner/scalability-availability-stability-patterns/).* 

Writes take the database latency, but a successful write is immediately available in the cache. A new cache node remains empty until values are written or warmed. Pairing write-through with cache-aside handles reads that populate missing entries. A TTL limits storage for values that are written but never read.

## Write-behind

Write-behind, or write-back, acknowledges a cache update and writes the durable store asynchronously. It improves write latency and can combine multiple updates. A cache failure before the write reaches storage can lose data. The implementation needs a durable queue, ordering rules, retries, and recovery behavior.

![Write-behind strategy](/images/system-design/vector/cache-write-behind.svg)

*Original redraw based on [Scalability, availability, stability, patterns](http://www.slideshare.net/jboner/scalability-availability-stability-patterns/).* 

## Refresh-ahead

Refresh-ahead reloads a recently used entry before its TTL expires. It can avoid a miss for predictable hot keys. If the prediction is wrong, refresh work consumes resources for entries no one requests.

![Refresh-ahead strategy](/images/system-design/vector/cache-refresh-ahead.svg)

*Original redraw based on [From cache to in-memory data grid](http://www.slideshare.net/tmatyashovsky/from-cache-to-in-memory-data-grid-introduction-to-hazelcast).*  

## Invalidation is part of the design

Decide what happens on a database write, cache failure, TTL expiry, and partial update. A stale value can be acceptable for a feed but not for an authorization decision. A cache is not free consistency. It adds keys, expiry, eviction, warm-up, and failure behavior to the system.

See [consistency patterns](/system-design/consistency-patterns/) for the guarantees readers need and [databases](/system-design/databases/) for the source of truth.

## Further reading

- [AWS ElastiCache strategies](http://docs.aws.amazon.com/AmazonElastiCache/latest/UserGuide/Strategies.html)
- [Scalable system design patterns](http://horicky.blogspot.com/2010/10/scalable-system-design-patterns.html)
