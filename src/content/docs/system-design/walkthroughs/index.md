---
title: System design walkthroughs
description: Worked designs that apply the system design method to common storage, data, and scaling problems.
sidebar:
  order: 0
---

These walkthroughs use the same sequence: define the requirements, sketch the main modules, choose data flows, and scale the bottleneck that measurements expose.

## Choose a problem shape

### Store and serve user content

[Design a paste-sharing service](/system-design/walkthroughs/pastebin/) covers short links, object storage, expiration, analytics, and read-heavy traffic.

### Fan out a feed and index search

[Design a social feed](/system-design/walkthroughs/social-feed/) covers timelines, follower fan-out, search indexing, notifications, and celebrity accounts.

### Crawl, deduplicate, and search documents

[Design a web crawler](/system-design/walkthroughs/web-crawler/) covers crawl queues, content signatures, freshness, reverse indexes, and bandwidth limits.

### Ingest transactions and compute aggregates

[Design a personal finance service](/system-design/walkthroughs/mint/) covers encrypted external credentials, asynchronous extraction, categorization, and batch spending totals.

### Traverse a graph spread across machines

[Design a social graph](/system-design/walkthroughs/social-graph/) covers breadth-first search, shard lookup, cache placement, and reducing machine-to-machine hops.

### Cache a hot read path

[Design a query cache](/system-design/walkthroughs/query-cache/) covers cache-aside reads, LRU eviction, consistent hashing, and cache update rules. Continue with [caching](/system-design/caching/).

### Rank records from event logs

[Design a sales-rank service](/system-design/walkthroughs/sales-rank/) covers MapReduce aggregation, distributed sorting, time windows, and read-heavy serving.

### Scale infrastructure in measured steps

[Scale a service on AWS](/system-design/walkthroughs/scaling-on-aws/) follows a service from one machine through load balancing, replicas, caching, and autoscaling. See [load balancing](/system-design/load-balancing/) for the shared concepts.

### Model a small domain with classes

[Object-oriented design](/system-design/walkthroughs/object-oriented-design/) covers class relationships, method responsibilities, and data structures for common domain models.

## Related foundations

Use the [design method](/system-design/design-method/) to structure a new problem. Review [databases](/system-design/databases/), [the API design guide](/backend/api-design/), [concurrency](/backend/concurrency/), and the [system design glossary](/reference/system-design-glossary/) when a walkthrough introduces those topics.
