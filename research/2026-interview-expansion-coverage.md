# 2026 interview topic expansion

Research date: 2026-10-17.

This expansion fills the topics that current backend and AI-engineering interview loops test but the handbook did not yet cover. Evidence and choices are recorded here so future updates know why each page exists and what it claims.

## Scope evidence

The 2026 AI-engineering loop evidence concentrates on five themes. An interview guide roundup published by the University of Pennsylvania career services in June 2026 groups recurring questions as inference batching and serving on real throughput constraints, RAG production engineering, agentic system design with guardrails and cost control, evaluation, and cost and token budgets. Community question banks updated through September 2026 include dedicated sections for reasoning models and test-time compute, inference optimization (KV cache, speculative decoding, batching), model selection, and voice AI. Interview preparation guides for backend roles continue to emphasize distributed-systems fundamentals, where consensus with Raft and quorum reasoning is a standard topic that this handbook had not covered.

Agentic standardization progressed on a track the handbook tracked separately. The Agent2Agent protocol started by Google in April 2025 moved to Linux Foundation governance in June 2025 and reached specification version 1.0.0. The handbook's MCP material targets revision `2026-07-28`. The two protocols now appear together in interviews, which motivated a dedicated protocols page rather than extending the MCP section.

Security expectations moved from guidelines to checklists. The OWASP Top 10 for LLM Applications 2025 (LLM01 prompt injection through LLM10 unbounded consumption) and NIST AI 600-1 are cited by multiple 2026 interview guides as table stakes. The handbook cited OWASP before; the new guardrails page maps each risk to rails and controls.

For engineering practice, the DORA 2024 report's finding that higher AI adoption correlated with increased delivery throughput and decreased delivery stability is now frequently referenced in "how do you use AI" interview questions, and package-hallucination research (2406.10279) gives the supply-chain risk a concrete name.

## Pages added

| Page | Route | Covers |
| --- | --- | --- |
| Inference and serving internals | `agentic-ai/foundations/inference-and-serving` | Prefill vs decode, KV cache, PagedAttention, continuous batching, chunked prefill, prefix caching, speculative decoding, quantization, self-host vs API, TTFT and TPOT |
| Reasoning models and test-time compute | `agentic-ai/foundations/reasoning-models` | Reasoning tokens, effort budgets, tool and multi-turn behavior, faithfulness limits, evaluation additions |
| Multimodal models | `agentic-ai/foundations/multimodal` | Patch tokenization, context cost, document pipelines, diffusion and autoregressive contrast, CLIP retrieval, cascade vs speech-to-speech voice |
| Fine-tuning and model adaptation | `agentic-ai/foundations/fine-tuning` | SFT, LoRA and QLoRA, RLHF vs DPO, distillation, decision order, operational lifecycle |
| Vector index internals | `agentic-ai/foundations/vector-indexes` | Exact vs ANN, IVF, HNSW, PQ/SQ, filtered search, deletions, re-embedding migrations |
| Agent protocols: MCP and A2A | `agentic-ai/protocols` | A2A objects and lifecycle, MCP vs A2A boundaries, enterprise adoption concerns |
| GraphRAG | `agentic-ai/rag/graphrag` | Knowledge-graph retrieval, local vs global search, indexing cost, selection guidance |
| Guardrails | `agentic-ai/production/guardrails` | Input/output rails, placement, OWASP LLM Top 10 mapping, fail-open policy, rail testing |
| Distributed consensus | `system-design/consensus` | Raft terms, quorums, commit and election rules, read consistency, consensus vs 2PC |
| Python for AI backends | `engineering/python-for-backends` | asyncio failure modes, GIL and free threading, typing and Pydantic, FastAPI service growth |
| Engineering with AI assistants | `engineering/ai-assisted-engineering` | Ownership contract, verification discipline, package hallucination, DORA findings, measurement |

## Question bank extension

Sections 21 through 30 (questions 561 to 669) were appended to `research/agentic-ai-interview-questions.md`, one section per new page. `scripts/build-agentic-ai-question-map.mjs` now carries a `TOTAL` constant of 669 with reading rules and section ranges for the new material; the generated `agentic-ai/reference/question-coverage.md` maps all 669 questions.

## Truthfulness rules applied

- Serving claims come from the vLLM paper and documentation, the Orca paper, the speculative decoding paper, and GPTQ and AWQ papers, as fetched on the research date.
- A2A claims come from the v1.0.0 specification and the Linux Foundation announcement; the page names the specification version rather than generalizing.
- OWASP risk names come verbatim from the 2025 list as published at genai.owasp.org.
- Python claims come from python.org documentation and the relevant PEPs (703, 779, 734, 649).
- The DORA page states the 2024 correlation as published and roots its reading in the report text, not in secondary summaries.
- GraphRAG claims come from the Microsoft paper and library documentation.
- Interview-frequency statements remain attributed to the guides that make them; handbook pages describe mechanisms, not predicted question counts.

## Known boundaries

- The question bank is a study list, not evidence of what a specific company asks. The handbook's coverage claim is mechanism completeness for the listed topics, not interview prediction.
- Voice engineering is covered at decision level (cascade vs speech-to-speech, latency budget) rather than as a full DSP track.
- Consensus covers Raft mechanics and operational boundaries; it intentionally does not turn into a Paxos derivation or a Jepsen-clone implementation guide.
- Cloud-provider-specific serving offerings are out of scope; the serving page keeps to protocol- and system-level mechanics that transfer across providers.
- Guardrails page cites NeMo Guardrails and Llama Guard as implementation references without endorsing them; the build-vs-adopt decision is left open.
