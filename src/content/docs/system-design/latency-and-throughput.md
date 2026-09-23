---
title: Latency and throughput
description: Use response time and completed work together when sizing a system.
sidebar:
  order: 3
---

Latency is the time required to perform an action or produce a result. Throughput is the number of actions or results completed per unit of time.

A good design aims for the highest throughput that keeps latency within the product's limit. Maximizing only one is usually a mistake. A batch processor may accept higher latency to increase throughput. An interactive request needs a tight latency target even when its throughput is modest.

<svg role="img" aria-label="A throughput curve showing latency rising sharply after a knee point and reaching maximum capacity" viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:-apple-system,'Segoe UI',sans-serif;margin:20px 0"><rect width="600" height="300" fill="var(--diagram-bg)" rx="8"/><line x1="60" y1="240" x2="540" y2="240" stroke="var(--diagram-muted)" stroke-width="2"/><line x1="60" y1="240" x2="60" y2="40" stroke="var(--diagram-muted)" stroke-width="2"/><text x="300" y="280" font-size="14" font-weight="600" fill="var(--diagram-ink)" text-anchor="middle">Throughput (requests per second)</text><text x="30" y="140" font-size="14" font-weight="600" fill="var(--diagram-ink)" text-anchor="middle" transform="rotate(-90 30 140)">Latency</text><path d="M60 210 L350 210 Q420 210 450 60" fill="none" stroke="var(--diagram-accent)" stroke-width="3" stroke-linecap="round"/><circle cx="390" cy="188" r="5" fill="var(--diagram-red)"/><text x="400" y="195" font-size="12" font-weight="700" fill="var(--diagram-red-text)">Knee</text><text x="400" y="210" font-size="11" fill="var(--diagram-muted)">Queuing delays begin</text><line x1="470" y1="40" x2="470" y2="240" stroke="var(--diagram-border)" stroke-width="2" stroke-dasharray="4"/><text x="475" y="60" font-size="12" font-weight="700" fill="var(--diagram-muted)">Maximum capacity</text></svg>

As utilization approaches capacity, requests wait for CPU, connections, disk, or another finite resource. That queueing delay creates the sharp rise often called the knee of the curve. Leave headroom for bursts and failures instead of operating at the knee.

Measure latency with percentiles. An average can hide the slow requests that users experience. Track a target such as p95 or p99 alongside throughput, error rate, and resource utilization.

The [cache](/system-design/caching/) and [communication protocols](/system-design/communication-protocols/) pages describe ways to reduce work and network delay. See [latency numbers](https://gist.github.com/jboner/2841832) for rough baseline comparisons.

## Further reading

- [Understanding latency vs throughput](https://community.cadence.com/cadence_blogs_8/b/fv/posts/understanding-latency-vs-throughput)
