---
title: Database indexes
description: The terms and constraints to check when a database query needs an index.
---

An index is an additional data structure that helps a database find rows without scanning the whole table. The database maintains the index as writes change the table.

Start with the query and access pattern in [data and storage](/backend/data-and-storage/). The [repositories](/backend/architecture/repositories/) page shows where query construction belongs. For the wider storage trade-offs, read [databases](/system-design/databases/).

## Terms

| Term | Meaning |
| --- | --- |
| Selectivity | How well a key narrows the matching rows. |
| Composite index | One index ordered by more than one column. |
| Covering index | An index that contains every column needed by a query. |
| Query plan | The operations the database chooses to execute a query. |
| Full table scan | Reading rows across the table to find matches. |

## Constraints

- An index speeds up reads that match its leading columns.
- An index consumes storage and adds work to writes.
- An index does not guarantee a fast query. Check the query plan and row count.
- A composite index's column order matters.

Measure the query with production-like data before and after adding an index.

When a repeated read is expensive and can tolerate staleness, compare an index with [caching](/system-design/caching/). A cache changes freshness and invalidation behavior, so it does not replace a query plan.
