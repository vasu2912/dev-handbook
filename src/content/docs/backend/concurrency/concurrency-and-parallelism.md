---
title: Concurrency and parallelism
description: Distinguish many tasks in flight from instructions executing at the same instant, and match each to the workload.
sidebar:
  order: 2
---

A backend request spends much of its time waiting. It sends a database query, waits for a response, calls another service, and waits again. During that wait, a concurrent server can run useful work for another request.

Many backends spend more than 70% of request time on I/O such as database calls, external APIs, disk, and logging. A local database query may take about 1 to 2 ms, a cross-region call about 90 to 100 ms, and a request may make several network calls. Treat those values as planning examples, not latency guarantees. Measure the deployment you run.

As a rough example, a request with three to five database queries and one or two external calls may spend about 250 ms waiting for network operations while doing about 10 ms of CPU work. The exact numbers depend on placement and load, but the shape matters. I/O wait can dominate the request.


<svg viewBox="0 0 700 200" style="max-width:100%;height:auto;font-family:'Inter',system-ui,sans-serif; margin: 1.5rem 0;" role="img" aria-label="Timeline showing concurrent vs parallel execution">
  <rect width="700" height="200" fill="var(--diagram-bg)" rx="8" stroke="var(--diagram-border)"/>
  <text x="20" y="30" fill="var(--diagram-ink)" font-weight="bold" font-size="14">Concurrent (1 Core)</text>
  <rect x="150" y="20" width="40" height="20" fill="var(--diagram-accent-bg)" stroke="var(--diagram-accent)"/>
  <text x="170" y="34" fill="var(--diagram-accent-fill)" font-size="12" text-anchor="middle">T1</text>
  <rect x="190" y="26" width="60" height="8" fill="var(--diagram-muted)" stroke="none" rx="4"/>
  <text x="220" y="18" fill="var(--diagram-muted)" font-size="10" text-anchor="middle">I/O</text>
  <rect x="250" y="20" width="40" height="20" fill="var(--diagram-green-bg)" stroke="var(--diagram-green)"/>
  <text x="270" y="34" fill="var(--diagram-green)" font-size="12" text-anchor="middle">T2</text>
  <rect x="290" y="20" width="40" height="20" fill="var(--diagram-accent-bg)" stroke="var(--diagram-accent)"/>
  <text x="310" y="34" fill="var(--diagram-accent-fill)" font-size="12" text-anchor="middle">T1</text>
  <line x1="20" y1="60" x2="680" y2="60" stroke="var(--diagram-border)" stroke-dasharray="4"/>
  <text x="20" y="90" fill="var(--diagram-ink)" font-weight="bold" font-size="14">Parallel (2 Cores)</text>
  <text x="20" y="125" fill="var(--diagram-muted)" font-size="12">Core 1</text>
  <rect x="100" y="110" width="100" height="20" fill="var(--diagram-accent-bg)" stroke="var(--diagram-accent)"/>
  <text x="150" y="124" fill="var(--diagram-accent-fill)" font-size="12" text-anchor="middle">T1</text>
  <text x="20" y="165" fill="var(--diagram-muted)" font-size="12">Core 2</text>
  <rect x="100" y="150" width="100" height="20" fill="var(--diagram-green-bg)" stroke="var(--diagram-green)"/>
  <text x="150" y="164" fill="var(--diagram-green)" font-size="12" text-anchor="middle">T2</text>
  <rect x="200" y="116" width="100" height="8" fill="var(--diagram-muted)" rx="4"/>
  <text x="250" y="108" fill="var(--diagram-muted)" font-size="10" text-anchor="middle">I/O</text>
  <line x1="100" y1="190" x2="680" y2="190" stroke="var(--diagram-ink)" marker-end="url(#arrow)"/>
  <text x="660" y="180" fill="var(--diagram-ink)" font-size="12" text-anchor="end">Time</text>
  <defs>
    <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--diagram-ink)" />
    </marker>
  </defs>
</svg>


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
