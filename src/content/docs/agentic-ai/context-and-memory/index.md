---
title: Context engineering and memory
description: Select current model input and manage durable information without confusing prompts with state.
---

Context engineering selects what the model sees for one request. Memory decides what the application stores and may retrieve later. Durable state records commitments and facts that the system must not reconstruct from a conversation.

These are three different responsibilities.

![Candidate inputs are deliberately selected into an ephemeral working context, while durable state and memory remain separately governed](/images/agentic-ai/vector/context-memory.svg)

## Build context in a deliberate order

A model request may contain:

1. Governing instructions
2. The current user goal
3. Allowed tool definitions
4. Structured task state
5. Selected conversation history
6. Retrieved evidence
7. Recent tool observations

The order and representation affect model behavior. Conflicting or irrelevant content makes the next decision harder.

## Working memory supports the current task

Working memory is the small set of facts and intermediate results needed now. It might include completed steps, unresolved questions, selected evidence, and remaining budget.

Store it as structured state where practical. A list of completed operation identifiers is safer than a summary that says “all changes applied.”

## Long-term memory needs a lifecycle

Common categories include:

- **Episodic memory**, which records prior interactions or events
- **Semantic memory**, which records generalized facts or preferences
- **Procedural memory**, which records reusable methods or instructions

The names are less important than the policy. Each stored item needs provenance, ownership, access scope, retention, correction, and deletion behavior.

## Do not store everything

Conversation history can contain secrets, personal data, stale assumptions, prompt injections, and mistakes. Before storing a memory, decide whether it is useful, permitted, attributable, and safe to retrieve later.

Do not save credentials, authentication tokens, transient approvals, or unverified claims as reusable memory.

## Retrieval can poison future decisions

A malicious email or document may cause the system to save an instruction as a preference. Later tasks can then receive the injected content without the original source being visible.

Preserve provenance and trust level. Separate user-confirmed preferences from model-inferred notes. Require stronger checks before untrusted content becomes durable memory.

## Resolve conflict against the source of truth

When memory conflicts with current system state, authoritative state wins. A stored preference may influence presentation. It must not override the user's current instruction or a domain rule.

Use timestamps and source versions to identify stale memories. Let users inspect and correct personal memory where the product calls for it.

## Summarize for continuity, not correctness

Summaries help fit long interactions into context. Keep exact identifiers, approvals, and commitments in structured state. A summary is a lossy view, not a ledger.

## Sources

- [NIST AI 600-1 Generative AI Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)
- [OWASP Agentic AI threats and mitigations](https://genai.owasp.org/resource/agentic-ai-threats-and-mitigations/)
