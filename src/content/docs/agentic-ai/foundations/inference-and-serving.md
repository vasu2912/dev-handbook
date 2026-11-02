---
title: "Inference and serving internals"
description: "How LLM requests execute on hardware: prefill, decode, the KV cache, batching, caching, and what those mechanics mean for latency and cost."
---

A model API hides a serving system that turns token sequences into token probabilities on accelerators. Two phases do that work, and they behave differently. Knowing the phases explains most latency and cost behavior you will observe in production.

## Prefill and decode

Prefill processes the prompt. The serving system runs every input token through the model in parallel and stores the attention key and value tensors it computes. That stored state is the **KV cache**. Prefill ends when the system has processed the full prompt and produced the first output token.

Decode produces the rest of the response. The system runs one token per step, reads the KV cache, appends the new token's keys and values, and samples. Each step waits for the previous one, so output length directly controls tail latency.

The two phases stress different resources:

| Phase | Work per step | Bottleneck | Affects |
|---|---|---|---|
| Prefill | Many tokens at once | Compute (matrix math) | Time to first token |
| Decode | One token | Memory bandwidth (reading the KV cache) | Time per output token |

This split is why a long prompt costs more than a long answer per token, why the first token is usually the slowest, and why trimming input tokens helps latency even when output length is unchanged.

## The KV cache dominates memory

The KV cache grows with batch size, sequence length, number of layers, and model width. At serving scale it is typically the largest consumer of accelerator memory, not the model weights. Memory pressure forces smaller batches, and smaller batches reduce throughput.

Serving systems fight that with two mechanisms:

- **PagedAttention** keeps the KV cache in small blocks, like virtual memory pages. Requests share blocks when they share a prompt prefix, and new requests start without pre-reserving worst-case memory. The vLLM paper reports large throughput gains from eliminating fragmentation and sharing.
- **Prefix caching** reuses the computed KV cache for a repeated prefix, such as a system prompt, tool definitions, or few-shot examples. On provider APIs the same idea appears as prompt caching with a discount for cached input tokens. A cache hit usually requires a long stable prefix that starts at the beginning of the request, so put stable content first and variable content last.

:::note
Prefix caching saves work only for exact shared prefixes. Reordering instructions between requests defeats it. This is a serving-level reason for prompt layout discipline, separate from model quality concerns.
:::

## Batching trades latency for throughput

Decode steps underutilize compute because each step moves little data relative to what the accelerator can process. Batching many concurrent requests amortizes weight reads across them.

- **Static batching** collects requests into a group and runs them together. One slow or long request holds the whole batch, so the group waits for its worst member.
- **Continuous batching** checks after each decode step. Finished requests leave the batch and queued requests join immediately, so the batch stays full. The Orca system introduced this idea, and Anyscale measured large throughput improvements with lower median latency compared with static batching.
- **Chunked prefill** splits a long prompt across decode steps so a new request's prefill does not stall everyone else's decode. Some systems also disaggregate prefill and decode onto separate machines because the phases stress different resources.

Batching raises throughput without making any single request faster. It is a capacity tool. When latency is the constraint, the levers are shorter prompts, cached prefixes, fewer sequential steps, and smaller or faster models.

## Approximate shortcuts

Three families of shortcuts reduce cost or latency. Each one changes something, so each one needs evaluation.

| Technique | Idea | Tradeoff |
|---|---|---|
| Speculative decoding | A small draft model proposes several tokens; the target model verifies them in one pass | Lower latency, same output distribution when verification is exact; needs a matched draft model |
| Quantization | Store weights (and sometimes the cache) in fewer bits: FP8, INT8, INT4 | Less memory, higher throughput; quality risk that varies by model and method, so evaluate before committing |
| Distillation | Train a smaller model to copy a larger model's behavior | Cheaper serving; quality loss bounded by what the evaluation set can see |

Speculative decoding accepts a draft token only when the target model agrees, so exact variants preserve the output distribution. Quantization has no such safety net. Methods such as GPTQ and AWQ quantize trained weights with calibration data, and FP8 variants run natively on recent accelerators. The right check is the same in every case: run your evaluation set against the quantized configuration and compare.

## What you operate when you self-host

A serving stack such as vLLM or TensorRT-LLM exposes an OpenAI-compatible HTTP server plus configuration for batching, cache limits, quantization, and parallelism across GPUs. Self-hosting buys control and can reduce unit cost at steady high utilization. It also makes you the owner of:

- GPU capacity planning and autoscaling
- Model updates, evaluation, and rollback
- KV cache and memory tuning
- Failure handling for hardware and driver problems

Using a provider API moves those problems to the provider and leaves you with orchestration, retries, routing, and cost control. The [reliability](/agentic-ai/production/reliability/) and [performance and cost](/agentic-ai/production/performance-and-cost/) pages cover that side. The decision usually flips around a utilization threshold: at low or spiky volume, API access is cheaper than idle GPUs; at sustained high volume with stable models, self-hosting can win.

## Metrics that match the phases

Measure the two phases separately:

- **Time to first token (TTFT)** covers queueing and prefill. It is what users perceive as "the app is thinking".
- **Time per output token (TPOT)**, or inter-token latency, covers decode. Streaming makes it visible as typing speed.
- **Requests per second and tokens per second** measure capacity, and goodput (requests meeting both latency and quality targets) measures useful capacity.

An inference batching design question, common in interviews, is really a queueing question: given a latency target for TTFT and TPOT, how many requests may share a batch, when does a long prefill delay everyone, and what gets shed first under load? The mechanics above are the vocabulary for that answer.

## Sources

- [Efficient Memory Management for Large Language Model Serving with PagedAttention (vLLM, SOSP 2023)](https://arxiv.org/abs/2309.06180)
- [vLLM: announcing PagedAttention](https://blog.vllm.ai/2023/06/20/vllm.html)
- [vLLM documentation](https://docs.vllm.ai/en/latest/)
- [Orca: A Distributed Serving System for Transformer-Based Generative Models (OSDI 2022)](https://www.usenix.org/conference/osdi22/presentation/yu)
- [How continuous batching enables 23x throughput in LLM inference while reducing p50 latency (Anyscale)](https://www.anyscale.com/blog/continuous-batching-llm-inference)
- [Fast Inference from Transformers via Speculative Decoding](https://arxiv.org/abs/2211.17192)
- [GPTQ: Accurate Post-Training Quantization for Generative Pre-trained Transformers](https://arxiv.org/abs/2210.17323)
- [AWQ: Activation-aware Weight Quantization](https://arxiv.org/abs/2306.00978)

*Last verified: October 17, 2026.*
