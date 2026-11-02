---
title: JVM internals and garbage collection
description: Follow class loading, runtime memory, interpretation, JIT compilation, reachability, and production diagnostics.
---

Java source compiles into class files containing bytecode and metadata. A JVM loads classes, verifies their structure, links references, initializes classes when required, and executes code. The JVM specification defines behavior without requiring every implementation to use identical memory layouts or collectors.

## Class loading and execution

A class is identified by its binary name and defining class loader. Two loaders can define classes with the same name that are not assignment-compatible. Loading, linking, and initialization are different stages. Initialization can execute static field initializers and static blocks, and failure can leave the class unusable in that loader.

HotSpot commonly begins execution through interpretation and compiles frequently executed code using just-in-time compilation. Profiling supports inlining and other optimizations. If assumptions change, deoptimization can return execution to a less optimized form.

This explains why startup performance and warmed-up throughput differ. A small loop measured without a proper benchmark harness can measure dead-code elimination or compilation effects rather than the intended operation.

## Memory areas

| Area                | Main contents                                                     |
| ------------------- | ----------------------------------------------------------------- |
| Heap                | Managed objects and arrays                                        |
| Thread stacks       | Method frames, local values, and operand state                    |
| Class metadata      | Loaded-class structures, implemented in HotSpot through metaspace |
| Code cache          | Compiled machine code                                             |
| Other native memory | Direct buffers and runtime or library allocations                 |

`-Xmx` bounds the Java heap, not total process memory. A container can terminate the process even when heap use is below that limit. Excessive recursion can exhaust a thread's stack independently of heap capacity.

## Reachability and collection

Collectors determine which objects remain reachable from roots such as live thread state and static references. Cycles are collectable when unreachable. A memory leak in Java often consists of unwanted objects that remain reachable through a cache, listener, thread-local value, or collection.

Generational collection exploits the tendency of many allocations to die young. Collector designs balance pause time, throughput, memory overhead, and concurrent work. G1 and ZGC make different tradeoffs, and collector behavior changes across JDK versions. No collector guarantees zero pauses or unlimited allocation.

## Diagnosing symptoms

A thread dump shows execution and wait states. A heap dump supports retained-object analysis. Garbage-collection logs describe collection activity. Java Flight Recorder captures runtime events with configurable overhead. Each answers a different question.

Increasing heap size can reduce collection frequency while hiding a growing retained set. Compare allocation rate, post-collection live size, pauses, native memory, CPU, and application latency before tuning flags.

## Sources

- [JVM specification: runtime structure](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-2.html)
- [JVM specification: loading, linking, and initialization](https://docs.oracle.com/javase/specs/jvms/se21/html/jvms-5.html)
- [Java 21: garbage collection tuning](https://docs.oracle.com/en/java/javase/21/gctuning/)
- [OpenJDK JMH](https://github.com/openjdk/jmh)
