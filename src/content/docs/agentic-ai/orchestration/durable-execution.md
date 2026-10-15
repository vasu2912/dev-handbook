---
title: Durable agent execution
description: Design checkpoints, idempotency, retries, queues, compensation, and recovery for long-running agent work.
---

An in-memory agent loop disappears when its process crashes. Durable execution records enough state to resume work without repeating completed effects.

<div data-anatomy="agentic-ai--orchestration--durable-execution-1"></div>

## Checkpoint at meaningful boundaries

A checkpoint should record the state before or after an external effect, along with the operation identity. The recovery code must know whether it is safe to repeat the step.

For a ticket-creation action:

```text
planned -> approval recorded -> create requested -> external ticket ID recorded
```

If the process crashes after the remote system creates the ticket but before the local record stores its ID, a blind retry can create a duplicate. An idempotency key or reconciliation lookup closes that gap.

## Classify failures before retrying

Retry transient connection failures, rate limits with a retry window, and dependency unavailability when the operation is safe to repeat. Do not automatically retry invalid arguments, denied permissions, failed policy checks, or destructive operations without idempotency.

Use bounded exponential backoff with jitter. A deadline should cap the full operation, not restart on every attempt.

## Exactly-once effects are not a queue setting

Queues commonly deliver at least once. A worker can finish the external effect and crash before acknowledging the message. The broker sends it again.

Make the consumer idempotent or use a transactional boundary that includes the durable record under your control. Across independent systems, reconciliation is often more honest than an exactly-once claim.

## Compensation is a business action

A distributed workflow cannot roll back an email already sent or a payment settled by another service. A compensating action creates a new effect that addresses the earlier one, such as issuing a refund or closing a duplicate ticket.

Define which steps are compensatable, which are irreversible, and who approves compensation. Record both actions in the audit trail.

## Dead-letter queues preserve failed work

Move work to a dead-letter queue after the retry policy is exhausted. Include stable identifiers, failure classification, attempt count, and a pointer to redacted trace data. Do not copy raw secrets or full prompts into the message.

An operator needs a safe replay path. Replaying should reuse the logical operation identity.

## Resume with current policy

A task can wait for hours while permissions, tools, or policies change. On resume, recheck authorization and high-risk preconditions. Do not treat an old checkpoint as a permanent grant.

## Sources

- [AWS Builders' Library: Making retries safe with idempotent APIs](https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/)
- [Microservices.io saga pattern](https://microservices.io/patterns/data/saga.html)
