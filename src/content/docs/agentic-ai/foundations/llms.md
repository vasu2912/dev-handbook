---
title: How language models generate text
description: Understand next-token prediction, model parameters, inference, and the limits of generated language.
---

A large language model receives tokens and assigns a probability to possible next tokens. The application selects one token, appends it to the sequence, and asks again. Repeating that operation produces a response.

The mechanism is less mysterious than the output makes it appear. A fluent paragraph is still the result of repeated conditional prediction.

![An LLM repeatedly predicts a next-token distribution, selects one token, appends it to the context, and predicts again](/images/agentic-ai/vector/llm-generation.svg)

## Training changes parameters

During pretraining, the model processes large collections of token sequences. It predicts hidden or next tokens, measures prediction error, and updates numeric parameters to reduce that error. Those parameters capture statistical regularities in the training data.

The parameters are often called **parametric memory**. That phrase does not mean the model stores a searchable copy of every source. It means training has changed the probability distribution the model produces for later inputs.

Fine-tuning changes parameters with a narrower dataset or objective. Prompting does not. A prompt changes the current input and therefore the conditional prediction, but it leaves the trained parameters unchanged.

## Inference uses the supplied context

Inference is generation with fixed model parameters. The request usually contains instructions, user content, prior messages, tool definitions, retrieved evidence, and tool results. The model transforms that context into scores called logits, converts the scores into token probabilities, and selects a token according to the sampling configuration.

Generation stops when one of these conditions occurs:

- The model emits a stop token.
- The application reaches its output-token limit.
- A configured stop sequence appears.
- The client cancels the request.
- The provider rejects or interrupts the request.

The model does not inspect a database or call an API unless the surrounding application gives it a mechanism to do so.

## Fluency is not a truth guarantee

Training rewards prediction, not factual verification. A model can produce a sentence that fits the context even when the sentence is false. This behavior is commonly called hallucination.

Several different failures are often grouped under that term:

- The model invents a fact that was not in the evidence.
- It joins two real facts incorrectly.
- It presents an uncertain inference as settled.
- It cites a source that does not support the claim.
- It follows stale knowledge when the world has changed.

Grounding supplies evidence in the current context. Structured output constrains form. Tools expose current state. None of these controls proves that the model interpreted the evidence correctly.

## The application owns guarantees

Treat model output as a proposal. If a field must be present, validate it. If a value must refer to an existing account, look up the account. If the caller must have permission, authorize the action outside the model.

This distinction becomes more important in an agent. A wrong paragraph is inconvenient. A wrong payment, deletion, or production command is a system failure.

## A useful mental model

Think of the model as a strong pattern-completion component with a flexible interface. It can classify, extract, transform, draft, compare, and propose plans. It is weak at guarantees that depend on hidden state, current facts, exact arithmetic, or policy enforcement unless the application supplies the right evidence and checks.

## Sources

- [Attention Is All You Need](https://arxiv.org/abs/1706.03762)
- [Language Models are Few-Shot Learners](https://arxiv.org/abs/2005.14165)
- [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401)
