---
title: Threads
description: Understand operating-system scheduling, shared memory, and the costs of thread-based concurrency.
sidebar:
  order: 3
---

A thread is an independent path of execution managed by the operating system. Each thread has a stack for function calls and local variables, and an instruction pointer that records where execution resumes.


<div data-anatomy="backend--concurrency--threads-1"></div>
## How the scheduler runs threads

The OS scheduler preempts threads and gives each a time slice. When a thread performs blocking I/O, the OS marks it blocked and schedules another runnable thread. When the I/O completes, the thread becomes runnable and waits for another slice.

```text
running -> hits I/O -> blocked -> I/O completes -> runnable
         -> scheduler selects it -> running
```

Preemption means the OS can pause a thread before its function finishes. A context switch saves the current registers and state, loads another thread's state, and updates scheduler bookkeeping.

## Threads share a process heap

Threads in one process share the heap and global variables. Shared memory is fast because threads do not serialize every value, but unsynchronized read and write operations can race. Threads in different processes have separate memory and need an explicit communication mechanism.

## Account for the cost

- Each thread has a stack. A thread-per-request server can consume large amounts of memory during a spike.
- Creating a thread requires kernel bookkeeping and scheduler setup.
- Context switches consume CPU without advancing application work. A switch often takes about 1 to 10 microseconds, and many switches add up.

The naive one-thread-per-request model struggles when many requests wait at once. A spike of 10,000 requests can reserve 8 to 9 GB for stacks alone, depending on stack configuration. Threads remain useful for CPU-bound work because threads can execute in parallel across cores. For I/O-heavy work, an event loop or runtime-scheduled task can hold more in-flight operations at lower per-task cost.

Read [the event loop](/backend/concurrency/event-loop/) and [race conditions](/backend/concurrency/race-conditions/) next.
