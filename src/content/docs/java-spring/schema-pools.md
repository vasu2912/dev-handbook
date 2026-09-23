---
title: Schema changes and connection pools
description: Treat schema changes as deployments and database connections as a shared, bounded resource.
---

Database reliability depends on more than entity mappings. The schema must support both the current application and the version replacing it. The connection pool must fit the database's capacity across every running instance, including temporary deployment overlap.

## Give migrations one owner

Flyway and Liquibase record database changes and track which migrations have run. They make schema evolution reviewable and repeatable across environments. Choose one as the schema owner rather than combining it with Hibernate schema updates and independent startup scripts.

`spring.jpa.hibernate.ddl-auto` controls Hibernate's schema behavior. `create` and `create-drop` suit disposable databases. `update` cannot express the deployment intent behind a rename, a data backfill, or a staged constraint change. It is not a production migration strategy.

With migrations, use `none`, or `validate` when startup mapping checks are useful. Validation checks mapping compatibility but does not replace migration history or verify every index and business constraint. In Boot 4.0, the default is `create-drop` only for an embedded database without a detected schema manager. Otherwise, it is `none`. Set the policy explicitly rather than depending on the environment.

Boot 4.0 provides `spring-boot-starter-flyway` and `spring-boot-starter-liquibase`. Flyway also needs the appropriate database-specific module for databases such as PostgreSQL. Migration privileges can belong to a separate deployment identity instead of the application's ordinary database account.

## Let constraints enforce stored truth

Application validation gives useful errors, but it cannot close a race between concurrent requests. Two requests can both observe that an email address is unused before either inserts it. A database unique constraint makes the final decision.

Use foreign keys for references, not-null constraints for required values, and check constraints for row-level rules the database can enforce. Keep these definitions in migrations. An entity annotation is not proof that the deployed table has the intended constraint.

Constraints do not replace authorization or every business rule. A foreign key proves that an account exists, not that the caller may use it. Translate known constraint conflicts at the application boundary without exposing raw SQL or schema details.

## Keep rolling deployments compatible

During a rolling release, old and new application versions share one schema. Renaming or dropping a column immediately can break still-running instances and make application rollback impossible.

Consider renaming `customers.full_name` to `display_name` without changing the value's meaning. A direct `RENAME COLUMN` breaks the old binaries. This PostgreSQL-oriented expand-and-contract example uses an intermediate release so old-only writers never overlap new-column readers.

```sql
-- Expand migration, before deploying the bridge release.
ALTER TABLE customers ADD COLUMN display_name text;

-- Bridge release: every name change writes both columns atomically.
-- Illustrative parameterized application SQL, not a migration.
UPDATE customers
SET full_name = :name, display_name = :name
WHERE id = :id;

-- After ALL old-only writers have stopped, backfill bounded ID ranges.
-- Include non-null values: an old writer may have changed full_name
-- after a bridge writer populated display_name.
UPDATE customers
SET display_name = full_name
WHERE id >= :first_id AND id < :end_id
  AND display_name IS DISTINCT FROM full_name;

-- Verification before switching reads: expected result is 0.
SELECT count(*) FROM customers
WHERE display_name IS DISTINCT FROM full_name;
```

The SQL fragments omit the migration runner and backfill job. In this example, `full_name` is non-null, and the bridge release still reads it. Inserts also write both columns. No external writer may bypass this protocol.

| Deployment phase | Running code | Reads | Writes | Safe next action |
| --- | --- | --- | --- | --- |
| Expand | Old release | `full_name` | `full_name` | Add nullable `display_name` |
| Bridge rollout | Old + bridge | `full_name` | Old writes one, bridge writes both | Keep old column authoritative |
| Backfill | Bridge only | `full_name` | Both, in one statement | Copy all mismatches in bounded batches |
| Read switch | Bridge + new reader | Old or new column | Both | Verify no mismatches, then use new reads |
| Stop old writes | New reader + final release | `display_name` | Both or new column only | Wait until all dual writers exit |
| Contract | Final release only | `display_name` | `display_name` | Drop old column after rollback window |

