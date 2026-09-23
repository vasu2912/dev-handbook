---
title: Transformers and attention
description: Build a practical model of embeddings, positions, self-attention, feed-forward layers, and causal generation.
---

The Transformer processes token representations through repeated attention and feed-forward layers. Attention lets each token representation combine information from other allowed positions in the sequence.

The original Transformer used an encoder and a decoder for sequence-to-sequence work. Many generative language models use a decoder-style stack with causal masking, which prevents a position from attending to future output tokens.

![Attention combines information from other token positions by comparing queries and keys and weighting their values](/images/agentic-ai/vector/transformer-attention.svg)

## Tokens become vectors

The model maps each token identifier to a learned vector. It also needs position information because attention alone does not know whether one token came before another. Implementations add or encode position through learned or computed representations.

The result is a sequence of vectors. Each layer updates those vectors.

## Self-attention mixes information across positions

For each position, the layer computes query, key, and value representations. A query scores keys at other permitted positions. A normalized score weights the corresponding values. The weighted combination becomes part of the position's next representation.

In compact form:

```text
Attention(Q, K, V) = softmax(QKᵀ / √dₖ)V
```

The scaling term keeps dot products from growing too large as the key dimension increases. The softmax turns scores into weights that sum to one for each query.

## Multiple heads learn different projections

Multi-head attention runs several learned projections in parallel, concatenates their results, and projects them again. A head is not guaranteed to represent one human-readable relation. The design gives the layer several ways to combine information.

## Feed-forward layers transform each position

After attention mixes information between positions, a feed-forward network transforms each position independently. Residual connections and normalization help information and gradients move through a deep stack.

The repeated combination matters:

- Attention moves information between positions.
- Feed-forward layers transform the information at each position.
- Residual paths preserve and refine prior representations.

## Causal masking supports next-token generation

During causal generation, position `n` can attend to earlier positions but not to token `n + 1`, which has not been generated. Training can compute many positions in parallel because the target sequence is known. Inference produces tokens one after another, although implementations cache prior key and value representations to avoid recomputing the whole prefix.

## Attention is not an explanation of intent

Attention weights are internal computation, not a complete explanation for why a model produced a result. Production systems need observable inputs, outputs, tool calls, policy decisions, and state changes. A colorful attention heatmap cannot replace an audit trail.

## Sources

- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- [Attention is not Explanation](https://arxiv.org/abs/1902.10186)
