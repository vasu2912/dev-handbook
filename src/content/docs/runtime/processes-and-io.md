---
title: Processes, scheduling, and I/O
description: Explain process isolation, thread scheduling, blocking and asynchronous I/O, synchronization, and deadlock.
---

A process provides an execution environment with its own virtual address space and operating-system resources. Threads within a process share memory but have separate execution state and stacks. Runtime-managed tasks, including Java virtual threads, introduce another scheduling layer.

## Scheduling and context switches

The scheduler selects runnable operating-system threads for CPU time. A thread can be running, ready to run, or blocked waiting for an event. A context switch saves execution state and restores another thread's state. Switching between address spaces can add translation and cache costs.

Concurrency means operations can make progress during overlapping periods. Parallelism means operations execute at the same time. One CPU core can interleave concurrent work without executing two instructions from different threads simultaneously.

## I/O models

| Model                             | Caller behavior                                                     |
| --------------------------------- | ------------------------------------------------------------------- |
| Blocking                          | Waits until the operation completes or a condition changes          |
| Nonblocking                       | Returns promptly, possibly reporting that no progress is available  |
| Readiness notification            | Waits for notification that an operation can probably make progress |
| Completion-based asynchronous I/O | Submits work and receives its completion later                      |

An event loop can use readiness notifications to handle many sockets. CPU-heavy work inside the event-loop callback still blocks other callbacks. A thread-per-request approach makes control flow direct but needs bounded resource use. Readiness and completion are different notifications.

## Synchronization tools

A mutex gives exclusive access to a critical section. A semaphore represents a number of permits. A condition variable lets a thread wait for a state change while cooperating with a lock. Check the condition in a loop because waking does not guarantee the required state still holds.

A spinlock waits by repeatedly checking, spending CPU. It can fit very short low-level waits but is usually a poor application-level substitute for blocking synchronization.

Deadlock requires mutual exclusion, holding resources while waiting for others, no forced resource removal, and a cycle of waits. Consistent lock ordering breaks the cycle condition. Starvation means one participant cannot obtain progress; livelock means participants keep reacting without completing useful work.

High CPU can indicate computation or spinning. Low CPU with high request latency can indicate waiting on locks, connections, or remote services. Investigate execution state before adding workers.

## Sources

- [Linux man-pages: pthreads](https://man7.org/linux/man-pages/man7/pthreads.7.html)
- [Linux man-pages: epoll](https://man7.org/linux/man-pages/man7/epoll.7.html)
- [Operating Systems: Three Easy Pieces, concurrency introduction](https://pages.cs.wisc.edu/~remzi/OSTEP/threads-intro.pdf)
