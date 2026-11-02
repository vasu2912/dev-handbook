---
title: Transactions, isolation, and locking
description: Connect ACID, MVCC snapshots, isolation anomalies, optimistic updates, pessimistic locks, and deadlocks.
---

A transaction groups changes into one commit decision. Atomicity means the transaction's changes commit together or roll back together. Consistency means defined invariants remain valid. Isolation governs concurrent observations. Durability concerns survival of committed work under the configured persistence guarantees.

ACID consistency is different from replica consistency in distributed systems. A database also cannot enforce a business rule that nobody encoded in a constraint, transaction, or other concurrency mechanism.

## MVCC and isolation levels

Multiversion concurrency control lets readers use visible row versions instead of always waiting for current writers. Visibility depends on the transaction's snapshot and isolation level. Locks still matter for writes and explicit locking reads.

| Isolation level  | General concern                             | PostgreSQL behavior to remember                                   |
| ---------------- | ------------------------------------------- | ----------------------------------------------------------------- |
| Read uncommitted | Dirty reads can be allowed by the SQL model | Behaves as read committed                                         |
| Read committed   | Later statements can observe newer commits  | Each statement gets a new snapshot                                |
| Repeatable read  | Stable repeated reads                       | Transaction snapshot, but serialization anomalies remain possible |
| Serializable     | Outcome equivalent to some serial execution | Conflicting executions can abort and require retry                |

A dirty read observes uncommitted data. A nonrepeatable read sees a row change between reads. A phantom involves a changing set of qualifying rows. Write skew occurs when concurrent transactions each make a valid-looking change based on a shared condition, but their combined result breaks the invariant.

## Protecting a stock decision

Reading stock and later writing a computed value can lose a concurrent update. An atomic conditional statement keeps the test with the change:

```sql
UPDATE inventory
SET available = available - 2
WHERE product_id = 7 AND available >= 2
RETURNING available;
```

No returned row means no matching reservation was made. The application must distinguish unknown products from insufficient stock if its contract needs that difference.

Optimistic concurrency adds an expected version to the update condition and increments the version on success. A zero-row result signals that the caller must reload and reevaluate. Pessimistic concurrency uses a locking read such as `SELECT ... FOR UPDATE` before deciding.

## Deadlock and retry boundaries

If transaction A holds row 1 and waits for row 2 while B holds row 2 and waits for row 1, neither can proceed. PostgreSQL detects the cycle and aborts one participant. Consistent lock ordering and short transactions reduce risk.

Retry a failed serializable transaction from its beginning, including the reads that informed its decisions. Do not retry only the final statement using stale inputs. Keep irreversible external actions outside the retryable database transaction.

Read [Spring transaction behavior](/java-spring/transactions/) for propagation and rollback rules, and [distributed locks](/microservices/distributed-locks/) for ownership across processes.

## Sources

- [PostgreSQL: transaction isolation](https://www.postgresql.org/docs/current/transaction-iso.html)
- [PostgreSQL: explicit locking](https://www.postgresql.org/docs/current/explicit-locking.html)
- [PostgreSQL: serialization failure handling](https://www.postgresql.org/docs/current/mvcc-serialization-failure-handling.html)
