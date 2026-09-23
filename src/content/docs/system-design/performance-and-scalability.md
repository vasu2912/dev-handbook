---
title: Performance and scalability
description: Distinguish a slow system from a system that slows down as load grows.
sidebar:
  order: 2
---

A service is scalable when adding resources increases its capacity in proportion to the resources added. Capacity can mean more units of work, or larger units of work as data grows. [A word on scalability](http://www.allthingsdistributed.com/2006/03/a_word_on_scalability.html) gives the original framing.

Performance and scalability describe different failures:

- A performance problem makes the system slow for one user or one request.
- A scalability problem leaves one request fast but makes requests slow under heavy load.

<svg role="img" aria-label="A comparison of latency as load increases for scalable and non-scalable systems" viewBox="0 0 600 300" xmlns="http://www.w3.org/2000/svg" style="max-width:100%;height:auto;font-family:-apple-system,'Segoe UI',sans-serif;margin:20px 0"><rect width="600" height="300" fill="var(--diagram-bg)" rx="8"/><line x1="60" y1="240" x2="540" y2="240" stroke="var(--diagram-muted)" stroke-width="2"/><line x1="60" y1="240" x2="60" y2="40" stroke="var(--diagram-muted)" stroke-width="2"/><text x="300" y="280" font-size="14" font-weight="600" fill="var(--diagram-ink)" text-anchor="middle">Load (concurrent users or requests per second)</text><text x="30" y="140" font-size="14" font-weight="600" fill="var(--diagram-ink)" text-anchor="middle" transform="rotate(-90 30 140)">Latency</text><path d="M60 210 Q300 210 350 180 T400 60" fill="none" stroke="var(--diagram-red)" stroke-width="3" stroke-linecap="round"/><text x="410" y="70" font-size="12" font-weight="700" fill="var(--diagram-red-text)">Non-scalable</text><text x="410" y="90" font-size="11" fill="var(--diagram-red-text)">Bottleneck reached</text><path d="M60 210 L520 210" fill="none" stroke="var(--diagram-green)" stroke-width="3" stroke-linecap="round"/><text x="450" y="195" font-size="12" font-weight="700" fill="var(--diagram-green)">Scalable</text><text x="450" y="235" font-size="11" fill="var(--diagram-green)">Resources added</text><line x1="330" y1="240" x2="330" y2="190" stroke="var(--diagram-border)" stroke-width="2" stroke-dasharray="4"/><text x="330" y="260" font-size="11" font-weight="600" fill="var(--diagram-muted)" text-anchor="middle">Saturation</text></svg>

Scalability does not mean that latency never rises. Every design has a saturation point. The useful question is how much load the system handles before a bottleneck makes latency unacceptable, and how predictably more capacity moves that point.

Common levers include reducing work per request, caching repeated reads, adding replicas, partitioning data, and moving slow work to a queue. Each lever changes consistency, cost, or operational complexity. Measure the current bottleneck before adding one.

For the relationship between response time and completed work, read [latency and throughput](/system-design/latency-and-throughput/). [Load balancing](/system-design/load-balancing/) and [database scaling](/system-design/databases/) show two common ways to add capacity.

## Further reading

- [A word on scalability](http://www.allthingsdistributed.com/2006/03/a_word_on_scalability.html)
- [Scalability, availability, stability, patterns](http://www.slideshare.net/jboner/scalability-availability-stability-patterns/)
