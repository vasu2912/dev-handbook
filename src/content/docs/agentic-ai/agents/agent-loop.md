---
title: The agent loop
description: Understand observation, model decision, validation, action, feedback, and termination.
---

An agent loop repeats a small sequence: assemble the current state, ask the model for the next proposal, validate it, execute an allowed action, and record the observation.

```text
state -> model proposal -> policy checks -> action -> observation -> new state
```

The loop belongs to application code. A model can propose that the task is complete, but the application decides whether the proposal satisfies the completion rule.

![A bounded agent loop observes state, decides the next step, acts through a tool, records the result, and checks completion, budget, and policy stops](/images/agentic-ai/vector/agent-loop.svg)

## State makes the loop inspectable

Store the information that the next step needs in a structured state object. Do not force the model to reconstruct progress from prose.

```ts
type AgentState = {
	goal: string;
	step: number;
	completed: string[];
	observations: Observation[];
	remainingBudgetCents: number;
	status: 'running' | 'waiting_for_approval' | 'completed' | 'failed';
};
```

The conversation can remain useful context, but it should not be the only execution record.

## A proposal has several possible outcomes

The model may propose:

- A tool call
- A request for missing information
- A request for approval
- A delegation
- A final answer
- A declaration that the task cannot be completed

Represent these outcomes explicitly. Free-form text followed by string matching is a fragile control protocol.

## Stop conditions belong outside the model

Every loop needs hard limits:

- Maximum iterations
- Maximum elapsed time
- Token and monetary budgets
- Maximum repeated action count
- Cancellation
- A terminal success or failure state

A model instruction such as “do not loop forever” is not an execution limit.

## Detect no progress

Two calls may differ in wording while repeating the same action. Compare normalized tool names and arguments, state changes, and new evidence. If the same proposal produces no new observation several times, stop or ask for help.

The limit depends on the task. A polling tool may repeat legitimately when it has a delay and a known terminal condition. A database lookup repeated with identical arguments usually does not.

## Verify before declaring success

Completion should depend on observable state. A coding agent should run the requested tests and inspect their exit status. A ticketing agent should receive the created ticket identifier. An operations agent should check the service health signal after a remediation.

The model's statement that an action succeeded is not evidence that the environment changed.

## Sources

- [ReAct](https://arxiv.org/abs/2210.03629)
