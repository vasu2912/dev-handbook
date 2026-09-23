---
title: Events and messaging
description: Choose event timing and delivery guarantees deliberately, including commit gaps and redelivery.
---

An event says that something happened. The delivery mechanism determines who can hear it, when listeners run, and what happens if the process stops. A Spring application event and a broker message can carry the same data while providing very different guarantees.

## Local events still share a process

`ApplicationEventPublisher` dispatches objects to listeners such as methods annotated with `@EventListener`. By default, listeners run synchronously on the publisher's thread. The publisher waits for them, and they can participate in its thread-bound transaction. A slow listener extends the call. A listener failure can propagate back to the publisher.

Local events can separate an operation from optional reactions without adding a broker. They also hide control flow if a required business step exists only in an unexpected listener. Keep invariant-enforcing work visible in the use case rather than depending on incidental listener ordering.

Adding `@Async` moves a listener to an executor. Its failure no longer reaches the publisher, its thread context needs explicit handling, and its task remains in memory. Async dispatch is not durable messaging.

## Commit timing is not delivery assurance

`@TransactionalEventListener` binds execution to a transaction phase. The default is `AFTER_COMMIT`, so the listener does not react to work that later rolls back. Without an active transaction, the listener does not run unless `fallbackExecution` is enabled. That option changes the contract and deserves a reason.

After-commit handling cannot make database writes and external effects atomic. The process can stop after commit but before the listener sends a message. It can also stop after sending but before recording success. A listener failure cannot undo the completed commit.

Database resources may still be accessible during an after-commit callback, but the original transaction has finished. Further changes through those resources do not gain another commit. If the listener needs to persist new work, give that work a separate transaction. Do not confuse accessible entities with an active write boundary.

## Store the intent with the change

An outbox closes the lost-intent gap between a database commit and required publication. The business transaction writes both the domain change and an outbox row. A separate relay reads committed rows, publishes their messages, waits for broker confirmation, and records successful publication.

This illustrative PostgreSQL schema stores a small event snapshot. `published_at` means the broker confirmed publication, not that a consumer completed its work:

```sql
CREATE TABLE outbox_event (
	event_id uuid PRIMARY KEY,
	aggregate_id text NOT NULL,
	event_type text NOT NULL,
	payload jsonb NOT NULL,
	created_at timestamptz NOT NULL DEFAULT now(),
	published_at timestamptz
);

CREATE INDEX outbox_pending ON outbox_event (created_at)
	WHERE published_at IS NULL;
```

Suppose order `o42` changes from `DRAFT` to `PLACED`. Both writes belong to the same database transaction. This illustrative SQL assumes the order exists and the application has checked that placement is allowed:

```sql
BEGIN;
UPDATE orders SET status = 'PLACED' WHERE id = 'o42';
INSERT INTO outbox_event (event_id, aggregate_id, event_type, payload)
VALUES (
	'00000000-0000-4000-8000-000000000042',
	'o42',
	'OrderPlaced.v1',
	'{"orderId":"o42","totalMinor":2500,"currency":"USD"}'
);
COMMIT;
```

The committed row looks like this. Later sections abbreviate its UUID as `e42`:

| Event | Aggregate | Type | Snapshot | Publication state |
| --- | --- | --- | --- | --- |
| `e42` | `o42` | `OrderPlaced.v1` | `totalMinor=2500`, `currency=USD` | `published_at=NULL` |

If the relay instead reads mutable current order data, a later update can change the meaning of `OrderPlaced`. Store enough data to publish the intended fact, and define a schema version for consumers.

### Stop the producer at three points

Assume the relay reads only committed rows, retries pending rows after restart, and uses a broker configured for durable publication. These scenarios show why a stable event ID is required even with an outbox.

