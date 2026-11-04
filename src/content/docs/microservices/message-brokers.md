---
title: Kafka and message brokers
description: Choose between a queue and a log, then follow Kafka's partitions, consumer groups, offsets, retries, and replay well enough to design with them.
---

When an order is placed, Fulfillment must pack it, Email must send a receipt, and Analytics must count it. If Orders called all three directly, an hour-long Email outage would block checkout. Adding a fourth consumer would mean changing Orders again.

**A message broker accepts a message from a producer, stores it durably, and delivers it to consumers on their own schedule.** Orders publishes `OrderPlaced` once and moves on. Each consumer reads it when it's ready, even if it was down when the order happened.

The catch is that you inherit the broker's rules. What survives a crash depends on configuration, delivery is usually at least once, ordering holds only within limits, and a consumer that falls behind is invisible until someone looks at lag. This article covers the two broker models, how Kafka works inside, how it keeps data safe and ordered, and how to handle failures and replay.

## Queues and logs

Brokers follow one of two models. Many products support both, but the model decides how you design.

### Work queue

Consumers compete for messages. Each message goes to one consumer, and it's removed once acknowledged. RabbitMQ queues and Amazon SQS work this way. [Figure](#fig-work-queue) shows three workers sharing one queue.

```mermaid #fig-work-queue A work queue. Each message goes to exactly one of the competing workers.
flowchart LR
  P[Orders] --> Q[resize-image queue]
  Q --> W1[Worker 1]
  Q --> W2[Worker 2]
  Q --> W3[Worker 3]
```

Use this when **a pool of workers should share a backlog of tasks**, such as resizing images or sending emails, and nobody needs the messages after they're done.

### Retained log

