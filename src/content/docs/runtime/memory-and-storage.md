---
title: Memory and storage
description: Explain virtual addresses, pages, page faults, stacks, heaps, file descriptors, and crash persistence.
---

Virtual memory gives a process an address space that the operating system maps to physical memory and other backing storage. A virtual address is not a direct promise that a particular physical RAM location is currently available.

## Pages and faults

Memory is managed in pages. Page tables map virtual pages to physical frames and record permissions. A translation lookaside buffer caches recent address translations. A page fault transfers control to the kernel when an access needs handling, such as allocating a demand-zero page or loading data from storage.

Not every page fault reads a disk. A minor fault can resolve without that I/O. Under memory pressure, reclaim and paging can increase latency. If the environment cannot satisfy memory demand, it may reject allocation or terminate a process.

## Stack, heap, and resident memory

A stack holds call frames and execution-related values. A heap supports objects whose lifetime is managed separately from one call frame. Exact placement and optimization depend on the language and runtime.

| Measurement  | Meaning                                                           |
| ------------ | ----------------------------------------------------------------- |
| Virtual size | Address space mapped or reserved by the process                   |
| Resident set | Pages currently resident in physical memory                       |
| Managed heap | Memory governed by the language runtime's allocator and collector |

A Java process also needs thread stacks, code cache, class metadata, direct buffers, and runtime-native allocations. A healthy heap chart does not prove the process fits its container limit.

## Files and persistence

A file descriptor is a process-local handle to an open resource, including a file, socket, or pipe. Leaking descriptors can prevent new connections even while memory remains available. Memory-mapped files expose file-backed pages through the address space.

A successful buffered write can mean the kernel accepted bytes, not that storage has persisted them. APIs such as `fsync` request the relevant persistence work, within filesystem and storage guarantees. Databases coordinate these operations through their durability design.

Disk capacity, memory capacity, and durable commit are different properties. A database running out of log space and a service leaking sockets need different responses.

Connect this to [JVM memory](/java-spring/jvm-internals/), [database recovery](/databases/migrations-and-recovery/), and [container limits](/engineering/containers-and-kubernetes/).

## Sources

- [Linux man-pages: mmap](https://man7.org/linux/man-pages/man2/mmap.2.html)
- [Linux man-pages: fsync](https://man7.org/linux/man-pages/man2/fsync.2.html)
- [Linux man-pages: proc process status](https://man7.org/linux/man-pages/man5/proc_pid_status.5.html)
- [Operating Systems: Three Easy Pieces, address spaces](https://pages.cs.wisc.edu/~remzi/OSTEP/vm-intro.pdf)
