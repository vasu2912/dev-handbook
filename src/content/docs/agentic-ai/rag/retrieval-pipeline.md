---
title: Build the retrieval pipeline
description: Understand parsing, chunking, indexing, query transformation, filtering, reranking, and context assembly.
---

A retrieval pipeline turns source material into candidates that fit both the user's question and the user's permissions. Most quality problems begin before the model receives any text.

## Parse structure before splitting text

Keep headings, tables, code blocks, list boundaries, page references, and source identifiers when the source format provides them. Flattening a policy manual into one string removes signals that later help chunking and citation.

Parsing failures need visibility. If a PDF extractor returns an empty page or reverses table columns, indexing the result makes the failure harder to find.

## Chunk around meaning

Chunk size is a trade-off. Large chunks preserve context but consume prompt space and may mix unrelated topics. Small chunks improve focus but can separate a statement from its definition, exception, or heading.

Use source structure first. Apply a token limit second. Overlap can repeat boundary text, but large overlap increases index size and produces near-duplicate results.

Record the parent document and neighboring chunk identifiers. The online path can expand around a good match when the surrounding context matters.

## Keep access metadata with every retrievable unit

The retriever must know which tenant, user, group, classification, and source version apply to a chunk. Filter unauthorized content before similarity scoring or reranking returns it to application code.

An access-control list copied once and never updated is another stale index. Treat permission changes as index updates.

## Use the query your collection needs

The user's wording may be too vague, conversational, or broad for retrieval. Query rewriting can add resolved references and domain terms. Query decomposition can split a multi-part question into searches that need different evidence.

Every transformation can also change intent. Preserve the original query, log the derived queries with suitable redaction, and evaluate whether the transformations improve recall without crossing scope.

## Retrieve broadly, then spend more to rerank

The first stage should find a manageable candidate set with low latency. A reranker can then compare each candidate with the full query using a more expensive model.

The final context builder removes duplicates, balances sources, preserves provenance, and fits the token budget. Ranking score alone should not erase source diversity or access policy.

## Make absence observable

Track why a query produced no usable context:

- No candidate passed access filters.
- The index had no close match.
- The reranker rejected all candidates.
- The context budget removed required evidence.
- The source had not been indexed or was stale.

“No documents” is not one failure mode.

## Sources

- [Dense Passage Retrieval for Open-Domain Question Answering](https://arxiv.org/abs/2004.04906)
- [SentencePiece](https://arxiv.org/abs/1808.06226)
