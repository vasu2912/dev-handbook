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

<div data-anatomy="system-design--performance-and-scalability-1"></div>

Scalability does not mean that latency never rises. Every design has a saturation point. The useful question is how much load the system handles before a bottleneck makes latency unacceptable, and how predictably more capacity moves that point.

Common levers include reducing work per request, caching repeated reads, adding replicas, partitioning data, and moving slow work to a queue. Each lever changes consistency, cost, or operational complexity. Measure the current bottleneck before adding one.

For the relationship between response time and completed work, read [latency and throughput](/system-design/latency-and-throughput/). [Load balancing](/system-design/load-balancing/) and [database scaling](/system-design/databases/) show two common ways to add capacity.

## Further reading

- [A word on scalability](http://www.allthingsdistributed.com/2006/03/a_word_on_scalability.html)
- [Scalability, availability, stability, patterns](http://www.slideshare.net/jboner/scalability-availability-stability-patterns/)
