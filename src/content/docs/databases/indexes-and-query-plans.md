---
title: Indexes and query execution
description: Compare index structures, composite ordering, selectivity, and EXPLAIN output before tuning a query.
---

An index is an additional data structure that gives the database another way to locate rows. It consumes storage and adds work to writes. The optimizer chooses whether its estimated benefit exceeds alternatives such as scanning the table.

## Index structures and access patterns

| Structure | Typical use                                                                               | Limitation                                      |
| --------- | ----------------------------------------------------------------------------------------- | ----------------------------------------------- |
| B-tree    | Equality, ranges, ordered retrieval                                                       | Column order and selectivity matter             |
| Hash      | Equality lookups                                                                          | Does not supply range order                     |
| GIN       | Multiple searchable values within a row, such as supported JSON or text-search operations | Write and maintenance costs                     |
| BRIN      | Large tables with values correlated with physical location                                | Lossy summaries require checking candidate rows |

Product support differs. A clustered index describes how data is organized in some databases. PostgreSQL's `CLUSTER` operation reorders a table using an index but does not continuously preserve that physical order after later writes.

## Composite indexes

```sql
CREATE INDEX order_history
ON purchase_order (customer_id, created_at DESC, id DESC);

SELECT id, created_at, total
FROM purchase_order
WHERE customer_id = 42
ORDER BY created_at DESC, id DESC
LIMIT 20;
```

The equality condition selects a customer's range, and the remaining keys match the requested ordering. An index beginning with `created_at` represents a different access path. A database can sometimes use non-leading columns through other strategies, so the leftmost-prefix idea is a useful design rule rather than a universal prohibition.

Partial indexes cover rows satisfying a predicate. Covering indexes include values needed by a query. PostgreSQL index-only scans also depend on visibility information, so including every selected column does not guarantee zero heap access.

## Reading a plan

`EXPLAIN` shows the chosen plan and estimates. `EXPLAIN (ANALYZE, BUFFERS)` executes the statement and adds observed timing, row counts, and buffer activity. For writes, execution changes data unless the surrounding transaction is rolled back. External effects and sequence advances are not necessarily undone by that rollback.

Compare estimated rows with actual rows and account for loop counts. A nested-loop join can be efficient for a small outer input but expensive when estimates miss by orders of magnitude. Hash joins and merge joins trade memory, scans, and ordering differently.

A sequential scan is reasonable when a query needs much of a table. Before forcing an index, inspect predicates, statistics, returned row count, sorting, and I/O. Benchmark on representative data rather than a nearly empty development table.

Connect this to [JPA query behavior](/java-spring/queries-fetching/) and [index terminology](/reference/database-indexes/).

## Sources

- [PostgreSQL: index types](https://www.postgresql.org/docs/current/indexes-types.html)
- [PostgreSQL: multicolumn indexes](https://www.postgresql.org/docs/current/indexes-multicolumn.html)
- [PostgreSQL: using EXPLAIN](https://www.postgresql.org/docs/current/using-explain.html)
- [PostgreSQL: index-only scans](https://www.postgresql.org/docs/current/indexes-index-only-scans.html)
