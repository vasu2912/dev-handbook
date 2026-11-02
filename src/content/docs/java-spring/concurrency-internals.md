---
title: Java concurrency and virtual threads
description: Explain visibility, atomicity, happens-before, locks, futures, bounded executors, and virtual-thread capacity.
---

Concurrency correctness depends on which operations must be atomic and how writes become visible to other threads. Scheduling a task on another thread does not automatically make shared mutable state safe.

## Visibility and atomicity

The Java Memory Model defines happens-before relationships that constrain observations. Unlocking a monitor happens-before a later lock of that monitor. A write to a volatile field happens-before a subsequent read of that field. Thread start, termination observation, and concurrency utilities supply other defined relationships.

`volatile` provides visibility and ordering, but `count++` is a read-modify-write sequence. Two threads can both read the same count and overwrite each other's increments. An atomic counter or lock can protect that operation.

```java
final class Inventory {
	private int available = 5;

	synchronized boolean reserve(int quantity) {
		if (quantity <= 0 || available < quantity) return false;
		available -= quantity;
		return true;
	}
}
```

The check and decrement share one monitor. This protects one object in one JVM. It does not coordinate inventory across service instances or persist a reservation after a crash.

## Choosing a mechanism

| Mechanism           | Useful property                                  | Limit                                                  |
| ------------------- | ------------------------------------------------ | ------------------------------------------------------ |
| `synchronized`      | Mutual exclusion and visibility                  | Blocking and lock-order risks                          |
| `ReentrantLock`     | Explicit acquisition, timed attempts, conditions | Unlocking must be correct on every path                |
| Atomic variables    | Atomic updates to defined values                 | Separate updates do not form one multi-field invariant |
| `Semaphore`         | Limits concurrent access                         | Does not make the protected operation transactional    |
| `CompletableFuture` | Composes asynchronous outcomes                   | Executor choice and cancellation still matter          |

Compare-and-set supports retry loops, but contention can cause repeated work. Immutability and ownership can remove the need for shared updates altogether.

## Executors and virtual threads

A fixed-size executor with an unbounded task queue can exhaust memory under sustained overload. Bounded queues and explicit rejection policies make capacity visible. Avoid blocking every worker while waiting for other tasks queued to the same exhausted pool.

Java 21 virtual threads let many blocking tasks share a smaller set of operating-system carrier threads. They improve scalability for waiting workloads, not the speed of CPU-bound computation. Use one virtual thread per task rather than pooling virtual threads to simulate scarce downstream capacity. Limit that capacity with a semaphore or pool at the resource boundary.

In Java 21, some blocking inside `synchronized` regions can pin a carrier thread. Later JDK releases change parts of this behavior, so diagnose against the actual runtime version.

Cancellation is cooperative. Preserve interruption when catching `InterruptedException`, and define cleanup. Cancelling a future does not prove a remote side effect stopped.

## Sources

- [Java Language Specification: memory model](https://docs.oracle.com/javase/specs/jls/se21/html/jls-17.html)
- [Java 21: java.util.concurrent](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/package-summary.html)
- [Java 21: virtual threads](https://docs.oracle.com/en/java/javase/21/core/virtual-threads.html)
