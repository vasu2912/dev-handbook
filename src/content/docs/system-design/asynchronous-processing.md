---
title: Asynchronous processing
description: Move slow work out of the request path with queues, workers, and back pressure.
sidebar:
  order: 14
---

<div data-anatomy="system-design--asynchronous-processing-1"></div>

*Concept redrawn from [Introduction to architecting systems for scale](http://lethain.com/introduction-to-architecting-systems-for-scale/#platform_layer).* 

Asynchronous workflows shorten user-facing requests by moving expensive work out of line. They can also compute results in advance, such as periodic aggregates. The trade-off is a delayed result and a state machine for pending, failed, and completed work.

## Message queues

A message queue receives, holds, and delivers messages. A typical job flow is:

1. The application publishes a job and returns a job ID or status to the client.
2. A worker claims the job, performs the work, and records the result.
3. The client reads the status later, or the system sends a completion event.

```text
client -> API -> queue -> worker -> database
   ^       |                       |
   |       +-- 202 Accepted -------+
   +---------- GET /jobs/{id} -----+
```

The user is not blocked by the worker. A social post can appear in the author's timeline immediately while fan-out to every follower happens later. The interface must say whether "accepted" means stored, queued, or complete.

<div data-anatomy="system-design--asynchronous-processing-2"></div>

Redis can act as a simple broker, but messages can be lost depending on configuration. RabbitMQ supports AMQP and requires node operations. Amazon SQS is hosted, but delivery can be delayed and a message can be delivered more than once. Make consumers idempotent and acknowledge only after durable progress.

## Task queues

A task queue carries a task and its related data, runs it, and can return a result. Task queues support scheduled or computationally intensive work. [Celery](https://docs.celeryproject.org/en/stable/) is a common Python-oriented task queue with scheduling support.

## Back pressure

Little's law relates the average number of items in a system to arrival rate and time in the system:

```text
items in system = arrival rate * time in system
```

If producers add work faster than workers finish it, the queue grows. An unbounded queue can exhaust memory, force disk reads, and make every job slower. Apply back pressure by limiting queue depth or admission rate. Once the queue is full, return a stable busy response such as HTTP 503 and let clients retry later with exponential backoff.

Monitor queue depth, oldest message age, processing time, retry count, and dead-letter volume. These metrics tell you whether more workers will help or whether the producer must slow down.

## When synchronous work is better

An inexpensive calculation or a real-time interaction may cost more to queue than to execute. Queues add serialization, storage, retries, and a delayed result. Use them when the work is slow, bursty, independently retryable, or can finish after the user response.

See [latency and throughput](/system-design/latency-and-throughput/) and [communication protocols](/system-design/communication-protocols/) for the request-time trade-offs.

## Further reading

- [Applying back pressure when overloaded](http://mechanical-sympathy.blogspot.com/2012/05/apply-back-pressure-when-overloaded.html)
- [Little's law](https://en.wikipedia.org/wiki/Little%27s_law)
- [What is the difference between a message queue and a task queue?](https://www.quora.com/What-is-the-difference-between-a-message-queue-and-a-task-queue-Why-would-a-task-queue-require-a-message-broker-like-RabbitMQ-Redis-Celery-or-IronMQ-to-function)
