---
title: Goroutines
description: Understand Go's lightweight runtime-scheduled tasks, M:N scheduling, and their relationship to OS threads.
sidebar:
  order: 5
---

A goroutine is a lightweight task managed by the Go runtime. Go's HTTP server can start one goroutine per request because a goroutine uses a small, growing stack instead of a full OS thread stack.


<div data-anatomy="backend--concurrency--goroutines-1"></div>
## Follow the M:N scheduler

Go schedules many goroutines, called G, onto a smaller set of OS threads, called M. Logical processors, called P, determine how many goroutines can execute Go code in parallel. `GOMAXPROCS` controls that count. The runtime may create additional OS threads when a thread blocks in a system call or cgo.

```text
many goroutines (G) -> logical processors (P) -> OS threads (M)
```

When one goroutine waits on I/O, the runtime can pause it and run another goroutine on the available thread. A runtime switch avoids much of the kernel work required for an OS context switch. With multiple logical processors, goroutines also run in parallel.

## Compare the models

| Model | Managed by | Per-task cost | Parallelism |
| --- | --- | --- | --- |
| OS thread | Kernel | High stack and context-switch cost | Yes, across cores |
| Event loop | Runtime on one thread | Very low | No, unless workers are added |
| Goroutine | Go runtime | Very low, growing stack | Yes, across cores |

Goroutines combine synchronous-looking code with cheap runtime scheduling. That does not remove the need for cancellation, bounded work, or synchronization. A goroutine leak still consumes memory, and shared mutable state can still race.

Java virtual threads use the same broad idea: lightweight runtime-scheduled threads mapped onto a smaller set of OS threads. The exact scheduling and blocking behavior remains runtime-specific.

Read [race conditions](/backend/concurrency/race-conditions/) before sharing state between goroutines.
