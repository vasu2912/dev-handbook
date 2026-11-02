---
title: Database study notes
description: Relational modeling, SQL execution, transactions, indexing, migrations, recovery, and cache behavior.
---

Database preparation needs two views: the data model visible to an application and the execution behavior inside the database. A correct SQL statement can still be too expensive, and a fast statement can still violate a business invariant.

## Follow a write and a read

An order write checks constraints, changes rows, acquires locks, and eventually commits. A later query chooses an execution plan and reads a snapshot. A replica or cache may show an older value.

- [Schema design and SQL](/databases/schema-and-sql/) explains keys, normalization, joins, aggregation, and window functions.
- [Transactions, isolation, and locking](/databases/transactions-and-locking/) explains ACID, MVCC, concurrent decisions, and deadlocks.
- [Indexes and query execution](/databases/indexes-and-query-plans/) connects access patterns to indexes and execution plans.
- [Migrations, replication, and recovery](/databases/migrations-and-recovery/) explains safe change and what durability does not protect against.
- [Cache patterns and failure modes](/databases/cache-patterns/) covers stale reads, stampedes, eviction, and invalidation.

Examples use PostgreSQL semantics where database behavior differs. Isolation names, index options, and DDL behavior are not interchangeable across products.

## Connect storage to the application

Read [database architecture](/system-design/databases/) for relational and NoSQL choices, partitioning, and replication. Read [JPA entities](/java-spring/jpa-entities/), [queries and fetching](/java-spring/queries-fetching/), and [Spring transactions](/java-spring/transactions/) for application integration.

When a write must publish an event, continue with [outbox delivery](/microservices/outbox-and-delivery/). A local transaction does not automatically include a broker or another service.
