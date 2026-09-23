---
title: Agentic RAG
description: Understand when an agent should plan, repeat, or adapt retrieval instead of using one fixed search.
---

Standard RAG runs a known retrieval path. Agentic RAG lets a model make bounded retrieval decisions during the task.

A useful agentic loop might decide to search, inspect results, split the question, search another collection, or stop because the evidence is sufficient. The extra flexibility earns its cost only when one fixed query often fails.

## The agent controls retrieval, not access

The model may choose a query or collection from an allowed set. Application code still applies identity, tenant, source, and classification filters. Delegating query planning does not delegate authorization.

## Common patterns

**Adaptive retrieval** skips retrieval when the task does not need external evidence and invokes it when it does.

**Iterative retrieval** uses an early result to form a later query. A product code found in one document may lead to a second search for its support policy.

**Query decomposition** turns a compound question into smaller evidence needs, then combines the supported results.

**Corrective retrieval** checks whether results appear useful and tries another query or source when they do not.

**Multi-hop retrieval** follows relationships across sources. Each hop needs provenance so the final answer can show how the evidence connects.

## Bound the loop

An agentic retriever needs stop conditions:

- Maximum retrieval rounds
- Maximum total candidates
- Token and cost limits
- Repeated-query detection
- A definition of sufficient evidence
- A rule for unresolved or conflicting evidence

Without these limits, the system can spend more without improving the answer.

## Carry evidence, not the whole search history

Later rounds need selected facts, unresolved questions, and provenance. They rarely need every rejected chunk. Keep a structured research state and place only the useful subset in model context.

```json
{
  "question": "May support refund invoice inv_42?",
  "known": ["invoice belongs to tenant store-7"],
  "missing": ["refund window", "agent permission"],
  "sources": ["invoice:inv_42"]
}
```

This state is easier to inspect and budget than a transcript of several searches.

## Evaluate the decision to retrieve

Measure whether the system retrieved when evidence was needed, avoided retrieval when it was not, selected useful queries, respected access controls, and stopped at the right time. Final-answer accuracy alone hides wasteful or unsafe trajectories.

## Sources

- [ReAct](https://arxiv.org/abs/2210.03629)
- [Self-RAG: Learning to Retrieve, Generate, and Critique through Self-Reflection](https://arxiv.org/abs/2310.11511)
