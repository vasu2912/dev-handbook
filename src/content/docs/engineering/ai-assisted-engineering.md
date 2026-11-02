---
title: Engineering with AI assistants
description: How working engineers use AI coding assistants and agents without giving up ownership, safety, or delivery stability.
---

Interviews now include the question "how do you use AI in your workflow" for plain backend roles, and the answer separates teams in measurement, not enthusiasm. AI assistants write, review, explain, and refactor code, and production incidents have already followed careless use. The engineering discipline around them is the part worth talking about.

## What the research says

The DORA 2024 report found that higher AI adoption correlated with an estimated increase in delivery throughput and, in the same population, a decrease in delivery stability. More shipped, more broken. The honest reading is that AI increases output volume and that volume outpaces process discipline unless teams invest in reviews, tests, and system boundaries. Treat that finding as the physics of the tool, not an argument against it. The DORA 2025 report extends the point: AI amplifies an organization's existing strengths and dysfunctions.

## Where assistants earn their keep

- Boilerplate and scaffolds: request handlers, test fixtures, migrations, CI stubs.
- Explaining unfamiliar code and tracing a path through a large codebase before you change it.
- Drafting outbox handlers, retry loops, and other patterns where correctness comes from following a known recipe the repository can verify.
- Mechanical refactors with verifiable equivalence: renames, type tightening, moving a module.

## Where they fail, and how the failure looks

- **Novel context.** Your deployment rules, quirk-heavy business logic, and tribal constraints are training data the model never saw, and the model does not know what it does not know.
- **Confident wrongness.** The failure is not a syntax error, it is a plausible buffer size, an off-by-one, or a subtly wrong SQL join that passes a happy-path test. Review effort rises to meet polish.
- **Plausible identifiers.** Models invent package and API names. Installing a hallucinated package name is a supply-chain attack surface, which researchers have documented as "package hallucination"; verify every dependency against the real registry before adding it.
- **Injection through input.** A model with repository access follows instructions it finds: README badges, code comments, dependency lockfiles, CI logs. Coding agents need the same [prompt injection](/agentic-ai/security/prompt-injection/) defenses as any agent, scoped credentials, and read-only defaults for anything that is not the task's own workspace.

## The ownership contract

Keep one rule fixed: **the engineer who merges owns the change as if they wrote it.** Operationally:

1. Tests are the arbiter. Author or confirm failing tests first when fixing a bug; no generated code merges past red.
2. Review diffs like a colleague's PR. Read the diff, not the summary, and reject changes you cannot explain line by line.
3. Small, bounded tasks beat monsters. "Add the outbox table and writer for one event" verifies cleanly; "add reliable eventing" does not.
4. Deterministic gates stay. Lint, type checks, test suites, and [review](/engineering/testing/) run in CI on AI-authored code exactly as on human code. Shift review attention toward architecture and correctness, away from formatting the machine already handles.
5. Secrets stay out of prompts. Credentials, customer data, and PII do not go into model context; assistant configuration points at policy files, not your shadow password file.

## Working with agentic tools

Coding agents (terminal and IDE-embedded) change the loop from "prompt, read, edit" to "state a goal, supervise, review". That trade needs two adjustments:

- **Context curation is part of the job.** A short repository guide for agents (routes, test commands, invariants) steers them better than a long chat transcript. Keep that guide in the repository and treat it like documentation.
- **Bound the blast radius.** Run agents in sandboxes or worktrees, give them a scoped identity, and keep write access to branches and MCP resources narrow. A review checkpoint before merge is the same approval boundary used by every agent design in this handbook.

## Measuring the workflow

Interesting metrics are engineering ones, not generation counts:

- Rework and rollback rate on AI-assisted changes versus the baseline
- Change failure rate and review latency trend as adoption grows
- Defect mix: do failures now come from misunderstood requirements rather than typos? That trade is normal; watch where it lands.
- Time-to-understand for the codebase: if agents lower onboarding cost, that is a retention-relevant win.

## The interview version

A strong answer states a boundary and a verification plan. Something like: "I let assistants draft and explore, I gate everything on tests I can read, I keep credentials and tenant data out of prompts, and I measure rework, because the DORA data says the risk is volume outrunning stability." Doctrine-free stall answers rehearse better than enthusiasm.

## Sources

- [DORA Accelerate State of DevOps Report 2024](https://dora.dev/research/2024/dora-report/)
- [DORA Accelerate State of DevOps Report 2025](https://dora.dev/research/2025/dora-report/)
- [We Have a Package for You! A Comprehensive Analysis of Package Hallucinations by Code Generating LLMs](https://arxiv.org/abs/2406.10279)
- [OWASP Top 10 for LLM Applications 2025](https://genai.owasp.org/llm-top-10/)

*Last verified: October 17, 2026.*
