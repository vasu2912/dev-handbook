---
title: Agentic AI handbook
description: Build a clear model of language models, retrieval, agents, tools, subagents, MCP, safety, and production operation.
---

An agentic system gives a model a bounded way to gather information, choose an action, and observe what happened. The model supplies judgment where fixed rules are too rigid. Ordinary code still owns permissions, validation, budgets, durable state, and irreversible effects.

<div data-anatomy="agentic-ai-1"></div>

That division of work is the central idea in this handbook. A model may suggest that an incident needs a Kubernetes restart. It must not gain cluster-admin access merely because it produced a convincing explanation.

<div data-anatomy="agentic-ai-2"></div>

## Follow the dependency chain

<ol class="learning-flow" aria-label="Agentic AI learning path">
<li><a href="/agentic-ai/foundations/llms/">Language models</a><p>Understand tokens, context, attention, generation, embeddings, and structured output.</p></li>
<li><a href="/agentic-ai/rag/">Retrieval</a><p>Give a model current evidence without pretending that retrieval makes every answer true.</p></li>
<li><a href="/agentic-ai/agents/">Agents and tools</a><p>Place model decisions inside a loop with explicit actions, observations, and stop conditions.</p></li>
<li><a href="/agentic-ai/context-and-memory/">Context and memory</a><p>Choose what the model sees now and what the application keeps for later.</p></li>
<li><a href="/agentic-ai/multi-agent/">Subagents</a><p>Delegate only when isolation, specialization, or parallel work earns the extra coordination cost.</p></li>
<li><a href="/agentic-ai/mcp/">MCP</a><p>Connect hosts to tools and context through a versioned protocol with explicit trust boundaries.</p></li>
<li><a href="/agentic-ai/production/">Production engineering</a><p>Design for unsafe input, partial failure, traces, evaluation, latency, and cost.</p></li>
</ol>

## Keep five boundaries visible

Most production failures become easier to explain when you ask which boundary was blurred.

1. **The model proposes.** A model emits text or structured data. It does not grant itself authority.
2. **The application decides.** Deterministic code validates the proposal, checks policy, and chooses whether execution may continue.
3. **A tool acts.** A named operation touches a database, API, file, browser, queue, or other environment.
4. **State records what happened.** Durable state, not conversational prose, records commitments and recovery points.
5. **Evaluation checks the whole path.** A fluent final answer can hide a wrong tool, an unsafe argument, or a duplicate side effect.

An agent framework may package these boundaries, but it cannot remove them.

## Choose the right amount of autonomy

Use ordinary code when the inputs and rules are known. Use a workflow when the path is known but some steps need model judgment. Use an agent when the next useful step depends on evidence discovered during execution.

More autonomy creates more possible execution paths. Each path needs permissions, limits, observability, and tests. The most capable design is often the one that gives the model the smallest decision that still solves the problem.

## How these pages are written

Concept pages explain one mechanism and its trade-offs. Tutorials build a working example. Reference pages give exact terms, comparison tables, and checklists. Design walkthroughs apply the material to a complete system.

Start with the [learning path that matches your background](/agentic-ai/learning-paths/). Use the [question coverage index](/agentic-ai/reference/question-coverage/) when you want to trace the original 560-question study list into the handbook.

## Sources

- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629)
- [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401)
- [Model Context Protocol specification](https://modelcontextprotocol.io/specification/2026-07-28)
- [NIST Artificial Intelligence Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)

*Last verified: September 23, 2026.*
