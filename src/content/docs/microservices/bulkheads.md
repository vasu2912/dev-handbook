---
title: Bulkheads and backpressure
description: Keep one slow dependency from using up every thread and connection, size limits with Little's Law, and reject excess work before it piles up.
---

Your product page calls a Recommendations service for the "you might also like" row. Today Recommendations takes three seconds per call. Product page requests pile up waiting for it, and they share Tomcat's 200 worker threads with checkout. Within a minute, no thread is free to place an order, even though Payments and Inventory are perfectly healthy.

**A bulkhead caps how much of a shared resource one kind of work may use.** The name comes from ships: watertight compartments keep one flooded section from sinking the whole hull. If Recommendations can hold at most 20 threads, the other 180 stay free for checkout.

The catch is that a bulkhead rejects work on purpose. Size it too small and you turn away requests you could have served; size it too large and it protects nothing. This article covers how bulkheads work, how to size them, how they differ from rate limits, and what to do with work you can't accept.

## How a bulkhead works

[Figure](#fig-bulkhead-split) shows one service's capacity split between a required and an optional dependency.

```mermaid #fig-bulkhead-split One service's capacity split into two bulkheads. A slow Recommendations service can hold at most 20 permits, leaving checkout's 150 untouched.
flowchart LR
  REQ[Incoming requests] --> APP[Orders service]
  APP --> BC["Checkout bulkhead: 150 permits"]
  APP --> BR["Recommendations bulkhead: 20 permits"]
  BC --> PAY[Payments]
  BR --> REC[Recommendations]
```

1. A request that needs **Recommendations** must first take one of 20 permits.
2. If all 20 are in use, the request waits briefly for one, then gets an immediate rejection and shows the page without recommendations.
3. **Checkout** calls draw from their own allowance, so they never compete with Recommendations for threads.

**Separate required dependencies from optional ones.** Optional work gets a small, strict limit. Required work gets the largest share.

## Ways to build one

### Semaphore bulkhead

A counter of permits. The call runs on the caller's own thread, but only if a permit is free.

This is the default choice: cheap, simple, and it works with any threading model. The downside is that the caller's thread is still the one doing the waiting, so the semaphore limits how many calls run at once, not how long each one takes. Pair it with a [timeout](/microservices/timeouts-and-retries/).

### Thread-pool bulkhead

The call runs on a dedicated, bounded thread pool with its own queue. The caller can stop waiting after a deadline while the pool's thread finishes or abandons the work.

Use this when **you need to hand work off and time out the wait from the caller's side**, for example to call a blocking client from asynchronous code. The downside is overhead: thread memory, context switching, and the need to copy context such as trace IDs and the security principal onto the pool's threads.

### Connection pool

A database or HTTP connection pool with a maximum size is already a bulkhead for that destination. HikariCP's default maximum is 10 connections. It caps connections, not the application work around them, so it complements an application-level bulkhead rather than replacing one.

Resilience4j provides both semaphore and thread-pool bulkheads.

## Sizing with Little's Law

**In-flight work equals arrival rate times time in the system.** This is Little's Law, and it holds for any stable system measured consistently.

```text
100 requests/s × 0.2 s average duration   = 20 calls in flight
100 requests/s × 2 s when it slows down   = 200 calls in flight
```

The arrival rate didn't change. Only the latency did, and the concurrency went up tenfold. That's exactly the failure a bulkhead stops.

Size each bulkhead from the expected rate and a high-percentile latency, plus headroom:

```text
Recommendations: 50 requests/s × 0.3 s p99  = 15 → allow 20 permits
Max wait for a permit                        = 10 ms, then reject
```

Keep the wait for a permit short. A bulkhead with a long wait just moves the pile-up from the dependency to the bulkhead.

## Concurrency limits versus rate limits

A [rate limiter](/system-design/rate-limiting/) caps how many requests start per second. A bulkhead caps how many run at the same moment.

They fail differently. At 100 requests per second, a rate limit of 120 per second never triggers, even when each call takes two seconds and 200 threads are stuck. A bulkhead of 20 triggers right away. **Use a rate limit to share capacity fairly between clients; use a bulkhead to survive a slow dependency.**

## When work arrives faster than you can handle it

Once you cap concurrency, you have to decide what happens to the excess. There are three common answers.

### Naive approach: an unbounded queue

**How it works.** Excess requests wait in a queue until a permit frees up.

**Where it breaks.** The queue grows without limit. Memory climbs, and every request in it waits longer than its caller will. A queue of 10,000 requests, each behind 200 ms of work on 20 permits, means the last one waits 100 seconds. Its caller gave up long ago, but the work still runs.

### Better approach: a bounded queue that rejects when full

**How it works.** Allow a small queue, say 50 requests, and reject anything beyond it with `503 Service Unavailable` or `429 Too Many Requests`.

**Where it breaks.** Requests already in the queue may have expired deadlines. The service still spends capacity on them while rejecting fresh requests that could have succeeded.

### Strong approach: shed by deadline and priority, and push back

**How it works.**
1. Drop queued work whose deadline has already passed instead of running it.
2. Under pressure, shed optional work first, such as recommendations and analytics, before checkout.
3. Tell callers to slow down: send `Retry-After` with 429 or 503, pause Kafka consumers with `pause()`, or use the `request(n)` signal in reactive streams.

[Figure](#fig-backpressure) shows the bounded queue with both ways out: slowing the producer and rejecting work.

```mermaid #fig-backpressure Backpressure and load shedding. Workers signal the producer to slow down, and the bounded queue rejects work that is over capacity or past its deadline.
flowchart LR
  P[Producer] --> Q[Bounded queue]
  Q --> W[Workers]
  W -. "slow down" .-> P
  Q -->|"full or expired"| X[Reject or shed]
```

**Where it breaks.** Backpressure only works if producers honor it. A client that retries every rejection immediately makes overload worse. See [timeouts and retries](/microservices/timeouts-and-retries/) for well-behaved retries.

The deciding question is **can the caller do something useful with a fast "no"?** If it can show a degraded page or retry later, reject quickly. A short bounded queue is only worth it for brief bursts.

:::note[Related pattern]
A [circuit breaker](/microservices/circuit-breakers/) stops calling a dependency that is failing. A bulkhead limits calls to a dependency that is healthy but slow or overloaded. Most production calls use both.
:::

## Virtual threads don't remove the need

Java 21's virtual threads make waiting cheap: a million blocked virtual threads cost little memory. They don't create downstream capacity. Your database still has 10 connections and your payment provider still has a quota. **Cheap waiting is not extra capacity.** Keep bulkheads around scarce resources even when threads are no longer the bottleneck.

## Common problems

### A bulkhead that is always full

Permits are always in use and rejections are steady. The cause is one of three things: the limit is too small for real traffic, the dependency got slower, or demand grew. Here's how to tell them apart:

- **Latency rose, rate didn't:** the dependency is slow. Fix it or degrade.
- **Rate rose, latency didn't:** demand grew. Raise the limit if the dependency can take it.
- **Neither changed:** the limit was sized from the wrong numbers. Recalculate with Little's Law.

### Shared pools hidden behind libraries

Two clients built from one default HTTP client may share a connection pool, so the bulkhead you configured on one doesn't isolate it from the other. Give each important dependency its own client or pool.

### Nothing measured

You can't size what you can't see. Track active permits, queue depth, wait time, rejections, and dependency latency for each bulkhead.

## In interviews

### When to bring it up

Bring up bulkheads when a service calls several dependencies with different importance, or when one slow dependency could take down unrelated features. It's a natural follow-up to "what happens when this dependency gets slow?"

### How to introduce it

1. **Separate the work.** "Recommendations is optional and checkout is required, so they shouldn't share a thread pool."
2. **Size it.** "Recommendations runs at about 50 requests a second with a 300 ms p99, so 20 concurrent calls is plenty."
3. **Say what happens on rejection.** "When the bulkhead is full, the page renders without recommendations."
4. **Push back.** "Under overload we return 503 with Retry-After and shed analytics before anything else."

:::tip[In an interview]
Little's Law is a strong move in an interview. Showing that concurrency is rate times latency explains why a slow dependency, not more traffic, is what exhausts your threads.
:::

## Summary

A bulkhead gives each kind of work its own capped share of threads or connections, so one slow dependency can't starve the rest.

The trade-off is isolation against utilization: you deliberately reject some work to keep the important work running.

In an interview, bring up bulkheads when one service calls dependencies of different importance, size them with rate times latency, and say what users see when one is full.

Don't put an unbounded queue behind a limit. Reject early, shed optional work first, and tell callers to slow down.

## Sources

- [Resilience4j: Bulkhead](https://resilience4j.readme.io/docs/bulkhead)
- [Microsoft: Bulkhead pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/bulkhead)
- [Oracle: virtual threads](https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html)
