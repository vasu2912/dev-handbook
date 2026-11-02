---
title: "Guardrails"
description: "Input and output guardrails around model calls: what they check, where they run, and what they cannot do."
---

Guardrails are checks that run around a model call. Input guardrails inspect what the user or pipeline sends. Output guardrails inspect what the model produced before anything acts on it. They are deterministic or model-assisted checks, and they sit in addition to the authorization that application code enforces, never instead of it.

A guardrail that fails open is decoration. Decide, for every rail, what happens when the check itself is unavailable: block the request, or continue without it. Write that decision down and test it.

## Input guardrails

| Rail | Checks | Typical implementation |
|---|---|---|
| PII and secrets | Credit card numbers, credentials, health data leaving the boundary | Regex plus NER classifiers; redact or reject |
| Injection heuristics | Instruction-like text from untrusted sources | Classifiers and canaries; never a complete defense |
| Topic and policy | Off-policy requests, regulated advice | Small classifier or rule set with a refusal path |
| Budget and abuse | Rate, spend, and session limits per identity | Deterministic counters; see [rate limiting](/system-design/rate-limiting/) |

Input rails protect the system and the data subject. They do not protect the model from following malicious content that slips past detection, and they add false positives that block real users. Measure the false-positive rate on legitimate traffic with the same rigor as the true-positive rate on attacks.

## Output guardrails

| Rail | Checks | Notes |
|---|---|---|
| Schema validation | Structure, types, required fields, enum values | Deterministic and cheap; fail into a repair loop or a fallback |
| Moderation | Harmful content categories | Provider moderation endpoints or a classifier model |
| Grounding | Whether the answer is supported by the retrieved evidence | Claim extraction plus NLI or a judge model; see [evaluation](/agentic-ai/production/evaluation/) |
| PII leak prevention | Sensitive data flowing out in the response | Symmetric to the input rail; catches retrieval of the wrong tenant's data |
| Action safety | Whether a proposed action matches policy before execution | Deterministic policy code; the model never grants its own authority |

Output rails earn their keep on the paths where an error becomes an effect: sends, purchases, deletions, code merges. Validate before the effect, not after.

## Where guardrails run

Placement decides latency and coverage:

- **Gateway-level rails** run once per request in front of the model call. Cheap and complete for user-facing traffic, blind to tool results and subagent context.
- **Step-level rails** run inside the agent loop on every model turn and tool result. Necessary for agents, because untrusted text enters mid-loop through tool outputs and retrieval.
- **Action-level rails** run in the tool executor itself, as the last check before an effect. This is the only placement that survives everything upstream failing.

Guardrail calls add latency on the critical path. Small classifier models, cached verdicts for repeated inputs, and sampling strategies (always check consequential outputs, sample-check the rest) keep the budget sane.

## What guardrails cannot do

Input and output filtering cannot eliminate prompt injection, because untrusted text enters through tool results, retrieved documents, memory, and MCP resources, not only through the user. The [prompt injection](/agentic-ai/security/prompt-injection/) page explains why detection is probabilistic and why authority reduction is the real defense. Guardrails are one layer of that defense, useful for the attacks they catch and harmless to the ones they miss, provided nothing downstream assumed they were perfect.

## The standards to map against

The [OWASP Top 10 for LLM Applications 2025](https://genai.owasp.org/llm-top-10/) names the risks a production system should answer for. Each maps to rails plus controls:

| OWASP 2025 | Primary answer |
|---|---|
| LLM01 Prompt injection | [Prompt injection](/agentic-ai/security/prompt-injection/) controls; injection detection rails |
| LLM02 Sensitive information disclosure | PII rails on input and output; tenant filters |
| LLM03 Supply chain | Pinned models, tools, and MCP servers; dependency review |
| LLM04 Data and model poisoning | Dataset review; [fine-tuning](/agentic-ai/foundations/fine-tuning/) data provenance |
| LLM05 Improper output handling | Schema validation; output rails; downstream escaping |
| LLM06 Excessive agency | Least-privilege tools; approvals; see [agent security](/agentic-ai/security/) |
| LLM07 System prompt leakage | Treat prompts as sensitive; do not put secrets there |
| LLM08 Vector and embedding weaknesses | [Index security](/agentic-ai/foundations/vector-indexes/); access filters at query time |
| LLM09 Misinformation | Grounding checks; citations; [hallucination handling](/agentic-ai/foundations/llms/) |
| LLM10 Unbounded consumption | Budgets, rate limits, queue limits |

NIST AI 600-1 profiles the same risks for generative AI systems and is the reference for teams that need a framework audit trail.

## Test the rails

A guardrail is code with failure modes, so it belongs in the test suite:

- Red-team corpora with known attacks, run in CI, with the expected refusal or redaction asserted.
- Benign corpora that must pass, so false positives surface as regressions.
- Failure drills for the rails themselves: verdict service down, classifier timeout, and the chosen fail-open or fail-closed behavior.

## Sources

- [OWASP Top 10 for LLM Applications 2025](https://genai.owasp.org/llm-top-10/)
- [NIST AI 600-1 Generative AI Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)
- [NVIDIA NeMo Guardrails documentation](https://docs.nvidia.com/nemo/guardrails/)
- [Llama Guard: LLM-based Input-Output Safeguard for Human-AI Conversations](https://arxiv.org/abs/2312.06674)
- [OWASP Agentic AI threats and mitigations](https://genai.owasp.org/resource/agentic-ai-threats-and-mitigations/)

*Last verified: October 17, 2026.*
