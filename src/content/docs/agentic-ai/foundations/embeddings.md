---
title: Embeddings and semantic search
description: Understand vector representations, cosine similarity, nearest-neighbor retrieval, and the role of metadata filters.
---

An embedding model converts an item into a numeric vector. Items with related learned characteristics tend to occupy nearby regions of the vector space. Applications use that property to retrieve text that is semantically related to a query.

The embedding is not a summary you can read. It is an input to a similarity calculation.

![An embedding model maps text to a dense vector so related items can be found by distance, while similarity alone does not establish truth or authorization](/images/agentic-ai/vector/embeddings-similarity.svg)

## Generative and embedding models do different jobs

A generative model predicts output tokens. An embedding model produces a fixed-size representation for comparison or downstream learning. Some model families support both kinds of operation, but the outputs and evaluation criteria remain different.

An embedding pipeline normally uses the same embedding model and representation settings for stored documents and incoming queries. Changing the model can require rebuilding the index because vectors from unrelated spaces are not directly comparable.

## Cosine similarity compares direction

Cosine similarity measures the angle between vectors:

```text
cosine(a, b) = (a · b) / (||a|| ||b||)
```

For nonzero vectors, the result ranges from `-1` to `1`. A larger value means the vectors point in more similar directions. Some indexes store normalized vectors, which makes cosine similarity equivalent to a dot product for ranking.

A high similarity score means “near according to this model and representation.” It does not mean “factually supports the answer.”

## Vector search narrows candidates

Exact nearest-neighbor search compares the query with every stored vector. Approximate nearest-neighbor indexes trade a small amount of recall for much lower search cost. Common index families partition the space, build navigable graphs, or quantize vectors.

The right index depends on collection size, update rate, memory, latency, and acceptable recall. Measure it with your documents and queries.

## Metadata enforces scope before ranking

Store fields such as tenant, document type, product, language, and access group beside each vector. Apply authorization filters before returning candidates to the model.

Do not retrieve globally and ask the model to ignore unauthorized results. Once sensitive text enters the prompt, the confidentiality boundary has already failed.

## Hybrid search combines signals

Dense retrieval is useful for semantic similarity. Keyword methods are often better for exact identifiers, error codes, names, and rare terms. Hybrid search combines both result sets or scores, then may send candidates to a reranker.

The combination is an engineering choice, not a universal upgrade. Evaluate recall, precision, latency, and access-control behavior separately.

## Sources

- [Dense Passage Retrieval for Open-Domain Question Answering](https://arxiv.org/abs/2004.04906)
- [Efficient and robust approximate nearest neighbor search using Hierarchical Navigable Small World graphs](https://arxiv.org/abs/1603.09320)
