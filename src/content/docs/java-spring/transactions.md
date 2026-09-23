---
title: Transaction boundaries
description: Place atomicity around a use case and understand propagation, rollback, isolation, and concurrent updates.
---

A transaction groups database changes that must succeed or fail together. Put its boundary around the use case, such as creating an order and reserving stock, rather than around each repository call. Repository-level transactions cannot make several independent commits atomic.

## Make the boundary executable

Spring's `@Transactional` describes behavior supplied by a transaction interceptor. In the default proxy mode, the call must enter through the Spring proxy. A method calling another annotated method on the same object bypasses that interception. The inner annotation does not create a transaction or change the outer one.

A public service method called by another bean is the clearest boundary. Move a genuinely separate transactional operation to another bean, or use programmatic transaction management when explicit scopes are clearer. An annotation on an object created with `new` does not activate Spring transaction management.

An imperative transaction normally belongs to the current thread. Starting a background task does not transfer it. That task needs its own boundary and its own loaded state.

### Watch both writes roll back

Suppose order `42` does not exist and product `7` has three units in stock. This service fragment uses a Spring-managed `JdbcTemplate` and transaction manager for the same database. A controller calls the injected service; imports are omitted.

```java
@Service
class OrderService {
    private final JdbcTemplate jdbc;

    OrderService(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    @Transactional
    public void placeOrder() {
        jdbc.update("INSERT INTO orders (id, status) VALUES (?, ?)",
                42L, "PENDING");
        int reserved = jdbc.update("""
                UPDATE inventory SET quantity = quantity - ?
                WHERE product_id = ? AND quantity >= ?
                """, 5, 7L, 5);
        if (reserved == 0) {
            throw new IllegalStateException("Insufficient stock");
        }
    }
}
```

The conditional update affects zero rows: three units cannot satisfy a request for five. The unchecked exception leaves the service method and reaches the transaction interceptor, which rolls back the earlier insert. The database must support transactions for both tables.

**Expected result**, queried from a new transaction after the failed call:

```text
Caller: IllegalStateException("Insufficient stock")
SELECT id, status FROM orders WHERE id = 42;
  → 0 rows
SELECT quantity FROM inventory WHERE product_id = 7;
  → 3
```

With five units initially available, the method returns normally, the interceptor commits, and the same queries return `(42, PENDING)` and `0`. Without the service transaction, these JDBC calls normally run with auto-commit: the insert can remain committed even when stock reservation fails. The annotation protects the combined operation, not just either statement in isolation.

## Understand shared and independent work

`REQUIRED` is the default propagation. It starts a transaction when none exists and otherwise joins the current one. Several annotated methods can therefore share one physical database transaction.

If an inner participating scope marks that transaction rollback-only, catching its exception does not restore commit eligibility. An attempted outer commit can throw `UnexpectedRollbackException`. The caller must not mistake a normal method return for a successful commit.

`REQUIRES_NEW` suspends the outer transaction and starts an independent one. Compare two runs of this partial service example. Both start with no order `43` and no audit entry for attempt `attempt-43`. Each run uses a fresh database state.

The outer bean receives a Spring-managed `JdbcTemplate` and an injected `AuditService` through its constructor. Both use the same database and transaction manager. Imports and constructor wiring are omitted.

```java
// Method in the outer checkout service.
@Transactional
public void checkout() {
	jdbc.update("INSERT INTO orders (id, status) VALUES (?, ?)",
			43L, "PENDING");
	audit.recordAttempt("attempt-43"); // Calls a different bean's proxy.
	throw new IllegalStateException("Payment rejected");
}

// Method in a separate @Service bean named AuditService.
@Transactional(propagation = Propagation.REQUIRED)
public void recordAttempt(String attemptId) {
	jdbc.update("INSERT INTO audit_log (attempt_id, message) VALUES (?, ?)",
			attemptId, "Checkout attempted");
}
```

For the second run, change only `recordAttempt` to `Propagation.REQUIRES_NEW`. The audit table stores an attempt identifier, not a foreign key to the uncommitted order. The audit method does not query or update the order. Its message records an attempt, not a successful purchase.

