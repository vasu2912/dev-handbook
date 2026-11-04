---
title: Microservices study notes
description: A reading path through service boundaries, communication, resilience, and data across services, told through one checkout flow.
---

These notes are for engineers who can build a backend service and now need to design several that work together, at work or in a system design interview. By the end you'll be able to draw service boundaries, keep calls between services from cascading into outages, and keep data correct when no single transaction covers it.

Every article follows the same online store. When a customer checks out, **Orders** records the order, **Inventory** reserves stock, and **Payments** charges the card. Each service owns its own database, so the three steps can't share one transaction. [Figure](#fig-checkout-map) shows the services and how they connect.

```mermaid #fig-checkout-map The checkout flow used throughout these notes. Orders calls Inventory and Payments synchronously, then publishes OrderPlaced for Fulfillment.
flowchart LR
  C[Customer] --> GW[API gateway]
  GW --> O[Orders]
  O --> I[Inventory]
  O --> P[Payments]
  O -->|OrderPlaced| K[Message broker]
  K --> F[Fulfillment]
```

## The reading path

Read in this order. Each article builds on the ones before it.

### Drawing the system

1. [Service boundaries and architecture styles](/microservices/service-boundaries/). Decide where one service ends and the next begins, and when a modular monolith is the better answer. Everything else depends on these lines.
2. [Discovery, gateways, and communication](/microservices/discovery-and-gateways/). Follow a request from the internet to the right instance, and choose HTTP, gRPC, or messaging for each call.

### Surviving failures on the request path

3. [Timeouts, retries, and fallbacks](/microservices/timeouts-and-retries/). The first defense: stop waiting, retry only what's safe, and degrade honestly.
4. [Circuit breakers](/microservices/circuit-breakers/). Stop calling a dependency that is clearly failing, with complete Java and Spring Boot examples.
5. [Bulkheads and backpressure](/microservices/bulkheads/). Keep one slow dependency from using up every thread.

These three solve different problems. **Timeouts bound one wait, breakers decide whether to call at all, and bulkheads cap how many calls run at once.** Production calls usually use all three.

### Keeping data correct across services

6. [Sagas and distributed transactions](/microservices/sagas/). Replace one transaction with steps and compensations, as checkout needs.
7. [Outbox, delivery, and deduplication](/microservices/outbox-and-delivery/). Never lose an event, and make duplicates harmless.
8. [Kafka and message brokers](/microservices/message-brokers/). Partitions, consumer groups, offsets, and replay, well enough to design with.
9. [CQRS and event sourcing](/microservices/cqrs-and-event-sourcing/). Separate read models from write models, and store history as events when history matters.
10. [Distributed locks and fencing](/microservices/distributed-locks/). Let one worker act at a time without trusting an expired lock.

### Getting there from a monolith

11. [Migrating a monolith](/microservices/migration/). Move capabilities out one at a time, including their data, with every step reversible.

## If you're short on time

Read service boundaries, timeouts and retries, sagas, and the outbox. Those four cover the questions interviewers ask most often about microservices: where to split, what happens when a call fails, how to keep a multi-service workflow correct, and how to publish events without losing them.

## Next step

Start with [service boundaries](/microservices/service-boundaries/). For the foundations these notes build on, see [consistency patterns](/system-design/consistency-patterns/), [load balancing](/system-design/load-balancing/), and [observability](/engineering/observability/).
