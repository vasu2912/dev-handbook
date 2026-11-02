---
title: "Vector index internals"
description: "How approximate nearest-neighbor search works: exact search, IVF, HNSW, quantization, filtered search, and the operational costs of each."
---

An embedding model maps text to vectors. An index answers the query "which stored vectors are closest to this one" fast enough to serve traffic. The two jobs are separate, and interviews test the second one: what the index trades for speed, and when those trades lose data you needed.

## The baseline: exact search

Exact (flat) search compares the query with every vector. It is simple, always finds the true nearest neighbors, and scales linearly with corpus size. For a few hundred thousand vectors with batch queries on modern hardware, exact search is often fast enough. Do not add approximation machinery before measuring this baseline.

Approximate nearest-neighbor (ANN) indexes buy speed with a recall guarantee instead of an exact one: they promise to find most of the true neighbors, tunable by parameters, usually with a measured recall@k against a ground-truth set.

## IVF: cluster first, search nearby

Inverted file (IVF) indexes cluster the vectors with k-means. A query compares against only the cells nearest to it instead of the whole corpus.

- `nlist` sets the number of cells; the query probes `nprobe` of them.
- Raising `nprobe` raises recall and latency together.
- Vectors near cell boundaries may live in a distant cell, which is the recall leak.
- Cells need periodic retraining as the corpus drifts.

IVF is compact and simple, and it degrades on filtered queries because the filter can empty the probed cells.

## HNSW: a graph with express lanes

Hierarchical Navigable Small World (HNSW) indexes build a multi-layer proximity graph. The top layers are sparse; each layer below adds density. A search greedily walks from the entry point through the top layer toward the query, then descends and repeats with finer resolution until the bottom layer returns the candidates.

Its behavior in production:

- Very high recall with low latency, which made it the default in most engines.
- `M` (links per node), `efConstruction`, and `efSearch` trade memory, build time, and recall against each other. Raising `efSearch` raises recall and latency without a rebuild.
- Memory is the weakness: the graph stores the vectors plus link lists, so HNSW on hundreds of millions of vectors wants compression or sharding.
- Build cost and insertion cost are real. Bulk-load offline, then insert incrementally.
- Deletions are awkward. Engines mark tombstones and compact later; graphs degrade if deleted nodes are only hidden.

## Compression: PQ and SQ

Product quantization (PQ) splits each vector into segments and quantizes each segment against a learned codebook, storing short codes instead of full floats. Scalar quantization (SQ) stores each dimension in fewer bits. Compression cuts memory by 4x to 32x and speeds scans, at a recall cost you tune and measure. The usual pairing is IVF or HNSW over compressed vectors, with exact rescoring of the top candidates against full-precision vectors when the last bit of recall matters.

## Filtered search is where naive designs fail

Real retrieval never searches the whole corpus. Queries carry tenant IDs, ACLs, dates, and document types, so the index must combine similarity with predicates:

- **Post-filtering** fetches the top-k by similarity, then drops forbidden results. When a tenant filter removes most of the top-k, the user gets few or zero results even though matching documents exist.
- **Pre-filtering** applies the predicate first. On graph indexes, a filtered subgraph can fragment and break navigation.

Engines handle this differently. pgvector filters in SQL and lets the planner decide between index scan and sequential scan. Dedicated engines implement filtered HNSW or store-and-refine strategies. Whatever the engine, treat access control as a query-time guarantee and test it with adversarial cases: a tenant whose documents are all outside the top-k. The [identity and sandboxing](/agentic-ai/security/identity-and-sandboxing/) page covers the authorization side; the index must not become a bypass.

## Operations

| Concern | What to watch |
|---|---|
| Recall | Measure recall@k against an exact-search ground truth after every embedding model, parameter, or corpus change |
| Memory | Budget vectors, graph links, and compression together; HNSW memory is roughly `vectors × (dimensions × 4 bytes + links)` |
| Freshness | Upserts and tombstones vs periodic rebuilds; embedding model changes require a full re-embed |
| Multi-tenancy | Filter correctness first; shared indexes need enforced tenant predicates |
| Portability | Index formats are engine-specific; plan exports and re-embeds for provider changes |

Changing the embedding model invalidates the entire index. Plan the re-embed as a migration with a shadow index, dual reads, and a cutover, not as an in-place edit.

## Sources

- [Hierarchical Navigable Small World graphs (HNSW)](https://arxiv.org/abs/1603.09320)
- [FAISS: A library for efficient similarity search](https://github.com/facebookresearch/faiss)
- [FAISS wiki: Running with GIL and speed benchmarks](https://github.com/facebookresearch/faiss/wiki)
- [pgvector documentation](https://github.com/pgvector/pgvector)
- [Jégou, Douze, Schmid: Product Quantization for Nearest Neighbor Search (TPAMI 2011)](https://hal.science/inria-00514462v2/document)
- [OpenSearch: k-NN documentation](https://opensearch.org/docs/latest/search-plugins/knn/index/)

*Last verified: October 17, 2026.*
