---
title: Agent reliability
description: Handle timeouts, retries, duplicate effects, fallbacks, partial failure, backpressure, and cancellation.
---

Agent reliability is the ability to reach a known state despite uncertain model output and ordinary distributed-system failure.

## Timeouts create uncertainty

A timeout tells the caller that a result did not arrive in time. It does not prove the dependency did nothing. Track whether an operation was never sent, rejected before execution, accepted with unknown outcome, or confirmed complete.

The distinction controls safe retry behavior.

## Retry reads more freely than writes

Retry an idempotent read after a transient failure within a deadline. Retry a write only when the operation has a stable idempotency key or the system can reconcile the external effect.

Use exponential backoff with jitter. Honor provider retry hints. Limit attempts and total elapsed time.

## Prevent duplicate agent jobs

Assign a stable request or task identity at admission. Deduplicate queue messages and tool effects by logical operation, not by one transport request identifier.

For a user request to create a ticket, every model retry and worker restart should reuse the same ticket-operation key.

## Use circuit breakers around failing dependencies

A circuit breaker stops sending ordinary traffic to a dependency that is failing repeatedly. It gives the dependency time to recover and prevents each agent run from waiting through the same timeout.

The open-circuit result must become a typed observation. The agent can choose an allowed fallback or return a partial result. It must not invent the missing data.

## Control concurrency and backpressure

Limit active model calls, tools, subagents, and tasks per tenant and dependency. A queue absorbs bursts only while it has a bounded backlog and an overload policy.

Reject, defer, or degrade work before resource exhaustion turns every request slow.

## Fallbacks need their own evaluation

A smaller fallback model may produce different schemas or tool choices. A second provider may interpret prompts differently. Test the fallback path with the same safety and task evaluations as the primary path.

Do not fall back from an authorized private model endpoint to a service that cannot receive the same data.

## Propagate cancellation

When the user cancels, stop scheduling new work. Cancel in-flight operations where supported. Mark external actions that may still complete and reconcile them later.

Cancellation is not rollback. Record completed effects.

## Sources

- [AWS Builders' Library: Timeouts, retries, and backoff with jitter](https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/)
