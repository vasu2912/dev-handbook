---
title: Caching in Spring
description: Make cache keys, freshness, invalidation, and concurrent misses part of the application contract.
---

A cache avoids repeated work by reusing an earlier result. The useful question is not whether a method can carry `@Cacheable`. It is how long that result remains acceptable, which callers may share it, and what happens when the cache misses or fails.

## Cache the result, not required behavior

With `@EnableCaching`, Spring intercepts annotated bean methods and delegates storage to a `CacheManager`. `@Cacheable` checks for a matching entry and skips the method on a hit. On a miss, it invokes the method and stores its result. Required side effects or authorization checks inside that method would also be skipped.

`@CachePut` always invokes the method and places its result in the cache. Use it when the operation already computes the replacement value. `@CacheEvict` removes an entry, or all entries in a cache, so a later read loads again. By default, eviction follows successful method execution. `beforeInvocation=true` evicts even if the method later fails. Neither setting means "after database commit."

The default interception mode uses proxies. A method calling another cached method on the same instance bypasses caching. Put the cached operation on an appropriate bean boundary instead of relying on the annotation alone.

## A key defines who shares a value

A cache key must include every input that changes the result. Product ID alone is insufficient if tenant, currency, or locale changes the response. Omitting tenant identity can disclose another tenant's data. Authorization still needs to run on every protected operation, including cache hits.

Spring's default key uses the method arguments. It does not automatically include the method name, authenticated identity, or hidden thread-local values. Methods sharing a cache name must agree on key meaning. Stable value-based keys avoid surprises from mutable arguments and object identity.

These fragments use an explicit immutable key so the lookup and eviction agree even though their method signatures differ. They assume a configured `productViews` cache, an injected `catalog`, and public methods on a proxied bean. `ProductView` is an immutable DTO, not a managed JPA entity:

```java
public record ProductKey(String tenantId, String productId) {}
public record ProductView(String name, long priceMinor, long version) {}

@Cacheable(cacheNames = "productViews", key = "#p0")
public ProductView find(ProductKey key) {
	return catalog.load(key.tenantId(), key.productId());
}

@CacheEvict(cacheNames = "productViews", key = "#p0")
public void rename(ProductKey key, String name) {
	catalog.rename(key.tenantId(), key.productId(), name);
}
```

The record declarations belong in their own files. `#p0` selects the first argument without relying on Java parameter-name metadata. For a remote cache, configure a stable key serialization that preserves both fields. A caller must establish tenant access before reaching the shared lookup. Never trust a request-supplied tenant ID without checking it against the authenticated caller.

For this example, `catalog.rename` is on a separate transactional bean. The outer `rename` method has no transaction, and its caller has no ambient transaction. The inner transaction commits before returning to the cache eviction interceptor. A failed commit throws, so eviction does not run. This arrangement illustrates ordering, not atomic database-and-cache updates. If the process stops after commit but before eviction, the old cache entry can remain.

### Observe a miss, hit, and eviction

Assume `productViews` starts empty. Tenant `acme` owns product `p7` named `Desk`, version 1. Tenant `beta` owns a different `p7` named `Lamp`. This caller fragment invokes the proxied bean, after authorization:

```java
var acme = new ProductKey("acme", "p7");
var beta = new ProductKey("beta", "p7");
views.find(acme);
views.find(acme);
views.find(beta);
views.rename(acme, "Standing desk");
views.find(acme);
```

The table shows the expected outcomes, not measured log output. Assume the repository increments the version when renaming:

| Call | Method body runs? | DB work | Result and cache state |
| --- | --- | --- | --- |
| First `find(acme)` | Yes, miss | Load acme p7 | Returns Desk v1, caches it under acme p7 |
| Second `find(acme)` | No, hit | None | Returns Desk v1 from cache |
| `find(beta)` | Yes, separate key | Load beta p7 | Returns Lamp, acme entry unchanged |
| `rename(acme, "Standing desk")` | Yes | Commit name and version 2 | Evicts acme p7, beta entry remains |
| Next `find(acme)` | Yes, miss | Load acme p7 | Returns Standing desk v2, caches it |

If the key were only `productId`, the third call would return acme's Desk to beta without running the method. That is a data isolation bug, not merely a poor hit rate.

## Invalidation can race with reads

Even eviction after commit does not prevent an older in-flight read from repopulating the cache. Both scenarios below start with `DB[acme,p7]=Desk v1` and no cache entry. Assume no `sync=true`, immutable results, and an ordinary cache-aside provider. The reader's loaded DTO can wait in memory before Spring inserts it into the cache.