<section class="walkthrough" aria-label="Shared versus independent transaction outcomes">
<section data-scenario="REQUIRED: both writes roll back">
<p><strong>REQUIRED: both writes roll back</strong></p>
<ol class="walkthrough-steps">
<li><strong>Start the outer transaction</strong><p>The checkout proxy starts transaction T1. The order insert executes in T1 but has not committed.</p></li>
<li><strong>Join T1 for the audit</strong><p>The separate AuditService proxy sees REQUIRED and joins T1. Its insert and the order insert share the same commit decision. Returning from recordAttempt does not commit T1.</p></li>
<li><strong>Reject payment and roll back</strong><p>The unchecked exception leaves checkout. The outer interceptor rolls back T1. A new transaction finds neither order 43 nor the audit row. The caller receives IllegalStateException.</p><svg role="img" aria-label="One transaction contains both writes, and rollback removes both" viewBox="0 0 480 120" style="max-width:100%;height:auto"><rect x="10" y="10" width="460" height="100" rx="8" fill="var(--diagram-red-bg)" stroke="var(--diagram-red)"/><g fill="var(--diagram-ink)" text-anchor="middle" font-size="18"><text x="240" y="40">T1: order + audit</text><text x="240" y="78">ROLLBACK → neither row remains</text></g></svg></li>
</ol>
</section>
<section data-scenario="REQUIRES_NEW: audit survives rollback">
<p><strong>REQUIRES_NEW: audit survives rollback</strong></p>
<ol class="walkthrough-steps">
<li><strong>Start the outer transaction</strong><p>T1 inserts order 43. It retains its connection and any locks when the call reaches AuditService.</p></li>
<li><strong>Suspend T1 and commit T2</strong><p>The audit proxy starts independent transaction T2 on another connection. T2 inserts the attempt data supplied by the caller and commits when recordAttempt returns. It does not read T1's uncommitted order.</p><svg role="img" aria-label="T1 is suspended while independent T2 commits the audit" viewBox="0 0 480 140" style="max-width:100%;height:auto"><rect x="10" y="10" width="460" height="50" rx="8" fill="var(--diagram-yellow-bg)" stroke="var(--diagram-yellow)"/><rect x="10" y="80" width="460" height="50" rx="8" fill="var(--diagram-green-bg)" stroke="var(--diagram-green)"/><g fill="var(--diagram-ink)" text-anchor="middle" font-size="18"><text x="240" y="42">T1: order pending, suspended</text><text x="240" y="112">T2: audit committed</text></g></svg></li>
<li><strong>Resume and roll back T1</strong><p>Checkout resumes, then throws. T1 rolls back the order, but cannot undo T2's commit. A new transaction finds no order 43 and one audit row for attempt-43. The caller still receives IllegalStateException.</p></li>
</ol>
</section>
</section>

| Final state after the failed call | `REQUIRED` audit | `REQUIRES_NEW` audit |
| --- | --- | --- |
| Order `43` | Absent | Absent |
| Audit row `attempt-43` | Absent | Present, `Checkout attempted` |
| Caller outcome | `IllegalStateException` | `IllegalStateException` |

Use an independent commit only when the audit must survive the failed use case. It is not a way to make the failed order succeed.

The suspended transaction can retain a connection and locks while the inner transaction needs another connection. Enough concurrent outer calls can exhaust the pool before any inner call progresses. Independence also means the inner operation cannot assume it can see uncommitted outer changes.

## Choose rollback and isolation policies

By default, Spring rolls back for `RuntimeException` and `Error`, but not checked exceptions. Declare typed `rollbackFor` rules when a checked failure must abort the use case. A caught exception that never reaches the interceptor does not trigger its rollback rule, although the provider may already have marked the transaction rollback-only.

Spring Framework 6.2 added a global `ALL_EXCEPTIONS` rollback policy, also available in the Framework 7 baseline used by Boot 4.0. It is an explicit configuration choice, not the historical default.

`readOnly = true` is an optimization hint, not write authorization. Spring's Hibernate integration can reduce flush and dirty-checking work. Do not rely on it to reject every write.

Isolation determines which concurrent changes a transaction can observe. `DEFAULT` uses the database default. Stronger isolation can prevent more anomalies but can also increase contention or serialization failures. A joined `REQUIRED` scope normally inherits the outer transaction's characteristics rather than replacing them with its own isolation declaration.

## Protect concurrent decisions

An entity's `@Version` supports optimistic locking. Hibernate checks the version when updating or deleting versioned state, so a stale writer fails instead of silently replacing a concurrent update. Reevaluate the whole use case in a fresh transaction after a conflict, or return a conflict to the caller. Repeating the same stale write is not a fix.

Pessimistic locking obtains database locks before the decision and holds them until the transaction ends. It can suit contended read-modify-write operations, but blocked transactions, lock timeouts, and deadlocks remain possible. Keep lock scope short and acquire multiple locks in a consistent order. An entity lock does not automatically protect every related row or a cross-row business invariant.

Neither locking strategy makes an HTTP request or broker publication part of a local database commit. Remote work can succeed while the database rolls back. Keep remote waits outside the database transaction where possible. For reliable publication, record an outbox entry with the domain change and deliver it separately.

Continue with [proxies](/java-spring/proxies/), [schema and connection pools](/java-spring/schema-pools/), and [events and messaging](/java-spring/events-messaging/).

## Sources

- [Spring transactional settings and proxy semantics](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/annotations.html)
- [Spring transaction propagation](https://docs.spring.io/spring-framework/reference/data-access/transaction/declarative/tx-propagation.html)
- [Spring Data JPA transactionality](https://docs.spring.io/spring-data/jpa/reference/jpa/transactions.html)
- [Jakarta Persistence lock modes](https://jakarta.ee/specifications/persistence/3.2/apidocs/jakarta.persistence/jakarta/persistence/LockModeType.html)
