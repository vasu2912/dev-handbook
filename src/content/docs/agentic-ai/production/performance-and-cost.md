---
title: Agent performance and cost
description: Control model selection, context, parallel work, caching, budgets, and the latency added by agent loops.
---

Agent cost grows with every model turn, retrieved token, tool call, subagent, retry, and evaluator. Latency grows along the critical path.

Measure cost per successful task, not cost per model request.

## Draw the critical path

Separate sequential operations from parallel ones. If an agent makes three model calls and two tools in sequence, their latencies add. Parallel retrieval can help only when the branches are independent and the join does not wait on unnecessary work.

Trace data should show model queue time, generation time, tool latency, subagent time, and approval wait separately.

## Reduce context before changing models

Remove irrelevant history, duplicate tool descriptions, rejected retrieval candidates, and verbose tool output. Keep structured state and selected evidence. Reserve output space.

Prompt caching can reduce repeated input cost for stable prefixes when a provider supports it. Organize stable instructions and tool definitions consistently to improve cache reuse, but do not let cache design obscure current policy.

## Route tasks by required capability

Use a smaller or faster model for classification, extraction, or routing only after evaluation proves it meets the contract. Use a stronger model where planning or ambiguous synthesis needs it.

Different subagents can use different models. The parent still owns the total budget and must handle incompatible context limits or structured-output behavior.

## Cache only when the key captures correctness

An LLM response cache key may need model version, prompt version, normalized input, tool set, user scope, and data version. Semantic caching adds approximate matching and therefore another chance to return the wrong answer.

Do not cache authorization decisions, secrets, volatile operational state, or user-specific answers under shared keys. Tool-result caching needs the same freshness and tenant rules as the underlying data.

## Set budgets before execution

Track maximum steps, input tokens, output tokens, elapsed time, model spend, tool spend, and subagent allocations. Decide what result the user receives when a limit is reached.

Reserve budget for verification. An agent that spends everything on research and cannot check the result has optimized the wrong phase.

## Multi-agent systems need a cost justification

Parallel agents can reduce elapsed time while increasing total tokens and peak load. Sequential debate can multiply both latency and cost. Compare the design with one agent plus ordinary functions before accepting the added coordination.
