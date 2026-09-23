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
