---
title: Java collections internals
description: Explain lists, hash maps, equality contracts, ordering, concurrent collections, and iteration behavior.
---

A collection's interface describes its operations. Its implementation determines ordering, synchronization, memory use, and performance. Choose based on the operations the application needs rather than one remembered complexity claim.

## Lists, sets, and queues

| Implementation  | Behavior                          | Important cost                             |
| --------------- | --------------------------------- | ------------------------------------------ |
| `ArrayList`     | Resizable indexed array           | Middle insertions move elements            |
| `LinkedList`    | Doubly linked nodes, also a deque | Finding a position traverses nodes         |
| `ArrayDeque`    | Resizable deque                   | Efficient end operations, no null elements |
| `HashSet`       | Unordered unique elements         | Depends on equality and hashing            |
| `TreeSet`       | Sorted unique elements            | Comparison defines ordering and uniqueness |
| `PriorityQueue` | Heap-based priority access        | Iteration is not sorted traversal          |

An unmodifiable view can reflect later changes to its backing collection. A copied unmodifiable collection separates the container structure but does not make mutable elements deeply immutable.

## HashMap mechanics

`HashMap` computes a bucket location from a key's hash and compares candidate keys with `equals`. Collisions place multiple entries in the same bucket. OpenJDK implementations can replace sufficiently populated buckets with tree structures under implementation-specific conditions. Those thresholds are not the `Map` interface contract.

Resizing allocates a larger table and redistributes entries. A suitable initial capacity reduces repeated resizing when the expected entry count is known. Overallocating also wastes memory and can increase traversal work.

Equal keys must have equal hash codes. Unequal keys can share a hash code. Mutating fields used by `equals` or `hashCode` after insertion can make a key effectively unreachable through ordinary lookup.

```java
record OrderKey(long tenantId, long orderId) {}

var statuses = new java.util.HashMap<OrderKey, String>();
statuses.put(new OrderKey(3, 42), "PENDING");
String status = statuses.get(new OrderKey(3, 42));
```

The record's value equality makes the two keys equivalent. The map remains unsynchronized.

## Ordering and concurrency

`LinkedHashMap` maintains an encounter order and can be configured for access order. `TreeMap` orders keys through comparison. A comparator inconsistent with equality can produce surprising set or map behavior.

`ConcurrentHashMap` supports concurrent access and atomic operations such as `putIfAbsent` and `compute`. A separate `containsKey` followed by `put` is still a compound race. Concurrent values stored inside the map need their own safety policy.

Fail-fast iteration detects some structural modifications on a best-effort basis. It is not a synchronization guarantee. Concurrent collections can provide weakly consistent iteration that tolerates updates without representing one atomic snapshot.

Read [data structures](/runtime/data-structures/) and [Java concurrency](/java-spring/concurrency-internals/) for the underlying tradeoffs.

## Sources

- [Java 21: HashMap](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/HashMap.html)
- [Java 21: Collections](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/Collections.html)
- [Java 21: ConcurrentHashMap](https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ConcurrentHashMap.html)
