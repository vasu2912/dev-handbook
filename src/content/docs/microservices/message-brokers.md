---
title: Kafka and message brokers
description: Compare queues and retained logs, then follow partitions, consumer groups, offsets, retries, and replay.
---

A broker decouples producers from consumers by accepting messages before the consuming application completes its work. The broker's durability and acknowledgment settings determine what survives a failure.

## Queue and retained-log models

In a work queue, competing consumers divide tasks, and acknowledgment normally allows completed messages to leave the queue. In a retained log such as Kafka, consumers track their positions while records remain until retention or compaction removes them.

These are models, not absolute product boundaries. Broker products can expose several delivery styles. Choose based on routing, ordering, replay, and operational requirements.

## Kafka's main units

| Unit           | Meaning                                   |
| -------------- | ----------------------------------------- |
| Topic          | Named stream of records                   |
| Partition      | Ordered log within a topic                |
| Offset         | Position inside one partition             |
| Consumer group | Consumers that divide partition ownership |
| Replica        | Another broker's copy of a partition      |

Kafka ordering is within a partition. Keying records by order ID can place an order's events together. There is no automatic total order across partitions. Partition-count changes can affect key placement unless the routing strategy accounts for them.

Under the usual consumer-group model, one partition has one active consumer within a group. Extra consumers beyond the partition count do not add partition-level parallelism. Different groups read independently.

## Commit position and side effects

If a consumer commits its offset before updating a database, a crash can skip the update. If it commits after the database update, a crash between the two can repeat the update. An idempotent consumer makes the second sequence safe.

Kafka transactions can coordinate Kafka writes and consumed offsets for supported processing flows. An unrelated database or HTTP charge remains outside that transaction boundary.

Rebalancing moves partition ownership. Slow processing can interfere with the consumer's liveness rules. Monitor lag, processing time, rebalance frequency, and failures together. Lag can grow because production increased or because consumption stalled.

## Retry and replay

Retrying in place preserves a partition's processing order but blocks later records. Retry topics let later work continue but can change order. A dead-letter destination stores failed work for diagnosis; it still needs ownership and a repair process.

Replay can rebuild read models. It must not repeat irreversible side effects. Connect replay policy to [deduplication retention](/microservices/outbox-and-delivery/) and [event sourcing](/microservices/cqrs-and-event-sourcing/).

## Sources

- [Apache Kafka: design](https://kafka.apache.org/41/design/design/)
- [Apache Kafka: consumer configuration](https://kafka.apache.org/41/configuration/consumer-configs/)
- [RabbitMQ: consumer acknowledgments and publisher confirms](https://www.rabbitmq.com/docs/confirms)
