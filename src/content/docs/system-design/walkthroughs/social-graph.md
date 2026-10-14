---
title: Design a social graph
description: A worked design for shortest-path queries across a sharded friendship graph.
sidebar:
  order: 5
---

## Define use cases and constraints

### Use cases (in scope)

- **User** searches for someone and sees the shortest path to that person.
- **Service** has high availability.

### Constraints and assumptions

- Traffic is not evenly distributed; some searches are popular, others run once.
- The graph does not fit on one machine; edges are unweighted.
- 100 million users, ~50 friends each → 5 billion friend relationships.
- 1 billion friend searches/month.

### Usage

- **400 searches/second**.

## Sketch the high-level design

![High-level social-graph architecture](/images/system-design/vector/social-graph-high-level.svg)

## Define the core components

Without the scale constraint, an unweighted shortest path is a plain **BFS**. At scale, users are [sharded](/system-design/databases/) across **Person Servers**, reached through a **Lookup Service**.

1. Client → Web Server → Search API → **User Graph Service**.
2. The User Graph Service uses the **Lookup Service** to find the **Person Server** holding a given `person_id`, then runs BFS using `friend_ids` as adjacent nodes.

:::tip[Key classes]
- `LookupService`: maps `person_id` → `person_server`.
- `PersonServer`: holds `{person_id: person}` for its shard.
- `Person`: `id`, `name`, `friend_ids`.
- `UserGraphService`: BFS from source to dest, tracking `prev_node_keys` and `visited_ids`.
:::

## Scale the design

![Scaled social-graph architecture](/images/system-design/vector/social-graph-scaled.svg)

:::caution[Iterate, do not jump]
Benchmark → profile → fix → repeat.
:::

- 400 reads/s → serve person data from a **memory cache**; helps repeat searches and well-connected people.
- Cache complete or partial BFS traversals; batch-compute offline and store in NoSQL.
- Reduce machine jumps by batching friend lookups on the same **Person Server**; shard by location.
- Run **two BFS searches** at once (source and destination) and merge paths.
- Start BFS from high-degree people (fewer degrees of separation).
- Set a hop/time limit before asking the user to continue.

## Additional talking points

- SQL scaling patterns and NoSQL: see [database](/system-design/databases/).
- A graph database (Neo4j) would be natural here if not for the constraint: see [graph database](/system-design/databases/#graph-databases).

---
