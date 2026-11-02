---
title: Microservices study notes
description: Service boundaries, communication, resilience, distributed data, and migration explained through one order flow.
---

Microservices divide an application into services that can change and deploy independently. Each remote boundary introduces latency, partial failure, and coordination work. The useful starting point is the business responsibility each service owns.

Consider checkout: Orders records an order, Inventory reserves stock, and Payments authorizes a charge. Those steps cannot rely on one ordinary database transaction when each service owns its database.

## Boundaries and communication

- [Service boundaries and architecture styles](/microservices/service-boundaries/) explains monoliths, modular monoliths, and independently deployed services.
- [Discovery, gateways, and communication](/microservices/discovery-and-gateways/) follows a request through routing, REST, gRPC, and messaging.
- [Migrating a monolith](/microservices/migration/) explains incremental extraction and compatibility.

## Resilience on the request path

- [Circuit breakers](/microservices/circuit-breakers/) tracks dependency outcomes and temporarily rejects calls.
- [Timeouts, retries, and fallbacks](/microservices/timeouts-and-retries/) bounds waiting and repeated work.
- [Bulkheads and backpressure](/microservices/bulkheads/) limits resource consumption before an outage spreads.

These mechanisms solve different problems. A breaker can reject calls to a failing provider while a bulkhead limits concurrent calls to a healthy but overloaded provider.

## State across services

- [Sagas and distributed transactions](/microservices/sagas/) coordinates committed steps and compensation.
- [Outbox, delivery, and deduplication](/microservices/outbox-and-delivery/) follows messages through crash windows.
- [CQRS and event sourcing](/microservices/cqrs-and-event-sourcing/) separates read models from write models and explains event history.
- [Distributed locks and fencing](/microservices/distributed-locks/) distinguishes temporary ownership from permission to modify data.
- [Kafka and message brokers](/microservices/message-brokers/) explains partitions, consumer groups, acknowledgments, and replay.

For the foundations, connect these notes to [consistency patterns](/system-design/consistency-patterns/), [load balancing](/system-design/load-balancing/), and [observability](/engineering/observability/).