Concurrent bridge writes keep both values equal while the backfill catches up. After the read switch, retain dual writes through the rollback window. Do not let a final-release-only write create divergence while a bridge reader can still run.

```sql
-- Contract migration, only after old-column users and rollback paths retire.
ALTER TABLE customers ALTER COLUMN display_name SET NOT NULL;
ALTER TABLE customers DROP COLUMN full_name;
```

For a starting row `(id=7, full_name='Ada')`, expand leaves `display_name` null. Backfill produces `('Ada', 'Ada')`. A dual-written rename to `Ada Lovelace` updates both. Contract leaves `(id=7, display_name='Ada Lovelace')`. Application rollback after the drop requires a compatible schema restoration plan, not just an old container image.

A migration file can be small while its lock or rewrite cost is large. Check the target database's behavior for index creation, constraint validation, and table alteration. Separate large backfills into bounded work when needed. Transactional DDL and rollback support vary by database and operation.

## Budget connections across instances

The JDBC and JPA starters bring HikariCP, which Boot prefers when available. Configure its settings under `spring.datasource.hikari`. `maximum-pool-size` limits connections in one pool, not across the deployment.

Suppose the database permits 100 connections. Reserve 10 for administration and recovery, 20 for workers, and 10 for migration or other clients. The API deployment has a budget of 60. With four replicas and a surge of one, size for five pools, not four.

| Pool choice | Steady-state ceiling | Rolling-deploy ceiling | Headroom within API budget |
| --- | --- | --- | --- |
| 10 per replica | `4 × 10 = 40` | `(4 + 1) × 10 = 50` | 10 |
| 12 per replica | `4 × 12 = 48` | `(4 + 1) × 12 = 60` | 0 |
| 15 per replica | `4 × 15 = 60` | `(4 + 1) × 15 = 75` | 15 over budget |

The ceiling is possible connections, not a throughput prediction or a claim that every pool is full. Budget for the maximum simultaneous instances, including terminating instances that still hold connections. Count every pool if a replica has more than one data source. More application threads, including virtual threads, do not create more database capacity.

### Try a connection budget

The application budget is the database connection limit minus reserves and other clients. Change the deployment numbers to see whether the configured pool ceilings fit. This arithmetic does not establish the database's safe concurrency or optimal pool size.

<section class="pool-budget" aria-label="Connection pool budget">
<form hidden>
<label>Replicas <input type="number" name="replicas" required min="1" max="10000" step="1" value="4"></label>
<label>Surge replicas <input type="number" name="surge" required min="0" max="10000" step="1" value="1"></label>
<label>Connections per pool <input type="number" name="pool" required min="1" max="10000" step="1" value="10"></label>
<label>Application connection budget <input type="number" name="budget" required min="1" max="10000" step="1" value="60"></label>
</form>
<output aria-live="polite">(4 + 1) × 10 = 50 possible connections. 10 connections remain in the application budget.</output>
</section>

`connection-timeout` bounds the wait to borrow a connection. It is not a query timeout, transaction timeout, or network read timeout. Hikari reports an acquisition failure when the wait expires. Increasing that timeout only lets requests wait longer.

Long transactions, blocked SQL, and remote calls inside transactions can keep connections checked out. Before increasing the pool, compare acquisition waits with connection usage time, active transactions, lock waits, and query latency. Increasing concurrent database work can worsen contention rather than improve throughput.

Continue with [transactions](/java-spring/transactions/), [observability](/java-spring/observability/), and [running services](/java-spring/running-services/).

## Sources

- [Spring Boot 4.0 database initialization and migrations](https://docs.spring.io/spring-boot/4.0/how-to/data-initialization.html)
- [Spring Boot 4.0 connection pool configuration](https://docs.spring.io/spring-boot/4.0/reference/data/sql.html#data.sql.datasource.connection-pool)
- [HikariCP configuration](https://github.com/brettwooldridge/HikariCP#gear-configuration-knobs-baby)
- [PostgreSQL constraints](https://www.postgresql.org/docs/current/ddl-constraints.html)
