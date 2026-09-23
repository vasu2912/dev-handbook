---
title: Planning and control
description: Compare ReAct, plan-and-execute, state machines, reflection, and deterministic orchestration.
---

Planning gives an agent a representation of future work. Control decides which parts of that representation may run, when the plan needs revision, and when execution stops.

The useful question is not whether an agent can make a plan. It is which decisions the application can safely leave to the model.

## ReAct interleaves thought and action

The ReAct pattern alternates model reasoning with actions and observations. It fits tasks where each result changes the next useful step, such as research or diagnosis.

Its weakness is local decision-making. The agent can drift, repeat itself, or spend the budget without maintaining a coherent global plan. Structured state and stop conditions reduce that risk.

## Plan-and-execute separates roles

A planner produces tasks or milestones. An executor works through them. The system can inspect, approve, reorder, or parallelize the plan before action.

This pattern helps when the work has expensive actions or useful parallel branches. It adds another failure mode: the initial plan can become stale as new evidence arrives. Plans need revision rules rather than blind execution.

## State machines keep control explicit

A state machine defines allowed states and transitions in code. A model may choose among permitted transitions or supply data for one transition.

For a change agent:

```text
draft -> reviewed -> approved -> executing -> verified
                     \-> rejected
executing -> compensating -> failed
```

The model cannot jump from `draft` to `executing` because that edge does not exist.

## Graphs express branching and joins

A graph lets several tasks run in parallel and later converge. Conditional edges can use deterministic predicates or bounded model classification. Checkpoints make graph state resumable.

Graph orchestration is useful when path visibility, recovery, and human approval matter more than free-form autonomy.

## Reflection is another model call

Reflection asks a model to critique or revise prior work. It can catch some errors, but the critic can share the same blind spots as the original call. Reflection also adds latency and cost.

Use external evidence where possible. A compiler, schema validator, test suite, policy engine, or second data source provides a different kind of signal than another request to the same model.

## Keep business invariants deterministic

Models can choose how to investigate a failed payment. Code should decide that a settled payment cannot be captured twice. Models can draft an access request. An authorization service should decide whether the requested scope is allowed.

This division keeps flexible judgment near ambiguity and hard guarantees near state changes.

## Sources

- [ReAct](https://arxiv.org/abs/2210.03629)
- [Tree of Thoughts](https://arxiv.org/abs/2305.10601)
