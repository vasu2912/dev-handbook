---
title: Design a sales-rank service
description: A worked design for computing hourly product rankings from transaction logs.
sidebar:
  order: 7
---

## Define use cases and constraints

### Use cases (in scope)

- **Service** calculates the past week's most popular products by category.
- **User** views that list.
- **Service** has high availability.

### Out of scope

The general e-commerce site: design only the sales-rank feature.

### Constraints and assumptions

- Traffic is not evenly distributed.
- Items can be in multiple categories; items cannot change categories; no subcategories.
- Results update **hourly** (popular products may update more often).
- 10 million products, 1,000 categories, 1 billion transactions/month, 100 billion reads/month → **100:1 read:write**.

### Usage

- ~40 bytes per transaction → **40 GB**/month, 1.44 TB in 3 years.
- **400 transactions/s**, **40,000 reads/s**.

## Sketch the high-level design

![High-level sales-ranking architecture](/images/system-design/vector/sales-rank-high-level.svg)

## Define the core components

### Compute the rank

Store raw **Sales API** logs in an **Object Store** (S3), then run a two-step **MapReduce**:

1. Transform to `(category_id, product_id) → sum(quantity)`.
2. Do a distributed sort to rank products per category.

Write the result into the `sales_rank` table (`id`, `category_id`, `total_sold`, `product_id`), indexed on `id`, `category_id`, `product_id`.

### View the rank

Read API reads the `sales_rank` table by `category_id`.

:::tip[Batch, do not stream]
Computing rank is batch work over logs. The aggregate table has far fewer rows than the raw transactions.
:::

## Scale the design

![Scaled sales-ranking architecture](/images/system-design/vector/sales-rank-scaled.svg)

:::caution[Iterate, do not jump]
Benchmark → profile → fix → repeat.
:::

- 40,000 reads/s → serve popular ranks from a **memory cache**; read replicas handle misses.
- 400 writes/s → heavy for a single write master → [federation, sharding, denormalization, SQL tuning](/system-design/databases/), and consider NoSQL.
- Keep a limited time window in the database; archive the rest to a data warehouse (Redshift/BigQuery) or the object store.

## Additional talking points

- Cache update policy: see [cache](/system-design/caching/).
- NoSQL data model: see [database](/system-design/databases/).

---
