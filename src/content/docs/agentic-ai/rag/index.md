---
title: Retrieval-augmented generation
description: Understand how retrieval supplies current evidence to a model and where the approach can still fail.
---

Retrieval-augmented generation, or RAG, searches an external collection and places selected material in the model's context before generation. The model can then answer from evidence that was not encoded reliably in its parameters.

RAG is useful for private documents, current information, citations, and large collections that do not fit in one prompt.

<div data-anatomy="agentic-ai--rag-1"></div>

## RAG joins two imperfect systems

A RAG answer depends on both retrieval and generation:

```text
question -> retrieve candidates -> select evidence -> generate answer
```

If retrieval misses the needed passage, generation cannot use it. If retrieval succeeds, the model can still misread the passage or add an unsupported claim. Evaluate the stages separately.

## The index is not the source of truth

An index is a derived representation. Documents can be stale, duplicated, partially parsed, or removed without a matching index update. Preserve stable source identifiers, versions, access metadata, and links back to the authoritative record.

For a policy assistant, each chunk might carry:

```json
{
  "sourceId": "policy-returns",
  "sourceVersion": "2026-09-01",
  "section": "Damaged items",
  "tenantId": "store-42",
  "accessGroups": ["support", "returns"]
}
```

That metadata supports access filtering and lets a citation point to the exact source version.

## A complete pipeline has an offline and online path

The offline path parses sources, splits content, adds metadata, computes embeddings, and updates indexes. The online path interprets a query, applies authorization filters, retrieves candidates, reranks or selects them, constructs context, generates an answer, and returns citations.

Freshness connects both paths. A pipeline needs a rule for updates, deletions, failed indexing, and re-embedding after a model change.

## Refusal is a valid result

If retrieved evidence is missing, contradictory, unauthorized, or too weak, the system should say so. Forcing an answer converts an information gap into a confident guess.

The application can define a policy such as:

- Answer only when at least one selected passage supports the claim.
- Cite every externally verifiable claim.
- Report conflicts rather than merging them silently.
- Ask a clarifying question when the query lacks required scope.

These rules still need evaluation. A prompt alone cannot prove compliance.

## Sources

- [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401)
- [Dense Passage Retrieval for Open-Domain Question Answering](https://arxiv.org/abs/2004.04906)
