---
title: Service boundaries and architecture styles
description: Compare monoliths, modular monoliths, and microservices by ownership, deployment, and failure behavior.
---

A service boundary assigns responsibility for a capability and its data. Inventory decides whether stock can be reserved. Orders asks Inventory through a contract instead of updating Inventory's tables.

## Architecture styles

| Style            | Deployment                                      | Main benefit                                     | Main cost                                                 |
| ---------------- | ----------------------------------------------- | ------------------------------------------------ | --------------------------------------------------------- |
| Monolith         | One application                                 | Local calls and transactions are straightforward | Uncontrolled dependencies can make changes spread         |
| Modular monolith | One application with enforced module boundaries | Clear ownership with local execution             | Modules still share a deployment and runtime              |
| Microservices    | Independently deployed services                 | Independent delivery, scaling, and ownership     | Network failures, distributed state, and operational work |

Size alone does not determine the style. Ten small applications that require simultaneous releases behave like a distributed monolith.

## Boundaries follow business decisions

Domain-driven design uses a **bounded context** for a model with consistent meanings. A product in Catalog describes something for sale. A product in Fulfillment describes something that must be picked and shipped. The identifiers can connect those models without forcing one shared object definition.

Separate services when ownership, release schedules, scaling, or isolation justify the boundary. Splitting controllers, services, and repositories into network services usually creates chatty technical layers without independent business ownership.

## Data ownership

Database per service means exclusive ownership of writes and schema evolution. It does not necessarily mean a separate database server for every service. Shared infrastructure can still provide separate schemas and credentials, although resource contention remains shared.

Cross-service joins become API composition or maintained read models. If checkout needs an atomic invariant across stock and orders, either keep that invariant in one owner or design an explicit distributed workflow.

## Failure and coupling

Suppose checkout calls five services sequentially. Its response time includes every wait, and a required dependency can prevent checkout from completing. Asynchronous communication removes some waiting but introduces pending state, duplicates, and delayed visibility.

Measure coupling through change: if a small feature requires coordinated releases across six services, revisit the contracts and boundaries. A modular monolith is often a useful starting point when the domain is still changing.

Continue with [discovery and communication](/microservices/discovery-and-gateways/) and [sagas](/microservices/sagas/).

## Sources

- [Martin Fowler: microservices](https://martinfowler.com/articles/microservices.html)
- [Microsoft: domain analysis for microservices](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis)
