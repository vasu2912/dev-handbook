---
title: Reliability and failure
description: A compact reference for timeouts, retries, queues, and graceful degradation.
sidebar:
  order: 17
---

Reliability is a property of the whole request path. A healthy application cannot produce a reliable response when its database, network, or downstream provider has no usable response.

## Bound waiting with timeouts

Set a deadline for every network call. Keep each dependency deadline inside the caller's deadline, with time left to validate and return a response. Without a timeout, one stuck dependency can consume every worker and turn a partial outage into a full outage.

## Retry only safe work

Retry when the error may recover and the operation can be repeated safely. Limit attempts and use exponential backoff with jitter. If 100 requests each retry three times, a failing dependency can receive 400 calls. A retry policy belongs in capacity planning.

An idempotency key lets a server recognize a repeated request, which matters for operations such as charging a card. Read [communication protocols](/system-design/communication-protocols/) for idempotency and [asynchronous processing](/system-design/asynchronous-processing/) for queue retries.

## Use queues for isolation

A queue lets a producer finish before a consumer completes slow work. This helps with bursts and protects the request path. It also requires explicit pending, failed, and duplicate states. Make consumers idempotent because a message may be delivered again after a timeout or consumer crash.

## Degrade on purpose

When an optional dependency fails, return the core result and mark the optional part unavailable. When a required dependency fails, return a stable error and preserve telemetry for investigation. Do not return an empty success response that hides the difference between "empty" and "unavailable".

The [availability patterns](/system-design/availability-patterns/) page covers failover and availability budgets. The [security overview](/system-design/security-overview/) covers layered controls for failures caused by untrusted input.
