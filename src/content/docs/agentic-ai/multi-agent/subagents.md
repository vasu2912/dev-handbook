---
title: Subagents and handoffs
description: Delegate bounded work with small context, scoped tools, clear return contracts, deadlines, and cancellation.
---

A subagent is an agent invoked by another agent or orchestrator. It receives a bounded task and returns a result to its parent.

The parent should delegate an outcome, not its entire uncertainty.

<div data-anatomy="agentic-ai--multi-agent--subagents-1"></div>

## Pass the minimum complete context

A useful subagent request contains:

- The task and success condition
- Relevant evidence and identifiers
- Allowed tools and sources
- Output contract
- Deadline and budget
- Known constraints

Do not pass the full conversation by default. It wastes tokens, leaks unrelated information, and lets earlier untrusted content influence another role.

## A tool is often enough

Use a tool when the task has one stable operation. Use a subagent when the task needs its own observe-decide-act loop.

`lookupCustomer(customerId)` is a tool. “Investigate why this customer's last three orders failed, using order and payment read tools, then return cited findings” can justify a subagent.

## Handoff transfers responsibility

Delegation normally returns control to the parent after a bounded result. A handoff transfers the ongoing interaction to another agent. The receiving agent needs enough context to continue, and the system needs a record of which agent currently owns the task.

Use handoffs for clear routing, such as language or product specialization. Avoid chains in which agents hand the user back and forth without progress.

## Limit recursive delegation

Set maximum depth, total child count, and per-child budgets. Propagate cancellation. Prevent a child from invoking a peer that later invokes the parent again unless the graph explicitly allows that cycle.

Recursion can be useful for hierarchical task decomposition, but it needs the same termination rules as any other loop.

## Aggregate structured results

For parallel research, combine claims by stable topic or question. Deduplicate repeated evidence. Preserve provenance. Mark conflicts.

The aggregator should not turn three weak, copied claims into one high-confidence claim merely because several agents repeated the same source.

## Handle timeout as a partial result

When one child times out, cancel its remaining work and decide whether the parent can continue with partial evidence. Record which branch is missing. Do not silently replace “worker did not finish” with “no issue found.”

## Evaluate delegation

Measure whether the parent delegated the right task, supplied enough context, selected an appropriate worker, stayed within budget, and used the returned evidence correctly. Evaluating only the final answer misses poor coordination.
