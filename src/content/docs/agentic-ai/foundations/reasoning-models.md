---
title: Reasoning models and test-time compute
description: What reasoning models do, what reasoning tokens cost, and when extra thinking helps or wastes money.
---

A standard model answers as it reads. A **reasoning model** first generates internal reasoning tokens, then produces the user-visible answer. The extra computation happens per request, at inference time, which is why the approach is called **test-time compute**.

The pattern exists because some tasks reward more deliberation. A research result showed that letting a model try, check, and revise during inference can beat a larger model that answers in one pass. DeepSeek-R1 showed that reinforcement learning can teach a model to produce useful reasoning chains without hand-written demonstrations.

## What changes for the application

Reasoning tokens are real work, not comments:

- They are **billed as output tokens**, so a "short answer" can still cost a long thinking session.
- They **add latency** in direct proportion to their length.
- Providers expose them differently. Some surface the reasoning text, some return only a summary or nothing, and some return signed blocks that must be passed back during tool use so the model can continue its own train of thought.
- In multi-turn conversations, earlier reasoning is usually not available to later turns. The provider either keeps it server-side or discards it. Do not build logic that assumes reasoning text from turn one is still in context in turn three.

Most providers expose a control for how hard the model thinks: a reasoning effort or thinking budget parameter. Raising it increases quality on hard tasks and cost on easy ones. Treat it like any other per-route configuration, not a global constant.

## When the extra compute pays

Reasoning models earn their cost when the task has a verifiable structure or requires planning:

- Multi-step diagnosis, such as reading logs and forming a hypothesis
- Math, scheduling, and constraint problems with checkable answers
- Code review and refactor planning, where the failure shows up later and is expensive
- Agentic planning, where a bad early decision compounds through the loop

They waste money on work that is already easy:

- Routing and classification with well-distinguished labels
- Extraction against a schema
- Chatty or short-form responses where latency dominates value
- High-volume steps inside an agent loop that run on every iteration

A common production pattern uses a strong reasoning model for planning and a fast model for execution steps. The [model routing guidance](/agentic-ai/production/performance-and-cost/) applies, with one addition: evaluate the router itself. Sending a hard task to a cheap model fails quietly.

## Interaction with agents and tools

Reasoning models change agent behavior in both directions:

- Planning quality improves, which can reduce the number of tool-call rounds.
- Each round gets more expensive, because the model can re-derive a full reasoning chain between tool calls.

Bound both sides. Keep the existing loop controls (step limits, token budgets, stop conditions) and add reasoning-specific checks: cost per task, reasoning length distributions, and a comparison of task completion with reasoning effort raised and lowered.

:::caution
Chain-of-thought text is a plausible narrative, not a truthful trace of the model's computation. Research on faithfulness shows reasoning text can omit real influences on the answer. Use it to debug behavior, but do not treat it as an audit record. Authority and approval stay in application code.
:::

## Prompting differences

Reasoning models reduce the value of some classic techniques. Asking the model to "think step by step" duplicates what it already does, and few-shot examples can pull its reasoning off its trained style. Providers recommend simple, goal-focused instructions instead. Structured output still applies to the final answer, and tool schemas follow the same rules as for other models.

## Evaluation changes

Add these checks to the evaluation plan:

- **Overthinking rate**: reasoning length on trivial inputs, which drives avoidable cost.
- **Effort curves**: quality and cost at low, medium, and high reasoning effort, so route selection has evidence.
- **Compounding checks**: for agent tasks, whether cheaper per-step reasoning produces fewer or more total rounds.

## Sources

- [Scaling LLM Test-Time Compute Optimally can be More Effective than Scaling Model Parameters](https://arxiv.org/abs/2408.03314)
- [DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning](https://arxiv.org/abs/2501.12948)
- [OpenAI: Reasoning models guidance](https://platform.openai.com/docs/guides/reasoning)
- [Anthropic: Extended thinking](https://docs.claude.com/en/docs/build-with-claude/extended-thinking)
- [Language Models are Few-Shot Learners](https://arxiv.org/abs/2005.14165)

*Last verified: October 17, 2026.*
