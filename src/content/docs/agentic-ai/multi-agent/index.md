---
title: Multi-agent systems
description: Decide when specialized agents, supervisors, parallel work, and isolated contexts justify coordination cost.
---

A multi-agent system coordinates two or more agent loops. Each agent may have its own instructions, context, tools, model, permissions, and budget.

Multiple agents are an architecture choice, not a measure of maturity. Start with one bounded agent. Split it only when the boundary solves a concrete problem.

## Specialization can reduce context and authority

A research agent can receive read-only search tools and a small evidence task. An operations agent can receive a different context and a restricted set of diagnostic tools. Separation can reduce irrelevant context and make permission review clearer.

Specialization is useful when roles need different:

- Information
- Tools or credentials
- Models or latency targets
- Evaluation contracts
- Isolation from untrusted content

If every agent receives the full conversation and every tool, the design has added coordination without creating a meaningful boundary.

## Common coordination shapes

A **supervisor** assigns tasks and decides what happens next. Workers return bounded results.

A **router** selects one specialist and hands off responsibility.

A **fan-out and fan-in** design sends independent tasks in parallel and combines their results.

A **pipeline** passes a result through ordered roles. This is often a workflow with model steps rather than a genuinely agentic network.

A **peer conversation** lets agents exchange messages until a condition is met. It is difficult to bound and should be used only when the interaction itself has measurable value.

## Contracts matter more than personas

“You are a senior researcher” is a persona. A contract states the task, allowed sources, required evidence, output schema, deadline, and budget.

For example, a research worker can return:

```json
{
  "claim": "The deployment began failing after version 42",
  "evidence": ["trace:7f9", "deploy:42"],
  "confidence": "medium",
  "unresolved": ["The database migration status is unknown"]
}
```

The supervisor can validate this shape and inspect the evidence.

## Coordination creates new failures

Multi-agent systems can duplicate work, pass stale context, exceed budgets, deadlock, contradict one another, or wait forever for a failed worker. Trace each delegation and give every child task a deadline and cancellation path.

The parent owns the total budget. A child receives an allocation, not an unlimited model account.

## Resolve disagreement with evidence

Do not ask the supervisor to choose the most persuasive paragraph. Compare source quality, freshness, permissions, and direct observations. Preserve unresolved disagreement when the evidence does not settle it.

## When to avoid multiple agents

Keep one agent when the work is short, the same context is needed throughout, tools share one permission set, or a deterministic function can perform the “specialist” task. A function call is cheaper than a new loop.

## Sources

- [AutoGen: Enabling Next-Gen LLM Applications via Multi-Agent Conversation](https://arxiv.org/abs/2308.08155)
