---
title: GraphRAG
description: Knowledge-graph retrieval for questions that vector similarity cannot answer, and the indexing cost it charges.
---

Vector retrieval answers local questions. "What does the refund policy say about subscriptions" matches chunks by similarity, and that works. It fails on global questions ("what are the main themes across these 4,000 incident reports") and on multi-hop questions ("which suppliers of component X are exposed to sanctions in country Y"), because the answer is spread across many chunks that are not similar to the query or to each other.

GraphRAG attacks that weakness by extracting structure into a knowledge graph at index time.

## The pipeline

The Microsoft GraphRAG paper and library define the reference pipeline:

1. **Extract.** A model reads each chunk and extracts entities, relationships, and claims. This is the expensive step: one or more model calls per chunk.
2. **Build the graph.** Entities become nodes; co-occurrence and extracted relationships become edges.
3. **Detect communities.** A clustering algorithm such as Leiden groups densely connected nodes into hierarchies.
4. **Summarize.** The model generates a summary for each community, and for larger graphs, summaries of summaries.

At query time, two search modes use that structure:

- **Local search** starts from entities in the query, pulls their neighborhoods, and answers with connected detail. It competes with vector RAG on the questions vector RAG handles well.
- **Global search** maps over community summaries and reduces the results into an answer. It covers corpus-wide questions that chunk retrieval cannot serve, because no single chunk contains the answer.

## What it costs

GraphRAG shifts spend from query time to index time:

- Indexing cost scales with corpus size and graph density. Every chunk needs extraction calls, and dense graphs produce more community summaries to maintain.
- Updates are not a simple upsert. A new document can connect existing entities, which can change communities and invalidate summaries.
- Answers on local questions are rarely better than a tuned vector pipeline, so the graph earns its cost only when relationship structure carries the answer.

## Choosing a retrieval structure

| Signal | Reach for |
|---|---|
| Factoid lookup over documents | Vector plus keyword [hybrid search](/agentic-ai/rag/retrieval-pipeline/) |
| Queries with filters (tenant, date, type) | Hybrid search with metadata filters |
| Multi-hop or relationship questions | GraphRAG local search |
| Corpus-wide themes, summaries, and comparisons | GraphRAG global search |
| Mixed traffic | Both: a vector index for lookups, a graph for structure-heavy queries |

A cheaper middle path exists before adopting a full graph pipeline: summarize documents and sections into the index, and use them as additional retrieval targets. Measure whether global questions improve before paying GraphRAG's indexing bill.

## Operational notes

- Scope the graph per tenant. Graph construction mixes access levels quickly, and the [tenant isolation](/agentic-ai/security/identity-and-sandboxing/) guarantees must hold over graph traversal.
- Evaluate global answers differently. There is no single "correct chunk", so the [evaluation](/agentic-ai/production/evaluation/) needs claim-level checks against source documents, or graded sample answers.
- Treat extraction as a pipeline release. Change the extraction prompt or model, and the graph changes; re-run evaluation over a fixed question set before and after.

## Sources

- [From Local to Global: A Graph RAG Approach to Query-Focused Summarization](https://arxiv.org/abs/2404.16130)
- [Microsoft GraphRAG documentation](https://microsoft.github.io/graphrag/)
- [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401)

*Last verified: October 17, 2026.*
