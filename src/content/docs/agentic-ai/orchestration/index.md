---
title: Agent orchestration
description: Control steps, branches, budgets, approvals, concurrency, and termination around model decisions.
---

Orchestration is the application logic that turns model proposals into a controlled execution. It owns sequence, branching, retries, timeouts, budgets, approvals, checkpoints, and terminal states.

A prompt may describe the process. The orchestrator enforces it.

## Start with explicit states

Name states that matter to recovery or policy. `running` alone is rarely enough. A consequential workflow might distinguish `planning`, `waiting_for_approval`, `executing`, `verifying`, `compensating`, `completed`, and `failed`.

State names make impossible transitions visible. A rejected plan cannot enter `executing` unless code provides such a transition.

## Use deterministic edges for hard rules

Route with code when the condition is exact:

- A budget reached zero.
- An approval is absent.
- A schema failed validation.
- A tool returned a nonretryable error.
- Every required result is present.

Use a model when the branch depends on interpretation, such as classifying an ambiguous request. Validate the classification against the allowed branch set.

## Parallelize independent work

Two reads can run in parallel when neither depends on the other. Parallel execution lowers elapsed time but increases peak load and complicates cancellation, budget allocation, and aggregation.

Do not parallelize writes that require ordering or compete for the same invariant. Do not launch ten subagents merely because the framework makes fan-out convenient.

## Make budgets part of state

Track remaining steps, time, tokens, model spend, and tool spend. Reserve enough budget for verification and a useful final response. A subagent should receive a portion of the parent budget rather than an unlimited account.

When a budget is exhausted, produce a defined result such as `incomplete_budget_exhausted`. Do not let the model hide partial completion behind confident prose.

## Cancellation is an execution path

Cancellation should stop future model calls and prevent queued actions from starting. Propagate it to tools and subagents where their APIs support cancellation. Record which effects had already committed.

## A queue separates user latency from task duration

Long-running work belongs in durable execution. The request can return a task identifier while workers continue. The queue provides delivery, not exactly-once effects. Consumers still need idempotency and recovery.

Read [durable execution](/agentic-ai/orchestration/durable-execution/) for checkpoints, retries, and compensation.
