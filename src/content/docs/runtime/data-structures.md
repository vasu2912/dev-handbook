---
title: Data structures and complexity
description: Connect arrays, linked lists, maps, trees, heaps, graphs, and probabilistic filters to backend access patterns.
---

A data structure chooses which operations are cheap and which are expensive. Describe the operation and assumptions before quoting a complexity bound. Hash lookup with a suitable hash distribution is different from a worst-case guarantee.

## Common structures

| Structure            | Typical cost                                                 | Useful property                                      |
| -------------------- | ------------------------------------------------------------ | ---------------------------------------------------- |
| Dynamic array        | Index O(1), append amortized O(1), middle insert O(n)        | Compact storage and iteration locality               |
| Linked list          | O(1) insertion with the required node reference, search O(n) | Links can change without shifting all later elements |
| Hash table           | Expected O(1) lookup and update under suitable assumptions   | Direct access by key                                 |
| Balanced search tree | O(log n) lookup and update                                   | Sorted keys and range operations                     |
| Binary heap          | Peek O(1), insert and remove extremum O(log n)               | Priority scheduling and top-k selection              |
| Trie                 | Lookup proportional to key length                            | Prefix lookup, with memory overhead                  |

Finding a linked-list insertion position is still O(n) without a reference or another index. A heap does not make arbitrary-element search O(log n).

Stacks are last-in, first-out and model nested work. Queues are first-in, first-out and model waiting work. A deque supports both ends. Bounded queues are also capacity controls, which matters for [backpressure](/microservices/bulkheads/).

## Complexity vocabulary

Big O describes an asymptotic upper bound. Big Theta describes a tight bound. Worst-case, expected, and amortized costs answer different questions. An amortized constant-time append can still trigger an individual O(n) resize.

Space complexity includes auxiliary structures and recursion depth. A linear-time traversal with a queue containing half the graph can use substantial memory. Constant factors, allocation, and CPU cache behavior matter in actual services.

## Graphs and probabilistic structures

An adjacency list uses O(V + E) space and supports iterating a vertex's neighbors. An adjacency matrix uses O(V²) space but gives constant-time edge-presence checks. The graph's density and required operations determine the fit.

A Bloom filter can report that an item might exist or definitely does not exist, within its intended insertion-only model. False positives trigger extra lookups. Incorrect deletion from a basic Bloom filter can introduce false negatives. It cannot replace an authoritative unique constraint.

Connect the structures to [Java collections](/java-spring/collections-internals/), [database indexes](/databases/indexes-and-query-plans/), and [algorithm patterns](/runtime/algorithms/).

## Sources

- [MIT: Introduction to Algorithms lecture notes](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/pages/lecture-notes/)
- [Open Data Structures](https://opendatastructures.org/)
- [Redis: Bloom filter](https://redis.io/docs/latest/develop/data-types/probabilistic/bloom-filter/)
