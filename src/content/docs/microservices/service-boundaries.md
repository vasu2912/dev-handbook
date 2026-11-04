---
title: Service boundaries and architecture styles
description: Decide where one service ends and the next begins, and recognize when a modular monolith is the better answer.
---

Your online store started as one application. Twelve engineers now ship to it, and every release waits on a 40-minute test run. Last week a change to shipping rules broke checkout, because both live in the same codebase and read the same tables.

Splitting the application into services sounds like the fix. **A service boundary gives one team ownership of a business capability and the data behind it**, so the team can change and deploy that capability without coordinating with everyone else.

The catch is that every boundary turns a function call into a network call. A call that took nanoseconds now takes around half a millisecond inside one data center, and it can fail halfway. This article covers the three architecture styles, how to draw boundaries that hold up, who owns which data, and how to tell when a split made things worse.

## Three architecture styles

Most systems should start as a modular monolith and extract services only when a specific pressure demands it. The three styles sit on a line from "everything shared" to "everything separate", as [Figure](#fig-architecture-styles) shows.

```mermaid #fig-architecture-styles The three architecture styles. A monolith shares code and one schema, a modular monolith enforces module interfaces and separate schemas inside one deploy, and microservices separate both code and data behind the network.
flowchart LR
  subgraph Monolith
    M1[Orders code] --> MDB[(One schema)]
    M2[Inventory code] --> MDB
  end
  subgraph Modular monolith
    A1[Orders module] -->|public interface| A2[Inventory module]
    A1 --> ADB1[(orders schema)]
    A2 --> ADB2[(inventory schema)]
  end
  subgraph Microservices
    S1[Orders service] -->|HTTP or events| S2[Inventory service]
    S1 --> SDB1[(Orders DB)]
    S2 --> SDB2[(Inventory DB)]
  end
```

### Monolith

One deployable application with one database. Any code can call any other code and join any tables, and a single database transaction can cover the whole checkout.

The upside is speed of development and simple correctness: one transaction, one deploy, one place to debug. The downside is that nothing stops coupling. Without enforced boundaries, a large monolith drifts into code where every change can break something unrelated, and the whole application scales and deploys as one unit.

Use this when **the team is small and the domain is still taking shape**.

### Modular monolith

Still one deployable, but split into modules with enforced boundaries. Each module owns its tables and exposes a public interface. Other modules call that interface and never touch its tables. Tools such as Java's package visibility, Spring Modulith, or ArchUnit tests fail the build when a module reaches into another's internals.

You get clear ownership while keeping in-process calls and local transactions. Shopify is a well-known example: it chose to enforce modules inside its large Rails application rather than split it into services. The downside is that modules still share a deploy, a runtime, and a failure domain. A memory leak in one module takes down all of them.

Use this when **you want ownership boundaries but the domain still changes often**. Moving a boundary between modules is a refactor. Moving it between services is a migration.

### Microservices

Independently deployed services, each with its own data store, talking over the network. Orders calls Inventory over HTTP or gRPC, or reacts to its events.

Teams release on their own schedule, scale the parts that need it, and choose technology per service. The downside is everything the network brings: latency, partial failure, data spread across stores, and the operational cost of running many deployables.

Use this when **several teams need to release independently, or parts of the system have very different scaling, security, or failure-isolation needs**.

:::caution[Common mistake]
Size does not make something a microservice. Ten small services that must be released together are a distributed monolith: all the costs of the network with none of the independence.
:::

## Drawing boundaries that hold

**Boundaries follow business capabilities, not technical layers.** The test is whether one team can change a capability without asking another team to release.

Domain-driven design calls a capability with its own consistent vocabulary a **bounded context**. "Product" means something for sale in Catalog: a title, price, and photos. In Fulfillment it means a box with a weight and a warehouse bin. Each context keeps its own model and shares only the product ID, as in [Figure](#fig-bounded-contexts).

```mermaid #fig-bounded-contexts One word, two models. Catalog and Fulfillment each define a product for their own decisions and share only the product ID.
flowchart LR
  subgraph Catalog
    C["Product: title, price, photos"]
  end
  subgraph Fulfillment
    F["Product: weight, bin, dimensions"]
  end
  C -.-|shares only product_id| F
```

There are three common ways to cut a system. They go from easiest to draw to most likely to last.

### Naive approach: one service per technical layer

The first idea many teams try is to put the API layer, business logic, and data access in separate services.

**How it works.** A gateway service calls a "logic" service, which calls a "data" service that owns every table.

**Where it breaks.** Every feature touches every service, so every change needs coordinated releases. Each request also pays two extra network hops for no ownership benefit.

### Better approach: one service per entity

Create an Orders service, a Products service, and a Customers service, each wrapping one table group.

**How it works.** Each service offers create, read, update, and delete for its entity.

**Where it breaks.** Business processes cross entities. Checkout now calls Products, Customers, Inventory, and Orders in sequence, and the rules for "can this order be placed?" end up scattered across all of them. Services like these are thin wrappers around tables that still change together.

### Strong approach: one service per business capability

Cut along capabilities a team can own end to end: Catalog, Checkout, Payments, Fulfillment. Each owns the rules and data for its decisions.

**How it works.** Checkout decides whether an order can be placed. It asks Inventory to reserve stock and Payments to authorize a charge, but it never edits their data.

**Where it breaks.** You need real domain knowledge to find these lines, and the first cut is often wrong. A wrong service boundary costs a migration to move. This is the strongest reason to find boundaries inside a modular monolith first.

Melvin Conway observed in 1968 that systems mirror the communication structure of the organizations that build them. Boundaries that match team ownership survive. Boundaries that cut across a team's daily work get worked around.

The signals that justify extracting a capability:

- **Release cadence.** Pricing changes daily; tax rules change quarterly.
- **Scaling profile.** Catalog reads may outnumber checkout writes 100 to 1.
- **Isolation.** Keeping card handling in one small service shrinks the scope of a PCI DSS audit.
- **Failure containment.** A recommendations outage should not stop payments.

## Who owns the data

**Every piece of data has exactly one owner, and everyone else asks the owner.** Inventory owns stock levels. Orders never runs `UPDATE inventory SET ...`, even if it has the credentials.

"Database per service" means exclusive ownership of writes and schema changes. It does not require a separate database server per service. Separate schemas with separate credentials on a shared Postgres cluster satisfy it, although the services still compete for the same CPU and disk. In [Figure](#fig-data-ownership), Orders reaches stock only through Inventory's API.

```mermaid #fig-data-ownership Data ownership between Orders and Inventory. Orders changes stock only through Inventory's API; the dotted line is the direct access the rule forbids.
flowchart LR
  O[Orders service] --> ODB[(Orders DB)]
  I[Inventory service] --> IDB[(Inventory DB)]
  O -->|"POST /reservations"| I
  O -. "no direct reads or writes" .-> IDB
```

Two problems follow from this rule.

**Queries that used to be joins.** The order history page needs product names, which Catalog owns. You can call Catalog for each page (API composition), or keep a local copy of the fields you need, updated by Catalog's events. Often the business already wants a copy: an order should show the name and price at the time of purchase, not today's values.

**Rules that span owners.** "Never sell stock you don't have" involves Orders and Inventory. Either put the rule inside one owner (Inventory reserves atomically and Orders asks), or coordinate across owners with a [saga](/microservices/sagas/).

:::caution[Common mistake]
A shared database between services couples them through the schema. Inventory renames a column, and Orders breaks in production without either team changing an API.
:::

## The cost of a network boundary

[Figure](#fig-sequential-calls) shows checkout calling four services one after another.

```mermaid #fig-sequential-calls Checkout calling four services in sequence. Each call adds its latency to the total, and checkout fails if any one of them fails.
sequenceDiagram
  participant C as Checkout
  participant U as Customers
  participant I as Inventory
  participant P as Pricing
  participant Y as Payments
  C->>U: load customer
  C->>I: reserve stock
  C->>P: calculate total
  C->>Y: authorize payment
  Y-->>C: authorized
```

Latency adds up when calls are sequential. Availability multiplies:

```text
4 sequential calls × 30 ms                 = 120 ms before any local work
each dependency available 99.9% of the time
0.999 × 0.999 × 0.999 × 0.999              ≈ 99.6% for checkout
0.4% of a 730-hour month                   ≈ 2.9 hours of failed checkouts
```

One dependency at 99.9% fails about 44 minutes a month. Four required dependencies fail closer to three hours. **Every required synchronous dependency multiplies your failure rate.**

Three ways to pay less:

- **Call in parallel** when calls don't depend on each other. Total latency becomes the slowest call, not the sum.
- **Make dependencies optional.** If Recommendations fails, show the page without them.
- **Go asynchronous.** Orders can accept the order and let Fulfillment react to an `OrderPlaced` event later. The downside is new states the user can see ("payment pending"), duplicate events, and lag. See [discovery and communication](/microservices/discovery-and-gateways/) for the trade-offs.

There is also an operational bill. Each service needs its own pipeline, dashboards, alerts, on-call ownership, and a place in distributed traces. Ten services are ten of each.

## Common problems

### Distributed monolith

The services are separate on paper but must change and release together. Common causes are a shared database, a shared library that contains domain models, and synchronous call chains where every service needs every other.

You can detect it by counting coordinated releases. If most features need three services deployed in a specific order, the boundaries are wrong. Here's how to handle it:

- **Merge services** that always change together. Going back to a module is a valid fix.
- **Move the rule to one owner** instead of splitting it across callers.
- **Version contracts** so producers can release without waiting for consumers.

### Chatty services

Rendering one page takes 40 calls, usually because one service loops over items and calls another per item. Fix it with batch endpoints (`GET /products?ids=...`), coarser operations, or a local read model of the data you keep asking for.

### A boundary in the wrong place

If two services constantly exchange the same data to make one decision, the decision belongs in one of them. Move the data to the decision, or merge the services.

## In interviews

### When to bring it up

Bring up service boundaries when the problem mentions multiple teams, very different load per feature, or isolation needs such as payments. For a single small product, say you'd start with a modular monolith and name the signal that would make you split.

### How to introduce it

1. **Name the capabilities.** "I'd split this into Catalog, Checkout, Payments, and Fulfillment, because each has its own rules and changes on its own schedule."
2. **Assign data ownership.** "Inventory owns stock counts. Checkout asks Inventory to reserve; it never writes those tables."
3. **Pick sync or async per interaction.** "Checkout needs the payment result before it can confirm, so that call is synchronous. Fulfillment can react to an OrderPlaced event."
4. **Name the cost.** "Checkout now depends on Payments being up, so I'd add a timeout, a circuit breaker, and a pending state."

:::tip[In an interview]
Interviewers often ask why you didn't start with microservices. A good answer names a concrete pressure (team count, scaling difference, compliance) instead of "microservices scale better".
:::

## Summary

A service boundary is a decision about ownership: one team, one capability, one set of data.

The trade-off is independence against the network. You gain separate releases, scaling, and failure isolation, and you pay in latency, partial failure, distributed data, and operational work.

In an interview, bring up boundaries when there are several teams or very different scaling or isolation needs, and explain each split by its capability, its data, and its communication style.

Don't split by technical layer or by table. Split by business capability, and start with modules when you aren't sure where the lines are.

## Sources

- [Martin Fowler: microservices](https://martinfowler.com/articles/microservices.html)
- [Microsoft: domain analysis for microservices](https://learn.microsoft.com/en-us/azure/architecture/microservices/model/domain-analysis)