<section class="walkthrough" aria-label="Outbox crash windows">
<section data-scenario="Crash before database commit">
<p><strong>Crash before database commit</strong></p>
<ol class="walkthrough-steps">
<li><strong>Write inside the transaction</strong><p>The producer changes o42 to PLACED and inserts e42. Both writes are uncommitted. Other transactions still see o42 as DRAFT and no e42 row.</p></li>
<li><strong>The process stops before commit</strong><p>The database rolls back both writes. The relay cannot publish an uncommitted row. Durable state is o42=DRAFT, outbox empty, broker empty.</p><svg role="img" aria-label="Before commit crash leaves a draft order and no event in database or broker" viewBox="0 0 440 100" width="100%" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="10" width="200" height="80" rx="6" fill="var(--diagram-bg)" stroke="var(--diagram-border)"/><rect x="235" y="10" width="200" height="80" rx="6" fill="var(--diagram-bg)" stroke="var(--diagram-border)"/><g fill="var(--diagram-ink)" font-size="18" text-anchor="middle"><text x="105" y="42">DB: o42 DRAFT</text><text x="105" y="69">outbox empty</text><text x="335" y="42">Broker</text><text x="335" y="69">no e42</text></g></svg></li>
<li><strong>Retry the business request deliberately</strong><p>No event represents a committed placement. The caller must resolve any uncertainty about its request before retrying. An outbox does not deduplicate duplicate order-placement requests.</p></li>
</ol>
</section>
<section data-scenario="Crash after commit before publish">
<p><strong>Crash after commit before publish</strong></p>
<ol class="walkthrough-steps">
<li><strong>Commit the order and event</strong><p>The database durably stores o42=PLACED and e42 with published_at=NULL. The broker has not received e42.</p></li>
<li><strong>The process stops before publication</strong><p>A restarted relay can still find e42. An in-memory event or a plain after-commit callback would have no stored publication intent to recover.</p><svg role="img" aria-label="Committed placed order and pending outbox event survive while broker has no event" viewBox="0 0 440 100" width="100%" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="10" width="200" height="80" rx="6" fill="var(--diagram-green-bg)" stroke="var(--diagram-green)"/><rect x="235" y="10" width="200" height="80" rx="6" fill="var(--diagram-bg)" stroke="var(--diagram-border)"/><g fill="var(--diagram-ink)" font-size="18" text-anchor="middle"><text x="105" y="42">DB: o42 PLACED</text><text x="105" y="69">e42 pending</text><text x="335" y="42">Broker</text><text x="335" y="69">no e42 yet</text></g></svg></li>
<li><strong>Publish from stored intent</strong><p>The relay publishes e42, receives confirmation, then commits published_at. A send failure leaves the row pending for a later attempt. Publication can be late without losing the committed intent.</p></li>
</ol>
</section>
<section data-scenario="Crash after publish before delivery mark">
<p><strong>Crash after publish before delivery mark</strong></p>
<ol class="walkthrough-steps">
<li><strong>The broker accepts e42</strong><p>The relay receives confirmation. The broker has e42, but the database still has published_at=NULL. Consumer completion is independent of this confirmation.</p></li>
<li><strong>The relay stops before marking success</strong><p>After restart, the pending row looks unsent. The relay publishes the same e42 again. The broker can now deliver two copies with the same event ID.</p><svg role="img" aria-label="Pending outbox event is retried, producing two broker copies with the same event ID" viewBox="0 0 440 115" width="100%" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="10" width="180" height="90" rx="6" fill="var(--diagram-bg)" stroke="var(--diagram-border)"/><rect x="255" y="10" width="180" height="90" rx="6" fill="var(--diagram-yellow-bg)" stroke="var(--diagram-yellow)"/><path d="M185 55H255l-9 -5m9 5l-9 5" fill="none" stroke="var(--diagram-ink)"/><g fill="var(--diagram-ink)" font-size="18" text-anchor="middle"><text x="95" y="43">Outbox</text><text x="95" y="72">e42 pending</text><text x="345" y="43">Broker copies</text><text x="345" y="72">e42, e42</text></g></svg></li>
<li><strong>Deduplicate the business effect</strong><p>The consumer commits its effect and a durable e42 marker together. A repeated e42 skips the effect. The relay eventually commits published_at after confirmation, but that mark does not remove duplicates already published.</p></li>
</ol>
</section>
</section>

The relay must recover unfinished rows after a restart and avoid permanently losing failed publications. Multiple relay workers need coordinated row claims, with recovery if a claim owner crashes. Monitor pending-row count and age. Keep retries, retention, and ordering requirements explicit. An outbox removes a lost-intent window, not every distributed failure.

## Redelivery is part of the consumer contract

A broker separates the producer's lifetime from the consumer's, subject to storage, retention, and replication settings. Producer confirmation means the broker accepted publication under its protocol. It does not mean a consumer completed the business operation.

Acknowledge required database work only after it commits. A crash after commit but before acknowledgment causes redelivery. A durable deduplication marker must share a transaction with the business effect. This illustrative PostgreSQL example counts placed orders for a projection named `order-stats`. Its primary key permits other consumers to process the same event independently:

```sql
CREATE TABLE processed_event (
	consumer_name text NOT NULL,
	event_id uuid NOT NULL,
	PRIMARY KEY (consumer_name, event_id)
);

BEGIN;
WITH first_delivery AS (
	INSERT INTO processed_event (consumer_name, event_id)
	VALUES ('order-stats', '00000000-0000-4000-8000-000000000042')
	ON CONFLICT DO NOTHING
	RETURNING event_id
)
UPDATE order_stats
SET placed_count = placed_count + 1
WHERE id = 'all-orders'
	AND EXISTS (SELECT 1 FROM first_delivery);
COMMIT;
```

Assume `order_stats` contains the `all-orders` row and this transaction owns the whole consumer effect. The handler must treat a missing required projection row as an error, rather than committing a marker with no business update.

| Delivery | Marker insertion | `placed_count`, initially 10 | Acknowledgment |
| --- | --- | --- | --- |
| First e42 | One new row | 11 after commit | Only after commit |
| e42 redelivered after commit | Conflict, no new row | Still 11 | Safe after the duplicate transaction finishes |
| First attempt rolls back | Marker also rolls back | Still 10 | Do not acknowledge as completed |

The uniqueness constraint arbitrates concurrent copies too. Keeping IDs only in memory fails across restarts and replicas. Keep durable markers for the supported replay window. External effects still need their own idempotency mechanism because a database marker cannot atomically cover an HTTP request.

Bound transient retries and route repeatedly failing messages to an inspectable recovery path. A malformed message should not loop forever, consume the entire worker capacity, or disappear without a record. Replay and ordering requirements belong in the message contract before consumers depend on them.

Continue with [transactions](/java-spring/transactions/), [async work](/java-spring/async-jobs/), and [HTTP clients](/java-spring/http-clients/).

## Sources

- [Spring application events](https://docs.spring.io/spring-framework/reference/core/beans/context-introduction.html#context-functionality-events)
- [Transaction-bound events](https://docs.spring.io/spring-framework/reference/data-access/transaction/event.html) and [after-completion resource warning](https://docs.spring.io/spring-framework/docs/7.0.x/javadoc-api/org/springframework/transaction/event/TransactionalEventListener.html)
- [Spring's outbox pattern discussion](https://spring.io/blog/2023/10/24/a-use-case-for-transactions-adapting-to-transactional-outbox-pattern)
- [RabbitMQ acknowledgments and publisher confirms](https://www.rabbitmq.com/docs/confirms)
- [PostgreSQL INSERT and ON CONFLICT](https://www.postgresql.org/docs/current/sql-insert.html)
