---
title: Bulkheads and backpressure
description: Isolate dependency capacity with semaphores and executors, then bound queues and reject excess work.
---

A bulkhead reserves or limits resources for one class of work. If recommendation calls exhaust their allowance, checkout still has capacity for orders. Without isolation, an optional dependency can occupy every worker or connection.

## Common implementations

| Mechanism            | Behavior                                  | Cost                                               |
| -------------------- | ----------------------------------------- | -------------------------------------------------- |
| Semaphore bulkhead   | Admits at most N concurrent operations    | Callers still execute on their current threads     |
| Thread-pool bulkhead | Runs work on a dedicated bounded executor | Scheduling, thread memory, and context propagation |
| Connection pool      | Limits connections to a destination       | Does not necessarily limit all application work    |

A semaphore with 20 permits admits 20 calls. The next call waits for the configured acquisition time or fails. A queue of 10,000 waiting requests defeats the purpose if callers time out before reaching the dependency.

## Rate and concurrency are different

A rate limiter caps arrivals over time. A bulkhead caps simultaneous work. At 100 requests per second and an average duration of 200 ms, about 20 calls are in flight under stable conditions. If duration rises to two seconds, that becomes about 200. The rate did not change.

This is an application of Little's Law: average in-flight work equals arrival rate multiplied by average time in the system. It assumes a stable system and consistent measurement boundaries.

## Backpressure and load shedding

Backpressure lets downstream capacity slow production. A bounded worker queue can stop accepting new jobs when full. Load shedding rejects work that cannot meet its deadline. Both prevent unbounded memory growth, but callers need a useful retry or pending policy.

Separate required and optional dependencies. Measure active permits, queue depth, wait time, rejections, and completion latency. A permanently full bulkhead can indicate an undersized allowance, a slow dependency, or excess demand.

Resilience4j provides semaphore and thread-pool bulkheads. With Java virtual threads, scarce database connections and remote quotas still need limits. Cheap waiting does not create downstream capacity.

Compare [rate limiting](/system-design/rate-limiting/) and [circuit breakers](/microservices/circuit-breakers/).

## Sources

- [Resilience4j: Bulkhead](https://resilience4j.readme.io/docs/bulkhead)
- [Microsoft: Bulkhead pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/bulkhead)
- [Oracle: virtual threads](https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html)
