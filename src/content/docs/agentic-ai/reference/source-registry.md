---
title: Agentic AI source registry
description: Primary specifications, research papers, standards, and security guidance used by the Agentic AI handbook.
---

This registry records the sources used for claims that can change or need a precise definition. Individual articles link the sources that support their text.

## Language models and retrieval

| Subject | Primary source | What the handbook uses it for |
|---|---|---|
| Transformer | [Attention Is All You Need](https://arxiv.org/abs/1706.03762) | Attention, positional information, encoder-decoder structure, and the original Transformer design |
| Tokenization | [SentencePiece](https://arxiv.org/abs/1808.06226) | Subword tokenization without language-specific preprocessing |
| Retrieval-augmented generation | [Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401) | The distinction between parametric and retrieved memory |
| Dense passage retrieval | [Dense Passage Retrieval for Open-Domain Question Answering](https://arxiv.org/abs/2004.04906) | Dual-encoder retrieval and dense similarity search |
| ReAct | [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629) | Interleaved reasoning and environment actions |
| JSON Schema | [JSON Schema 2020-12](https://json-schema.org/draft/2020-12) | Tool inputs, structured output, and MCP schemas |

## Serving and inference

| Subject | Primary source | What the handbook uses it for |
|---|---|---|
| Serving internals | [Efficient Memory Management for LLM Serving with PagedAttention (vLLM, SOSP 2023)](https://arxiv.org/abs/2309.06180) | KV cache paging, sharing, batching, and the throughput mechanisms |
| Continuous batching | [Orca (OSDI 2022)](https://www.usenix.org/conference/osdi22/presentation/yu) | Iteration-level scheduling of requests |
| Serving stack | [vLLM documentation](https://docs.vllm.ai/en/latest/) | Verified feature set: chunked prefill, prefix caching, quantization, speculative decoding, multi-LoRA |
| Speculative decoding | [Fast Inference from Transformers via Speculative Decoding](https://arxiv.org/abs/2211.17192) | Draft-and-verify generation with preserved output distribution |
| Quantization | [GPTQ](https://arxiv.org/abs/2210.17323), [AWQ](https://arxiv.org/abs/2306.00978) | Post-training weight quantization methods and their evaluation requirements |
| Test-time compute | [Scaling LLM Test-Time Compute Optimally](https://arxiv.org/abs/2408.03314) | Reasoning-time tradeoffs versus parameters |
| Reasoning models | [DeepSeek-R1](https://arxiv.org/abs/2501.12948) | RL-trained reasoning chains and distilled small models |
| Reasoning guidance | [OpenAI reasoning models guidance](https://platform.openai.com/docs/guides/reasoning), [Anthropic extended thinking](https://docs.claude.com/en/docs/build-with-claude/extended-thinking) | Reasoning-token billing, budgets, and multi-turn behavior |

## Model adaptation

| Subject | Primary source | What the handbook uses it for |
|---|---|---|
| Instruction tuning | [InstructGPT](https://arxiv.org/abs/2203.02155) | The SFT plus preference-tuning recipe |
| Low-rank adaptation | [LoRA](https://arxiv.org/abs/2106.09685), [QLoRA](https://arxiv.org/abs/2305.14314) | Adapter training, multi-adapter serving, and memory budgets |
| Preference tuning | [DPO](https://arxiv.org/abs/2305.18290) | The reward-model-free alternative to RLHF |
| Distillation | [Distilling the Knowledge in a Neural Network](https://arxiv.org/abs/1503.02531) | Teacher-student serving tradeoffs |
| Adaptation tooling | [Hugging Face PEFT](https://huggingface.co/docs/peft) | The implemented API surface for adapters |

## Retrieval infrastructure and multimodality

| Subject | Primary source | What the handbook uses it for |
|---|---|---|
| ANN graphs | [HNSW](https://arxiv.org/abs/1603.09320) | Graph index construction, navigation, parameters, and memory behavior |
| ANN library | [FAISS](https://github.com/facebookresearch/faiss) | IVF, PQ, and filtering strategies as implemented |
| Vector store | [pgvector](https://github.com/pgvector/pgvector) | SQL-side filtering and index interaction |
| Vision transformers | [ViT](https://arxiv.org/abs/2010.11929) | Patch tokenization, context cost, and grounding limits |
| Contrastive space | [CLIP](https://arxiv.org/abs/2103.00020) | Shared image-text embedding space for search |
| Image generation | [DDPM](https://arxiv.org/abs/2006.11239), [Latent Diffusion](https://arxiv.org/abs/2112.10752) | Diffusion mechanics and latent-space serving |
| Speech | [Whisper](https://arxiv.org/abs/2212.04356) | Cascade voice pipeline tradeoffs |
| Diffusion LMs | [LLaDA](https://arxiv.org/abs/2502.09992) | The emerging denoising alternative to autoregression |
| Graph replay | [From Local to Global (GraphRAG)](https://arxiv.org/abs/2404.16130) | Entity extraction, communities, and local versus global search |

## Agent protocols

| Subject | Primary source | What the handbook uses it for |
|---|---|---|
| A2A protocol | [A2A specification v1.0.0](https://a2a-protocol.org/v1.0.0/specification) | Agent Card, tasks, parts, artifacts, transports, and opaque execution |
| A2A governance | [Linux Foundation Agent2Agent project announcement](https://www.linuxfoundation.org/press/linux-foundation-launches-the-agent2agent-protocol-project-to-enable-secure-intelligent-communication-between-ai-agents) | Project origin, custody, and vendor neutrality |

## MCP

The handbook targets MCP protocol revision `2026-07-28` unless a page says otherwise.

| Subject | Primary source |
|---|---|
| Protocol | [MCP specification 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28) |
| Release changes | [The 2026-07-28 specification](https://blog.modelcontextprotocol.io/posts/2026-07-28/) |
| TypeScript SDK | [MCP TypeScript SDK v2](https://ts.sdk.modelcontextprotocol.io/v2/) |
| Python SDK | [MCP Python SDK](https://py.sdk.modelcontextprotocol.io/) |
| Tasks extension | [MCP Tasks extension](https://tasks.extensions.modelcontextprotocol.io/specification/draft/tasks) |

Older MCP revisions used an initialization handshake and protocol sessions. The modern revision carries version and capability data per request, supports optional discovery, and moves long-running tasks into an extension. Compatibility pages label older behavior instead of blending both eras.

## Security and risk

| Subject | Primary source |
|---|---|
| General AI risk | [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework) |
| Generative AI risk | [NIST AI 600-1 Generative AI Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf) |
| LLM application risks | [OWASP Top 10 for LLM Applications 2025](https://owasp.org/www-project-top-10-for-large-language-model-applications/assets/PDF/OWASP-Top-10-for-LLMs-v2025.pdf) |
| Agentic threats | [OWASP Agentic AI threats and mitigations](https://genai.owasp.org/resource/agentic-ai-threats-and-mitigations/) |
| OAuth protected resources | [RFC 9728](https://www.rfc-editor.org/rfc/rfc9728.html) |
| Authorization issuer identification | [RFC 9207](https://www.rfc-editor.org/rfc/rfc9207.html) |
| Guardrail policy engine | [NVIDIA NeMo Guardrails](https://docs.nvidia.com/nemo/guardrails/) | Rails as a declarative policy layer |
| Guardrail model | [Llama Guard](https://arxiv.org/abs/2312.06674) | Classification-based input and output safeguard |

## Production operation

| Subject | Primary source |
|---|---|
| Traces, metrics, and logs | [OpenTelemetry specification](https://opentelemetry.io/docs/specs/otel/) |
| GenAI telemetry attributes | [OpenTelemetry GenAI semantic conventions](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/) |
| Distributed trace context | [W3C Trace Context](https://www.w3.org/TR/trace-context/) |

OpenTelemetry marks several GenAI conventions as development-stage or moved. Articles state that maturity rather than treating every field as stable.

## Framework documentation

Framework pages use official documentation and name the checked version or documentation date. Framework behavior is never used as the definition of an agent, tool, subagent, or MCP concept.

## Verification rules

- Prefer a specification, RFC, paper, or official SDK document.
- Date claims about current protocol or framework behavior.
- Separate a normative requirement from design advice.
- Do not infer a security guarantee from a model prompt.
- Treat an unverified benchmark number as absent.
- Recheck version-sensitive pages before changing their “last verified” date.

*Registry last reviewed: September 23, 2026.*
