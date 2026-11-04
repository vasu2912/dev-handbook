---
title: Migrating a monolith
description: Move capabilities out of a monolith one at a time, transfer data ownership without dual writes, and keep every step reversible.
---

Your store's monolith is eight years old. Payments needs its own release schedule and tighter access controls, and the payments team is tired of waiting on everyone else's deploys. Two years ago, a plan to rewrite the whole system as services stalled after a year: the old system kept changing while the new one tried to catch up.

**The strangler fig pattern replaces a system gradually.** A routing layer sends one capability at a time to new code while everything else keeps running in the old application. The name comes from a vine that grows around a tree until it can stand on its own.

The catch is that routing is the easy part. The hard part is moving the data, deciding who owns each write at every step, and keeping the ability to roll back. This article covers whether to migrate at all, what to extract first, how the strangler fig works, how to move data safely, and how to release each step.

## Should you migrate at all?

**Migrate to solve a specific problem, not to reach an architecture.** Good reasons are concrete: Payments must release independently, Search needs to scale separately, card data must be isolated to shrink the PCI DSS audit.

If the real problem is tangled code, enforcing [modules inside the monolith](/microservices/service-boundaries/) fixes it at much lower cost, without any network calls. Many migrations should stop there. Extract services only for the capabilities that need independence.

## Choosing a strategy

There are three ways teams attempt this.

### Naive approach: rewrite everything, then switch

**How it works.** Build the new system in parallel and cut over on one day.

**Where it breaks.** The old system keeps changing during the rewrite, so the new one chases a moving target. Nothing reaches production for a year or more, and the cutover risks everything at once. This is the approach that stalled.

### Better approach: extract the code, keep the shared database

**How it works.** Move Payments' code into a new service, but let it keep reading and writing the monolith's tables.

**Where it breaks.** The service and the monolith are still coupled through the schema. Neither can change a payments table without breaking the other. You've added a network hop without gaining independence.

### Strong approach: strangle one capability at a time, including its data

**How it works.** Put a routing layer in front, move one capability's behavior to a new service, then move ownership of its data, then delete the old code. Each step ships to production on its own and can be reversed.

**Where it breaks.** It takes longer to finish, and for months you run a transitional architecture with both systems live. That's the price of never betting everything on one cutover.

## The strangler fig

