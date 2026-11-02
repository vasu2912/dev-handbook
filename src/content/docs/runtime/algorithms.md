---
title: Algorithm patterns
description: Explain search, sorting, traversal, two pointers, sliding windows, greedy decisions, and dynamic programming.
---

An algorithm pattern becomes useful when its assumptions match the problem. Start with the required result, the invariant that must remain true, and the work each step removes.

## Search and sorting

Binary search repeatedly discards half a sorted search space. A related form finds the boundary of a monotonic predicate, such as the smallest capacity that meets a deadline. State whether the bounds are inclusive and prove that every iteration reduces the interval.

Comparison sorting has an Ω(n log n) worst-case lower bound in the general comparison model. Merge sort provides O(n log n) time with common array implementations using O(n) auxiliary space. Quicksort has expected O(n log n) time under appropriate pivot assumptions but O(n²) worst cases. Stability preserves the relative order of equal keys.

## Sequence patterns

Two pointers track positions whose movement follows an invariant. With sorted numbers, a sum below the target can justify moving the lower pointer forward. Without sorted order, that reasoning fails.

A sliding window maintains a contiguous region and its summary. Counting character frequencies can avoid recomputing the entire window after each move. A variable-size sum window relying on nonnegative values can fail when negative values break monotonicity.

Prefix sums answer range-sum queries after preprocessing. Hashing previously seen prefix sums supports other subarray conditions. Specify whether the output needs values, positions, counts, or all matches because those choices change storage.

## Graph traversal

Breadth-first search uses a queue and finds shortest path lengths in an unweighted graph. Depth-first search uses a stack or recursion and supports reachability and cycle reasoning. Both run in O(V + E) with adjacency lists when each vertex and edge is processed a bounded number of times.

Dijkstra's algorithm handles nonnegative edge weights. Negative edges invalidate its usual finalization argument. Topological ordering applies to directed acyclic graphs and expresses dependency order.

## Choosing among possibilities

Greedy algorithms commit to local choices. They need a correctness argument, often an exchange argument, that a chosen step can belong to an optimal solution. A plausible rule is not proof.

Dynamic programming identifies states, transitions, base cases, and an evaluation order for overlapping subproblems. Memoization computes reachable states on demand. Tabulation fills states in dependency order. Complexity follows the number of states multiplied by transition work.

Backtracking explores choices and reverses them when returning. Pruning reduces work only when a condition proves that an unfinished branch cannot contribute a needed result.

Read [data structures](/runtime/data-structures/) for the costs underlying each implementation.

## Sources

- [MIT: Introduction to Algorithms lecture notes](https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-spring-2020/pages/lecture-notes/)
- [Princeton: Algorithms overview and materials](https://algs4.cs.princeton.edu/home/)
