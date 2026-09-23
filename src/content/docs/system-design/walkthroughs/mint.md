---
title: Design a personal finance service
description: A worked design for importing transactions, categorizing spending, and recommending budgets.
sidebar:
  order: 4
---

## Define use cases and constraints

### Use cases (in scope)

- **User** connects a financial account.
- **Service** extracts transactions (daily update), categorizes them (with manual override), and analyzes monthly spending by category.
- **Service** recommends a budget, allows manual budgets, and notifies when near/over budget.
- **Service** has high availability.

### Out of scope

Additional logging and analytics.

### Constraints and assumptions

- Traffic is not evenly distributed; automatic daily updates apply only to users active in the past 30 days.
- Adding/removing accounts is rare; budget notifications need not be instant.
- 10 million users, 100 million budget items, 50,000 sellers, 30 million accounts.
- 5 billion transactions/month, 500 million reads/month → **10:1 write:read** (write-heavy).

### Usage

- ~50 bytes per transaction → **250 GB**/month, 9 TB in 3 years.
- **2,000 transactions/s**, **200 reads/s**.

## Sketch the high-level design

![High-level personal-finance architecture](/images/system-design/vector/mint-high-level.svg)

## Define the core components

### Connect an account

Accounts API writes to the `accounts` table (with `id`, `created_at`, `last_update`, `account_url`, `account_login`, `account_password_encrypted`, `user_id`). Index `id`, `user_id`, `created_at`.

:::tip[Protect external bank credentials]
External bank credentials require reversible encryption (AES-GCM via KMS/HSM) or tokenized OAuth/Open Banking integrations (for example, Plaid). One-way hashes cannot authenticate with external APIs.
:::

### Extract and categorize transactions

1. Accounts API places a job on a **queue** (SQS/RabbitMQ): extraction is slow, so do it [asynchronously](/backend/concurrency/).
2. **Transaction Extraction Service** pulls from the queue, stores raw logs in an **Object Store**, categorizes each transaction, updates the `transactions` and `monthly_spending` tables, and notifies the user.

:::tip[Category Service]
Seed a seller→category map (~50,000 sellers, ~12 MB in memory). For unknown sellers, learn from the crowd: a heap picks the top manual override in O(1).
:::

### Budget recommendation

Use a generic budget template by income tier (e.g. housing 40%, food 20%, gas 10%). Store only user **overrides**, not all 100 million budget items. Run **MapReduce** over raw transaction files to produce the monthly aggregate and reduce database load.

## Scale the design

![Scaled personal-finance architecture](/images/system-design/vector/mint-scaled.svg)

:::caution[Iterate, do not jump]
Benchmark → profile → fix → repeat.
:::

- Add a load balancer, web servers, and master-slave replicas.
- 200 reads/s → serve hot data from a **memory cache**; SQL read replicas handle misses.
- 2,000 writes/s → heavy; consider [sharding, federation](/system-design/databases/), and moving data to NoSQL.
- The `monthly_spending` aggregate has far fewer rows than the raw transactions.

## Additional talking points

- Cache placement and update policy: see [cache](/system-design/caching/).
- Message queues and back pressure: see [asynchronism](/backend/concurrency/).

---