[Figure](#fig-strangler) shows the routing layer partway through a migration.

```mermaid #fig-strangler The strangler fig partway through a migration. A routing facade sends payments traffic to the new service and everything else to the monolith.
flowchart LR
  C[Clients] --> R[Routing facade]
  R -->|"/payments/**"| P[Payments service]
  R -->|everything else| M[Monolith]
```

1. Put a **routing facade** in front of the monolith. This can be your [API gateway](/microservices/discovery-and-gateways/) or a reverse proxy. At first it sends everything to the monolith.
2. Build the **Payments service** and route a small share of payments traffic to it.
3. Increase the share as confidence grows, until all `/payments/**` traffic goes to the new service.
4. Delete the payments code from the **monolith**.

Pick the first extraction carefully. A good candidate has **clear ownership, a measurable reason to move, and few synchronous calls back into the monolith**. A bad candidate needs ten calls into the monolith for every request; extracting it adds latency without independence.

## Keeping the new model clean

The monolith stores payment status as numeric codes: 3 means authorized, 7 means captured, 9 means "refunded, but only partially, unless it's a legacy order". If the new service adopts those codes, the old model spreads into every new caller.

An **anti-corruption layer** translates between the two models at the boundary, as [Figure](#fig-anti-corruption) shows.

```mermaid #fig-anti-corruption An anti-corruption layer. It translates between the new service's model and the monolith's legacy codes, so neither leaks into the other.
flowchart LR
  P[Payments service] --> ACL[Anti-corruption layer]
  ACL --> M[Monolith]
```

The new service works with clear states such as `AUTHORIZED` and `PARTIALLY_REFUNDED`. The layer converts them to and from the legacy codes. When the monolith's part is finally retired, the layer is deleted and the new model never had to change.

## Moving the data

**At every moment, exactly one system owns writes for each piece of data.** Moving that ownership is the riskiest part of a migration, so do it in the explicit phases of [Figure](#fig-data-ownership-phases).

```mermaid #fig-data-ownership-phases The phases of moving data ownership. Write ownership switches in step 4, and only after the copies are verified.
flowchart TD
  A["1. New service reads through the monolith"] --> B["2. Backfill and stream changes into the new store"]
  B --> C["3. Verify the copies match"]
  C --> D["4. Switch write ownership to the new service"]
  D --> E["5. Monolith reads through the new service"]
  E --> F["6. Remove the old tables"]
```

1. The new service starts by reading and writing **through the monolith's API**. The monolith still owns the data.
2. **Backfill** a copy of existing payments into the new store, then keep it current by streaming changes with change data capture.
3. **Verify** that the copies converge: compare row counts, checksums, and a sample of records.
4. **Switch writes** to the new service. From now on it owns the data.
5. Parts of the monolith that still need payment data **read through the new service's API**.
6. Once nothing reads the old tables, **remove them**.

**Never have application code write to both stores.** If it writes to the old table and the new store separately, a crash between the two writes leaves them disagreeing, and you can't tell which is right. That's the [dual-write problem](/microservices/outbox-and-delivery/). Streaming changes from one owner's log avoids it.

## Releasing each step safely

### Expand, then contract

Change contracts in steps that never break a running client:

1. **Expand:** add the new field or endpoint alongside the old one.
2. Update every reader to use the new one.
3. Migrate the data.
4. **Contract:** remove the old field after the last old reader is gone.

### Compare before you switch

**Shadow reads** send a copy of real read requests to the new service, compare its answers to the monolith's, and log differences without showing the new answers to users. It's a safe way to find mismatches with production data.

Mirroring writes is far more dangerous. A mirrored "capture payment" call charges the card twice. Only mirror writes into an isolated environment that can't cause external effects.

### Canary the traffic

Route 1% of traffic to the new path, then 5%, 25%, and 100%, watching error rates and latency at each step. A small percentage may not include rare cases, such as refunds on legacy orders, so check that the canary covers the cases you care about.

### Know whether you can still roll back

**Rollback includes data, not just routing.** Routing traffic back to the monolith is easy. But if the new service has written payments in a form the monolith can't read, rolling back loses them. For each phase, write down whether rollback is still safe and what happens to messages already queued. After step 4 above, rollback usually means streaming data back the other way.

## Common problems

### The migration never finishes

Extractions stall at 90%, and both systems stay live for years. Set a deadline for removing the old code path as part of each extraction, and count "old code deleted" as the definition of done.

### Every request goes back to the monolith

The new service calls the monolith several times per request because its data or rules still live there. Move those rules with the service, or choose a different capability to extract.

### Hidden consumers of the old tables

A reporting job nobody remembered still queries the payments tables directly. Find every reader before removing tables. Database query logs and revoking the old credentials in a test environment both help.

## In interviews

### When to bring it up

Bring up the strangler fig when the problem starts from an existing monolith, or when an interviewer asks how you'd get from today's system to your design. It shows you can deliver change safely, not just draw the end state.

### How to introduce it

1. **State the reason.** "Payments needs independent releases and PCI isolation, so it goes first."
2. **Route incrementally.** "A gateway routes /payments to the new service, starting at 1% of traffic."
3. **Move the data in phases.** "We backfill, stream changes with CDC, verify, then switch write ownership. No dual writes."
4. **Plan rollback.** "Until writes switch, rollback is a routing change. After that, we stream changes back to the old store."

:::tip[In an interview]
Interviewers often ask about the data, not the routing. Saying who owns writes at each phase, and why there are no dual writes, is what separates a strong answer.
:::

## Summary

A monolith migration moves one capability at a time behind a routing layer, so the old system keeps running while the new one takes over.

The trade-off is safety against speed: every step is small and reversible, at the cost of running a transitional architecture for months.

In an interview, bring up the strangler fig whenever you start from an existing system, and explain the routing, the data ownership phases, and how each step rolls back.

Don't rewrite everything at once, and don't let two systems write the same data. Move ownership deliberately, one capability at a time.

## Sources

- [Microsoft: Strangler Fig pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/strangler-fig)
- [Microsoft: Anti-Corruption Layer pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/anti-corruption-layer)
