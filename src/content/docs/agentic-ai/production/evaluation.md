---
title: Agent evaluation
description: Evaluate outcomes, trajectories, tools, retrieval, safety, latency, and cost before and after release.
---

An LLM evaluation scores a model output. An agent evaluation scores an execution. The final answer matters, but so do the tools chosen, arguments used, evidence gathered, effects created, budget spent, and policy decisions followed.

## Start from tasks with observable outcomes

An evaluation case should contain the starting state, user request, allowed actions, expected outcome, forbidden effects, and grading rules. Freeze or simulate external systems so the case can run again.

Include ordinary tasks, edge cases, ambiguous requests, dependency failures, unsafe requests, prompt injections, and cross-tenant attempts.

## Score the trajectory in parts

Useful measures include:

- Task completion
- Correct tool selection
- Correct tool arguments
- Unnecessary tool calls
- Repeated or looping actions
- Retrieval recall and evidence relevance
- Claim support and citation correctness
- Policy violations and unsafe effects
- Steps, latency, tokens, and cost
- Recovery after injected failures

One combined score hides why a system changed. Keep component measures even when a release gate uses a weighted decision.

## Use deterministic graders where possible

Code can check schemas, exact identifiers, database state, tool sequences, authorization outcomes, and forbidden calls. Human review can judge usefulness, ambiguity handling, and domain nuance.

An LLM judge can scale subjective comparisons, but it can be biased by style, position, verbosity, and shared model errors. Calibrate it against human-reviewed examples, randomize ordering for pairwise comparisons, and record the judge model and prompt.

## Build a golden set from real failures

Start with representative tasks from product requirements. Add every meaningful production incident and near miss after redaction. Preserve the failure category and expected behavior.

Do not tune only to a public benchmark. Your tools, permissions, documents, users, and failure modes define the relevant distribution.

## Separate offline and online evaluation

Offline evaluation runs before release and supports repeatable comparison. Online evaluation observes production outcomes, user corrections, abandonment, approval rejection, latency, and cost.

An online experiment involving real actions needs stronger safeguards than a text-only A/B test. Limit exposure, isolate risky tools, and define rollback conditions.

## Test the system, not the prompt alone

Version and vary the model, prompt, tool schema, retrieval settings, orchestration, and policy. A prompt regression suite that mocks every tool cannot reveal duplicate writes or broken identity propagation.

## Sources

- [NIST AI 600-1 Generative AI Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)
- [Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena](https://arxiv.org/abs/2306.05685)
