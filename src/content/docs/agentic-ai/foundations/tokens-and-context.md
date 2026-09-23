---
title: Tokens and context windows
description: Understand tokenization, context accounting, truncation, and why more context can still produce worse answers.
---

A model does not receive text as words. A tokenizer converts text into integer token identifiers drawn from a fixed vocabulary. The model processes those identifiers and later converts generated identifiers back into text.

One token may represent a whole short word, part of a longer word, punctuation, whitespace, or a byte sequence. Token counts therefore vary by language, formatting, and tokenizer.

![Text is converted into tokenizer-specific token IDs, which share a context-window budget with instructions, history, evidence, tool results, and output](/images/agentic-ai/vector/tokenization-context.svg)

## Subword tokenization balances vocabulary and sequence length

A word-level vocabulary cannot represent every name, spelling, and code identifier without becoming enormous. A character-level vocabulary handles any text but produces long sequences. Subword tokenizers use common pieces as single tokens and split uncommon text into smaller pieces.

For example, a tokenizer might represent `authorization` as one token, several subword tokens, or a different split when capitalization or leading whitespace changes. Never estimate production limits from word count alone. Use the tokenizer or token-usage fields for the selected model.

## The context window is a request limit

The context window limits how many tokens the model can consider for one request. Provider accounting rules determine which inputs and outputs count toward that limit. Inputs commonly include system instructions, conversation history, tool definitions, retrieved text, images represented through model-specific encodings, and tool results.

When a request exceeds the limit, an API may reject it or an application may remove content before sending it. Silent truncation is dangerous because it can remove the instruction, fact, or prior decision that made the task safe.

An application needs an explicit context policy:

1. Reserve space for the expected output.
2. Keep governing instructions and current user intent.
3. Keep state required for the next decision.
4. Select relevant evidence.
5. Compress or remove older conversational detail.
6. Record durable facts outside the prompt.

## More context is not always better

Every extra token consumes cost and attention capacity. Irrelevant text can distract the model or introduce conflicting instructions. Relevant information buried in a long prompt may receive less effective use than information placed near the current task.

Context engineering is therefore a selection problem. The goal is not to fill the window. The goal is to supply the smallest context that preserves the required evidence, policy, and state.

## Summaries are lossy

A summary reduces token use by choosing what to retain. That choice can remove exceptions, uncertainty, identifiers, or unresolved disagreement. Store authoritative facts in structured state and use summaries for conversational continuity.

For an order-support agent, the database remains the source of truth for payment status. A summary such as “payment completed” must not override a later database result of `REVERSED`.

## Context is not memory

Context exists for one model request. Memory is information the application stores and may retrieve into a later request. A long conversation can look like memory, but it lasts only while the application continues to supply those messages.

This separation lets the application apply retention, authorization, correction, and deletion rules before old information returns to the model.

## Sources

- [SentencePiece: A simple and language independent subword tokenizer and detokenizer](https://arxiv.org/abs/1808.06226)
- [Lost in the Middle: How Language Models Use Long Contexts](https://arxiv.org/abs/2307.03172)
