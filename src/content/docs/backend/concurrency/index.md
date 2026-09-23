---
title: Concurrency
description: Build a mechanical model of waiting, execution, scheduling, and shared state in backend programs.
sidebar:
  order: 1
---

An HTTP server handles many requests while each request waits on a database, network, disk, or another process. Concurrency describes how a program keeps many tasks in flight. Parallelism describes work that runs at the same instant on different cores.

Start with [concurrency and parallelism](/backend/concurrency/concurrency-and-parallelism/). Then compare the mechanisms that implement concurrent work:

- [Threads](/backend/concurrency/threads/) are scheduled by the operating system.
- [The event loop](/backend/concurrency/event-loop/) runs callbacks on one thread.
- [Goroutines](/backend/concurrency/goroutines/) are lightweight tasks scheduled by the Go runtime.

Any model can race when operations share mutable state. Read [race conditions](/backend/concurrency/race-conditions/) before choosing a lock or channel.

## Pick the mechanism for the work

Most request handling is I/O-bound, so concurrency lets the CPU work on another request while one waits. CPU-bound work such as image processing, heavy encryption, or video encoding benefits from parallelism across cores. [Asynchronous processing](/system-design/asynchronous-processing/) covers jobs that should not hold an HTTP request open.
