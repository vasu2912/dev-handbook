---
title: Runtime and computer science notes
description: Connect processes, memory, networking, data structures, and algorithms to backend execution.
---

A backend runs inside an operating system, uses memory, sends bytes through networks, and chooses algorithms for its work. These foundations explain behavior that framework annotations cannot hide.

- [Processes, scheduling, and I/O](/runtime/processes-and-io/) explains execution, blocking, synchronization, and deadlock.
- [Memory and storage](/runtime/memory-and-storage/) connects virtual memory, paging, file descriptors, and persistence.
- [Networking and HTTP connections](/runtime/networking/) follows DNS, TCP, TLS, HTTP, and connection reuse.
- [Data structures and complexity](/runtime/data-structures/) compares the costs behind collections and indexes.
- [Algorithm patterns](/runtime/algorithms/) explains the reasoning behind search, traversal, greedy choices, and dynamic programming.

These are revision notes about mechanisms and tradeoffs. Read [concurrency](/backend/concurrency/) for threads, event loops, goroutines, and races, then [JVM internals](/java-spring/jvm-internals/) for Java's execution model.
