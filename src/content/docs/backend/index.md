---
title: Backend foundations
description: Understand how requests move through an application, how APIs expose resources, and how concurrent work behaves.
sidebar:
  order: 1
---

Backend code turns an incoming request into a result. The useful design questions are concrete: where do we validate input, where do business rules live, who owns a query, what does a retry do, and what happens when work waits or races?

This section builds that model in three connected parts:

- [Architecture](/backend/architecture/) follows a request through routing, handlers, services, repositories, middleware, and request context.
- [API design](/backend/api-design/) covers resource URLs, HTTP methods, CRUD responses, list queries, and consistency.
- [Concurrency](/backend/concurrency/) explains threads, event loops, goroutines, and the races caused by shared mutable state.

## Follow one request

Start with [the request lifecycle](/backend/architecture/request-lifecycle/). It gives the whole path before the individual pages explain each seam. Then read [handlers and controllers](/backend/architecture/handlers-and-controllers/), [services](/backend/architecture/services/), and [repositories](/backend/architecture/repositories/).

The layers are a design pattern, not a law. A small application may keep two layers together. Add a seam when it hides real complexity or gives tests and callers a simpler interface.

## Choose an interface before an implementation

Read [API design](/backend/api-design/) after the lifecycle. An HTTP interface names resources, defines method semantics, and gives clients stable success and error shapes. [URL design](/backend/api-design/url-design/) and [methods and idempotency](/backend/api-design/methods-and-idempotency/) are good starting points.

Storage and cache choices belong with their access patterns and consistency needs. See [databases](/system-design/databases/), [caching](/system-design/caching/), and [availability and consistency](/system-design/availability-and-consistency/) for the system-design view.

For live updates, read [real-time backends](/system-design/real-time-backends/). It connects the API write path to event delivery, persistent connections, reconnection, and multi-instance fan-out.

## Make waiting and shared state explicit

Most backend work waits on a database, another service, or a file. [Concurrency and parallelism](/backend/concurrency/concurrency-and-parallelism/) explains why that wait does not need to idle a CPU. Then compare [threads](/backend/concurrency/threads/), [the event loop](/backend/concurrency/event-loop/), and [goroutines](/backend/concurrency/goroutines/).

When tasks share mutable state, read [race conditions](/backend/concurrency/race-conditions/) before adding locks or channels. [Asynchronous processing](/system-design/asynchronous-processing/) covers work that should leave the request path entirely.
