---
title: Migrating a monolith
description: Extract capabilities incrementally with a strangler facade, explicit data ownership, and compatible releases.
---

The strangler fig pattern replaces an existing system gradually. A routing layer sends selected operations to the replacement while the rest continue using the original application. Migration proceeds by capability rather than by rewriting every component first.

## Selecting an extraction

A useful candidate has clear ownership, a measurable reason to separate, and few synchronous dependencies. A reporting pipeline may need independent scaling. A payment integration may need a separate release schedule and tighter access controls.

Extracting a table-shaped CRUD service can leave business decisions split across applications. If every request returns to the monolith for several fine-grained calls, the new boundary adds latency without independence.

## Transitional architecture

```text
Client -> routing facade -> existing application
                        -> extracted capability
```

An anti-corruption layer translates the old model into the new model. For example, legacy numeric status codes become explicit payment states without spreading legacy codes into every new caller.

Data migration is usually harder than routing. Decide which system owns writes at every phase. A possible sequence is to backfill data, stream changes, verify convergence, and then transfer write ownership. The exact mechanism must handle concurrent updates and recovery. Uncoordinated writes to both stores recreate the dual-write problem.

## Compatibility and rollback

Deploy additive contracts before clients depend on them. Introduce new fields, update readers, migrate state, and remove old fields after old readers are retired. This is the expand-and-contract approach.

Shadow reads compare results without returning the replacement's response to users. Mirroring writes is more dangerous because it can duplicate external effects. Canary traffic exposes a small real workload, but a small percentage does not guarantee a representative mix.

Rollback includes state. Routing traffic back is insufficient if the new service wrote data the old version cannot interpret. State whether a rollback is still safe after each transition and how queued events are handled.

Microservices are a possible destination. Enforcing modules inside the existing application can solve coupling at lower operational cost. Compare [architecture styles](/microservices/service-boundaries/) before committing to extraction.

## Sources

- [Microsoft: Strangler Fig pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/strangler-fig)
- [Microsoft: Anti-Corruption Layer pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/anti-corruption-layer)