<section class="walkthrough" aria-label="Cache reads and stale repopulation">
<section data-scenario="Normal load then update">
<p><strong>Normal load then update</strong></p>
<ol class="walkthrough-steps">
<li><strong>Miss and load</strong><p>Reader A checks acme p7 and misses. The method loads Desk v1 from the DB. Spring stores that DTO. DB=Desk v1, cache=Desk v1.</p></li>
<li><strong>Serve a hit</strong><p>Reader B uses the same tenant-aware key. Spring returns Desk v1 without invoking catalog.load. DB=Desk v1, cache=Desk v1, with no new database query.</p></li>
<li><strong>Commit the update, then evict</strong><p>The writer commits Standing desk v2 and the cache interceptor removes acme p7. DB=Standing desk v2, cache=empty. The next lookup must load again.</p><svg role="img" aria-label="After the update commits, database holds version 2 and the cache is empty" viewBox="0 0 440 100" width="100%" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="10" width="200" height="80" rx="6" fill="var(--diagram-green-bg)" stroke="var(--diagram-green)"/><rect x="235" y="10" width="200" height="80" rx="6" fill="var(--diagram-bg)" stroke="var(--diagram-border)"/><g fill="var(--diagram-ink)" font-size="18" text-anchor="middle"><text x="105" y="42">Database</text><text x="105" y="70">v2 committed</text><text x="335" y="42">Cache: acme p7</text><text x="335" y="70">empty</text></g></svg></li>
<li><strong>Load the new value</strong><p>The next reader loads Standing desk v2 and fills the entry. DB=Standing desk v2, cache=Standing desk v2. Later hits reuse v2.</p></li>
</ol>
</section>
<section data-scenario="Old reader repopulates after eviction">
<p><strong>Old reader repopulates after eviction</strong></p>
<ol class="walkthrough-steps">
<li><strong>Pause an old cache miss</strong><p>Reader A misses and loads Desk v1, but has not yet returned through the cache interceptor. DB=Desk v1, cache=empty, reader A holds v1 in memory.</p></li>
<li><strong>Commit and evict while A waits</strong><p>Writer B commits Standing desk v2, then evicts the key. DB=Standing desk v2, cache=empty. Eviction cannot remove the DTO still held by reader A.</p></li>
<li><strong>Resume the old reader</strong><p>Reader A returns its already-loaded Desk v1. Spring fills the empty cache with v1. DB=Standing desk v2, cache=Desk v1. Eviction happened in the intended order and the cache is still stale.</p><svg role="img" aria-label="Old reader stores version 1 after eviction while the database already has version 2" viewBox="0 0 440 165" width="100%" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="75" width="200" height="80" rx="6" fill="var(--diagram-green-bg)" stroke="var(--diagram-green)"/><rect x="235" y="75" width="200" height="80" rx="6" fill="var(--diagram-red-bg)" stroke="var(--diagram-red)"/><path d="M220 40H335v35l-5 -9m5 9l5 -9" fill="none" stroke="var(--diagram-red)" stroke-width="2"/><g fill="var(--diagram-ink)" font-size="18" text-anchor="middle"><text x="112" y="44">Reader A holds v1</text><text x="105" y="107">Database</text><text x="105" y="135">v2 committed</text><text x="335" y="107">Cache: acme p7</text><text x="335" y="135">v1 stale</text></g></svg></li>
<li><strong>A later reader sees stale data</strong><p>Reader C hits Desk v1 and never queries the DB. DB stays at v2 and cache stays at v1 until expiry, another eviction, or a coordinated correction. A TTL begins from the stale insertion, not from the earlier database update.</p></li>
</ol>
</section>
</section>

Concurrent misses can execute the underlying method several times. `@Cacheable(sync=true)` asks the provider to coordinate loading for a key, but support and coordination scope depend on that provider. It is not a portable cluster-wide lock, nor does it serialize database writers with cached reads.

For descriptions with an explicit stale-data allowance, bounded expiry may be enough. For stricter freshness, design writer and loader coordination across all replicas, such as a version-aware protocol that rejects obsolete loads. Merely putting a version in the cached value does not make ordinary `@Cacheable` compare versions. When a decision needs authoritative current data, such as reserving stock, read and validate it at the database transaction boundary instead of trusting this cache.

## Storage decides freshness and reach

A local cache such as Caffeine keeps entries inside each application process. Reads avoid a network call, but replicas can hold different versions, and restart empties that instance's cache. Evicting one instance does not invalidate the others.

A shared cache such as Redis lets replicas use the same store, at the cost of serialization, network latency, and another service that can fail. Shared storage still does not synchronize itself with database commits or other writers. Neither store is the durable source of truth for this product example.

Expiry, maximum size, and eviction policy belong to the cache provider, not `@Cacheable`. Choose a freshness allowance based on the use case. Expiry limits how long an entry is reused under that policy. It is not a guarantee that the underlying data was current when loaded.

Decide what happens when the cache provider throws. Fail-open behavior can preserve reads for some use cases, but sending every cache hit to the database can turn a cache outage into a database outage. Define source-capacity limits before enabling that fallback.

Continue with [proxies](/java-spring/proxies/), [transactions](/java-spring/transactions/), and [JPA entities](/java-spring/jpa-entities/).

## Sources

- [Spring cache abstraction](https://docs.spring.io/spring-framework/reference/integration/cache/strategies.html)
- [Annotation-based caching, keys, synchronization, and eviction](https://docs.spring.io/spring-framework/reference/integration/cache/annotations.html)
- [Provider-specific expiry and eviction policies](https://docs.spring.io/spring-framework/reference/integration/cache/specific-config.html)
