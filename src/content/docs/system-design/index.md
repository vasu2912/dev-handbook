---
title: System design
description: A practical guide to capacity, state, communication, and failure in backend systems.
sidebar:
  order: 1
---

System design is the work of choosing where state lives, how work moves, and what happens when a dependency is slow or unavailable. These pages build that model from first principles.

## A useful reading path

Start with [performance and scalability](/system-design/performance-and-scalability/), then compare [latency and throughput](/system-design/latency-and-throughput/). Next, study [availability and consistency](/system-design/availability-and-consistency/) and the [consistency patterns](/system-design/consistency-patterns/) that make those guarantees concrete.

The remaining pages describe the building blocks you combine in a request path:

- [Availability patterns](/system-design/availability-patterns/), [DNS](/system-design/dns/), [CDNs](/system-design/cdn/), [load balancing](/system-design/load-balancing/), and [reverse proxies](/system-design/reverse-proxy/) shape traffic at the edge.
- [The application layer](/system-design/application-layer/) organizes compute and service discovery.
- [Databases](/system-design/databases/) and [caching](/system-design/caching/) store and retrieve state.
- [Asynchronous processing](/system-design/asynchronous-processing/) separates slow work from the user request.
- [Communication protocols](/system-design/communication-protocols/) describe HTTP, TCP, UDP, RPC, REST, and real-time connections.
- [Real-time backends](/system-design/real-time-backends/) explain polling, SSE, WebSockets, reconnection, fan-out, and connection limits.
- [Rate limiting](/system-design/rate-limiting/) controls admission and permits bounded bursts.
- [Security](/system-design/security-overview/) treats every layer as part of the defense.

## Start with one request

Describe one user action and its result. Include expected traffic, the data that changes, and the time the user can wait.

For `POST /uploads`, that might mean 500 requests per second at peak, files up to 50 MB, a response within 300 ms, and processing that can finish later. Those facts rule out some designs before you draw a box.

## Name the modules

Give each module a small interface and a clear owner.

```text
client -> edge -> upload API -> object store
                         \\-> job queue -> processor -> metadata store
```

The upload API accepts the request and records intent. The object store owns file bytes. The queue separates the user response from processing time. The metadata store records state that the product can query.

## Ask what can fail

For every dependency, ask what a slow response, a timeout, a duplicate message, and a total outage mean. Then decide whether to retry, fail, queue, or return a partial result.

The right answer depends on the operation. Retrying a read may be harmless. Retrying a charge can create a second payment unless the operation has an idempotency key.

For a deeper view of a single request, continue to the [backend request lifecycle](/backend/architecture/request-lifecycle/). For interface choices, see [API design](/backend/api-design/).
