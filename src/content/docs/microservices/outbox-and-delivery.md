---
title: Outbox, delivery, and deduplication
description: Make sure every committed change publishes its event, and make consumers safe when the same event arrives twice.
---

Orders saves a new order, then publishes `OrderPlaced` so Fulfillment can pack it and Email can send the receipt. One night the process crashes in the few milliseconds between the database commit and the publish. The order exists, the customer was charged, and nothing ever ships.

Swapping the order doesn't help. Publish first, and a failed commit means Fulfillment ships an order that doesn't exist. Any time one operation writes to a database and a message broker, there is a crash window between the two writes. This is the **dual-write problem**.

**The transactional outbox fixes it by turning two writes into one: the event is saved in the same database transaction as the change, and a separate relay publishes it.** The catch is that the relay can publish the same event more than once, so every consumer must handle duplicates. This article covers the outbox, the ways to run the relay, what delivery guarantees really mean, and how to build a consumer that is safe to redeliver to.

## The dual-write problem

[Figure](#fig-dual-write) shows both orderings and where each one breaks.

```mermaid #fig-dual-write The two orderings of a dual write. Either way, a crash between the writes leaves the database and the broker disagreeing.
flowchart TD
  A[Commit order] --> B{Crash here?}
  B -->|yes| C[Order saved, event lost]
  B -->|no| D[Publish event]
  E[Publish event] --> F{Crash here?}
  F -->|yes| G[Event sent, order never saved]
  F -->|no| H[Commit order]
```

No ordering of two independent writes is safe. Retrying the publish doesn't help either, because after a crash the retry logic is gone with the process. **The fix is to make the event part of the same commit as the data.**

## Getting the event out reliably

There are three ways to publish after a database change. Only the last two survive crashes.

### Naive approach: commit, then publish

**How it works.** Save the order, commit, then send the event to Kafka from application code.

**Where it breaks.** A crash, deploy, or broker outage between commit and publish loses the event for good. It works in testing and fails roughly once per crash in production, which is rare enough to go unnoticed for months.

### Better approach: an outbox table with a polling relay

**How it works.** Write the order and an outbox row in one local transaction:

```sql
BEGIN;
INSERT INTO orders (id, status, total) VALUES (812, 'PLACED', 59.00);
INSERT INTO outbox (id, aggregate_id, type, payload)
  VALUES ('evt-91', '812', 'OrderPlaced', '{"orderId": 812, "total": 59.00}');
COMMIT;
```

Both rows commit or neither does. A relay process then reads unpublished rows, publishes them, and marks them done after the broker confirms:

```sql
SELECT id, type, payload
FROM outbox
WHERE published_at IS NULL
ORDER BY created_at
LIMIT 100
FOR UPDATE SKIP LOCKED;   -- several relays can share the work without blocking
```

[Figure](#fig-outbox) shows the full path from request to consumer.

```mermaid #fig-outbox The transactional outbox. The order and its event commit in one local transaction, and a relay publishes the event afterwards.
flowchart LR
  R[Request] --> T[One local transaction]
  T --> OR[Order row]
  T --> OB[Outbox row]
  OB --> RL[Relay]
  RL --> K[Broker]
  K --> C[Consumers]
```

A partial index such as `CREATE INDEX ON outbox (created_at) WHERE published_at IS NULL` keeps the polling query fast as the table grows. Delete or archive published rows on a schedule.

**Where it breaks.** Polling adds latency (the poll interval) and steady load on the database. If the relay publishes a batch and then crashes before marking it, it publishes that batch again. With several relays using `SKIP LOCKED`, events for the same order can be published out of order.

### Strong approach: an outbox read by change data capture

**How it works.** Write the outbox row the same way, but instead of polling, a change data capture (CDC) connector reads the database's own change log, PostgreSQL's write-ahead log or MySQL's binlog, and publishes each new outbox row. Debezium is the common choice and includes an outbox event router for exactly this.

**Where it breaks.** You now operate connector infrastructure. In PostgreSQL, a stopped connector's replication slot makes the database retain its log files, and the disk can fill up. Like the polling relay, CDC still delivers at least once.

Both the polling relay and CDC are correct. The deciding question is **do you already run CDC infrastructure?** If you do, use it. If not, a polling relay is simpler and good enough for most systems.

**The outbox prevents lost events; it does not prevent duplicate ones.** That's the consumer's job.

## What delivery guarantees mean

Every messaging system promises one of three things, and each one tells the consumer what to expect:

- **At most once.** The message is never redelivered, so it can be lost. Acceptable for metrics samples, never for orders.
- **At least once.** The message is redelivered until acknowledged, so it can arrive twice. This is what the outbox and most brokers give you, and consumers must deduplicate.
- **Exactly once, within a boundary.** Kafka's idempotent producer and transactions can make "consume, process, produce" happen once, **as long as every effect is a Kafka write or an offset commit**.

**Exactly once never extends past its boundary.** If your consumer writes to Postgres or calls a payment API, those effects are outside Kafka's transaction and can still happen twice. Always say which effects a guarantee covers.

## A consumer that is safe to redeliver to

Give every event a stable ID, and record that ID in the same transaction as the work it triggers:

```sql
BEGIN;
INSERT INTO processed_events (event_id) VALUES ('evt-91')
  ON CONFLICT (event_id) DO NOTHING;
-- if that inserted 0 rows, this event was already handled: COMMIT and skip
UPDATE shipments SET status = 'READY' WHERE order_id = 812;
COMMIT;
-- acknowledge the message only after the commit
```

[Figure](#fig-idempotent-consumer) shows what happens when the consumer crashes before acknowledging.

```mermaid #fig-idempotent-consumer An idempotent consumer surviving a redelivery. The event ID committed with the first update turns the second delivery into a no-op.
sequenceDiagram
  participant B as Broker
  participant C as Consumer
  participant D as Database
  B->>C: evt-91
  C->>D: insert evt-91 + update shipment (one commit)
  C--xB: crash before acknowledging
  B->>C: evt-91 again
  C->>D: insert evt-91 finds a duplicate
  C->>B: acknowledge and skip
```

1. The **consumer** receives `evt-91` and commits the event ID together with the shipment update.
2. It crashes before acknowledging, so the **broker** redelivers.
3. This time the insert finds the ID already present, so the consumer skips the work and acknowledges.

**Acknowledge after commit, never before.** Acknowledging first means a crash loses the event. Acknowledging after means a crash causes a redelivery, which the event ID makes harmless.

Keep processed IDs at least as long as the broker can redeliver or replay. If a Kafka topic keeps seven days of data and you might replay all of it, a two-day deduplication window is too short. The [Spring outbox and consumer examples](/java-spring/events-messaging/) show this in Java.

## Ordering and failures

Deduplication and ordering are separate problems. **An event ID stops repeats; a version number stops stale updates.**

- **Partition by entity.** Publishing all of an order's events with the order ID as the key keeps them in order within one Kafka partition. See [Kafka and message brokers](/microservices/message-brokers/).
- **Carry a version.** If `OrderUpdated` version 7 arrives after version 8, the consumer sees that 7 is older than what it has and ignores it.
- **Watch retry paths.** Moving a failing event to a retry topic lets later events overtake it.

A **poison message** fails every time, for example because its payload doesn't match the schema. After a few attempts, move it to a dead-letter topic so the rest of the stream keeps flowing. A dead-letter topic needs an owner, an alert, and a way to replay fixed messages, or it becomes a place where orders quietly disappear.

## In interviews

### When to bring it up

Bring up the outbox whenever a service writes to its database and publishes an event about that write. In most event-driven designs, that's every service. Bring up idempotent consumers whenever you say "at least once".

### How to introduce it

1. **Name the problem.** "Saving the order and publishing OrderPlaced are two writes, so a crash between them loses the event."
2. **Apply the outbox.** "I'd insert the event into an outbox table in the same transaction, and have Debezium publish it to Kafka."
3. **Handle duplicates.** "Delivery is at least once, so Fulfillment records each event ID in the same transaction as its update and skips repeats."
4. **Handle order.** "Events are keyed by order ID, and each carries a version so stale updates are ignored."

:::tip[In an interview]
"Exactly once" is a red flag if you can't say its boundary. The stronger answer is "at least once delivery with idempotent consumers", which works with any broker and any side effect.
:::

## Summary

The outbox makes a database change and its event commit together, and idempotent consumers make the resulting redeliveries harmless.

The trade-off is reliability against complexity: you add a table, a relay or CDC connector, and deduplication state, and in return you never lose an event.

In an interview, bring it up whenever a service both writes data and publishes about it, and pair it with event IDs, acknowledgment after commit, and per-entity ordering.

Don't publish from application code after committing. The crash window is small, and it will lose events.

## Sources

- [AWS: transactional outbox pattern](https://docs.aws.amazon.com/prescriptive-guidance/latest/cloud-design-patterns/transactional-outbox.html)
- [Apache Kafka: delivery semantics](https://kafka.apache.org/41/design/design/)
