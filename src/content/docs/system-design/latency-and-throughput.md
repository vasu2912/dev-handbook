---
title: Latency and throughput
description: Use response time and completed work together when sizing a system.
sidebar:
  order: 3
---

Latency is the time required to perform an action or produce a result. Throughput is the number of actions or results completed per unit of time.

A good design aims for the highest throughput that keeps latency within the product's limit. Maximizing only one is usually a mistake. A batch processor may accept higher latency to increase throughput. An interactive request needs a tight latency target even when its throughput is modest.

<div data-anatomy="system-design--latency-and-throughput-1"></div>

As utilization approaches capacity, requests wait for CPU, connections, disk, or another finite resource. That queueing delay creates the sharp rise often called the knee of the curve. Leave headroom for bursts and failures instead of operating at the knee.

Measure latency with percentiles. An average can hide the slow requests that users experience. Track a target such as p95 or p99 alongside throughput, error rate, and resource utilization.

The [cache](/system-design/caching/) and [communication protocols](/system-design/communication-protocols/) pages describe ways to reduce work and network delay. See [latency numbers](https://gist.github.com/jboner/2841832) for rough baseline comparisons.

## Further reading

- [Understanding latency vs throughput](https://community.cadence.com/cadence_blogs_8/b/fv/posts/understanding-latency-vs-throughput)