Messages are appended to a log and kept for a retention period, seven days by default in Kafka, whether or not anyone has read them. Each consumer group tracks its own position, so many independent groups can read the same events, and a group can rewind and read them again. [Figure](#fig-retained-log) shows three groups reading the same log.

```mermaid #fig-retained-log A retained log. Each consumer group reads every event at its own pace.
flowchart LR
  P[Orders] --> L[order-events log]
  L --> F[Fulfillment group]
  L --> E[Email group]
  L --> A[Analytics group]
```

Use this when **several services need the same events, or you need to replay history** to rebuild a read model or recover from a bug.

The rest of this article focuses on Kafka, the most common retained log.

## Kafka's building blocks

| Unit | Meaning |
| --- | --- |
| Topic | A named stream of records, such as `order-events` |
| Partition | One ordered, append-only log; a topic is split into several |
| Offset | A record's position within one partition |
| Consumer group | A set of consumers that divide a topic's partitions between them |
| Replica | A copy of a partition on another broker |

[Figure](#fig-partitions) shows how a consumer group divides a topic's partitions.

```mermaid #fig-partitions Partitions and a consumer group. Within the Fulfillment group, each partition has exactly one consumer.
flowchart LR
  subgraph order-events topic
    P0[Partition 0]
    P1[Partition 1]
    P2[Partition 2]
  end
  P0 --> C1[Consumer A]
  P1 --> C1
  P2 --> C2[Consumer B]
```

1. The topic `order-events` has three **partitions**.
2. In the Fulfillment consumer group, **consumer A** owns partitions 0 and 1, and **consumer B** owns partition 2.
3. Within a group, each partition has exactly one active consumer. A different group, such as Email, gets its own independent assignment.

**Partitions are Kafka's unit of both ordering and parallelism.** That one fact explains most Kafka design decisions.

## Keeping data safe

Each partition has a leader replica that takes writes and follower replicas that copy it. The followers that are fully caught up form the in-sync replica set.

A common durable setup:

```text
Topic     replication.factor = 3      three copies on three brokers
          min.insync.replicas = 2     a write needs at least two copies to succeed
Producer  acks = all                  wait for all in-sync replicas
          enable.idempotence = true   the broker drops duplicates from producer retries
```

With these settings, losing one broker loses no acknowledged writes, and the producer's own retries don't create duplicates in the log. Since Kafka 3.0, `acks=all` and idempotence are the producer defaults. The trade-off is latency: each write waits for a second replica. Setting `acks=1` is faster, but a leader crash right after the acknowledgment can lose the record.

## Ordering and partition keys

**Kafka guarantees order within a partition, never across partitions.**

The producer chooses the partition by hashing the record's key. Use the order ID as the key, and every event for order 812 lands in the same partition, in order: `OrderPlaced`, then `PaymentAuthorized`, then `OrderShipped`. Events for different orders can interleave, which is usually fine.

**Where it breaks.** Adding partitions changes the result of the hash, so new events for order 812 may go to a different partition than its old ones, and for a while two consumers may process that order's events at once. Choose a partition count with room to grow, and add partitions deliberately.

A skewed key causes a different problem. If one seller generates half of all events and you key by seller, one partition gets half the traffic and its consumer can't keep up. Pick keys with many distinct, evenly active values.

## Scaling consumers

Throughput scales by adding partitions and consumers together:

```text
6 partitions, 3 consumers in the group  → 2 partitions each
6 partitions, 6 consumers               → 1 partition each
6 partitions, 8 consumers               → 2 consumers sit idle
```

**Consumers beyond the partition count add no parallelism.** If you might need 30 consumers at peak, the topic needs at least 30 partitions.

When a consumer joins, leaves, or stops responding, the group **rebalances** and partitions move. A consumer that takes longer than `max.poll.interval.ms` between polls, five minutes by default, is considered dead and loses its partitions. Slow processing can trigger repeated rebalances, so keep per-batch work short or reduce the batch size.

## Offsets and side effects

A consumer commits its offset to record "I've handled everything up to here." When it commits decides what a crash does:

- **Commit, then process:** a crash after the commit skips the record. The update is lost.
- **Process, then commit:** a crash before the commit replays the record. The update can happen twice.

Process first, then commit, and make the processing idempotent. The [idempotent consumer](/microservices/outbox-and-delivery/) records each event ID in the same database transaction as its update, so a replay is harmless.

**Kafka transactions stop at Kafka's edge.** They can make "read from topic A, write to topic B, commit offsets" happen exactly once. A database write or HTTP call in the middle is not part of that transaction.

## Retries, dead letters, and replay

A record fails to process. What happens next decides whether the partition keeps moving. There are three common designs.

### Naive approach: retry in place forever

**How it works.** The consumer retries the same record until it succeeds.

**Where it breaks.** One bad record, such as a payload that doesn't match the schema, blocks every record behind it in that partition. Lag climbs and nothing else gets processed.

### Better approach: retry topics

**How it works.** After a failure, publish the record to a retry topic that a consumer reads after a delay, say one minute, then a longer-delay topic, and so on. The main partition keeps moving.

**Where it breaks.** Later records for the same order overtake the failed one. If `OrderCancelled` succeeds while `OrderPlaced` waits in a retry topic, the consumer sees them in the wrong order.

### Strong approach: classify, then route

**How it works.**
1. **Transient failures** (a database timeout): retry in place a few times with backoff.
2. **Still failing:** send to a retry topic, and have consumers use [version checks](/microservices/outbox-and-delivery/) so out-of-order arrivals are detected.
3. **Permanent failures** (bad schema, missing reference data): send straight to a **dead-letter topic** with the error attached, alert its owner, and provide a tool to replay records once fixed.

**Where it breaks.** A dead-letter topic with no owner is where orders quietly disappear. It needs an alert and someone responsible, like any other queue of work.

The deciding question is **does this consumer care about per-key order?** If it does, retry in place for longer and keep the retry topics short. If it doesn't, move failures out of the way quickly.

**Replay** means resetting a group's offsets to read old records again, for example to rebuild a search index after a bug. It's one of a log's biggest advantages and one of its biggest risks: **replay must never repeat irreversible side effects.** Rebuilding a read model, as in [event sourcing](/microservices/cqrs-and-event-sourcing/), is fine. Resending three days of receipt emails is not. Keep side effects behind deduplication that lasts at least as long as your replay window.

## Watching lag

**Lag** is the number of records written to a partition that the group hasn't processed yet. It's the most important Kafka metric.

Rising lag means one of two things: producers sped up, or consumers slowed down or stopped. Graph lag next to production rate, processing time, rebalance count, and error rate, so you can tell which. Alert on lag in time ("Email is 10 minutes behind"), not just in records.

## When not to use Kafka

- **Simple background jobs** with no need for replay or multiple consumers. A managed queue such as SQS is less to operate.
- **Request and response.** If the caller needs an answer in 200 ms, call the service directly.
- **Per-message routing and priorities.** RabbitMQ's exchanges and routing keys handle this more naturally.
- **Small teams without operational capacity.** Use a managed Kafka service, or a simpler broker, rather than running brokers yourself.

## In interviews

### When to bring it up

Bring up a broker when one event has several consumers, when work can finish later than the request, or when you need to absorb bursts. Choose a log such as Kafka when consumers need replay or independent progress; choose a queue for plain background work.

### How to introduce it

1. **Name the topic and key.** "Orders publishes to an order-events topic, keyed by order ID so each order's events stay in order."
2. **Size the partitions.** "We expect about 30 consumer instances at peak, so I'd start with 48 partitions."
3. **State durability.** "Replication factor 3, min.insync.replicas 2, producers use acks=all."
4. **Handle failures.** "Consumers are idempotent, transient errors retry with backoff, and permanent failures go to a dead-letter topic with an alert."

:::tip[In an interview]
If you say "Kafka guarantees ordering", expect a follow-up. The precise answer is "per partition, so I key by the entity whose events must stay in order".
:::

## Summary

A broker decouples producers from consumers in time, and Kafka does it with partitioned logs that many consumer groups can read and replay.

The trade-off is decoupling against new failure modes: at-least-once delivery, ordering only per partition, and lag that must be watched.

In an interview, bring up a broker when an event has several consumers or work can finish later, and specify the topic, key, partition count, durability settings, and failure handling.

Don't treat Kafka as globally ordered or exactly once end to end. Key by the entity that needs order, and make every consumer idempotent.

## Sources

- [Apache Kafka: design](https://kafka.apache.org/41/design/design/)
- [Apache Kafka: consumer configuration](https://kafka.apache.org/41/configuration/consumer-configs/)
- [RabbitMQ: consumer acknowledgments and publisher confirms](https://www.rabbitmq.com/docs/confirms)
