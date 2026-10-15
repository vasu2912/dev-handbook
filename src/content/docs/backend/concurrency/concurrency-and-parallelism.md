---
title: Concurrency and parallelism
description: Distinguish many tasks in flight from instructions executing at the same instant, and match each to the workload.
sidebar:
  order: 2
---

A backend request spends much of its time waiting. It sends a database query, waits for a response, calls another service, and waits again. During that wait, a concurrent server can run useful work for another request.

Many backends spend more than 70% of request time on I/O such as database calls, external APIs, disk, and logging. A local database query may take about 1 to 2 ms, a cross-region call about 90 to 100 ms, and a request may make several network calls. Treat those values as planning examples, not latency guarantees. Measure the deployment you run.

As a rough example, a request with three to five database queries and one or two external calls may spend about 250 ms waiting for network operations while doing about 10 ms of CPU work. The exact numbers depend on placement and load, but the shape matters. I/O wait can dominate the request.


<div data-anatomy="backend--concurrency--concurrency-and-parallelism-1"></div>


## Use the terms precisely

- **Concurrency** is the structure for dealing with multiple tasks in progress. A task runs, pauses at a wait, and resumes later. One core can interleave many tasks.
- **Parallelism** is simultaneous execution. Two tasks run at the same instant on separate cores or hardware execution units.

```text
one core, concurrency:
request A -> waits for I/O -> request B -> waits for I/O -> request A resumes

two cores, parallelism:
core 1: request A executes at the same time as request B on core 2
```

Concurrency and parallelism can coexist. A runtime may keep thousands of I/O-bound tasks in flight and run CPU work on several cores.

## Classify the workload

| Workload | Examples | Useful mechanism |
| --- | --- | --- |
| I/O-bound | HTTP servers, database calls, service-to-service requests | Event loops, `async/await`, goroutines, virtual threads |
| CPU-bound | Image and video processing, encryption, numerical work | Threads or processes across cores |

One blocking CPU task can freeze a single-threaded event loop. One thread per I/O wait can waste memory and scheduler time. Measure the wait and compute mix before selecting a runtime pattern.

The next pages explain [threads](/backend/concurrency/threads/), [event loops](/backend/concurrency/event-loop/), and [goroutines](/backend/concurrency/goroutines/).
