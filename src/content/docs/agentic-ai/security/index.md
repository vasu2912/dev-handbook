---
title: Agent security
description: Limit what untrusted model decisions can read, invoke, change, remember, and disclose.
---

Agent security starts with one uncomfortable fact: the model processes instructions and data through the same language channel. An attacker can place instruction-like text in a user request, webpage, email, document, tool result, or stored memory.

Do not make the model the only security boundary.

## Model the full path to an effect

A threat model should include:

- Users and external content sources
- Prompt and context construction
- Retrieval indexes and memory stores
- Model providers
- Tools, subagents, and MCP servers
- Credentials and authorization services
- Sandboxes and network egress
- Logs, traces, caches, and evaluation data
- External systems changed by tools

The dangerous path is often indirect. A public issue contains an instruction. A coding agent retrieves it, places it in context, and later calls a repository tool with secrets available.

## Reduce authority before detecting attacks

Detection helps, but it will miss novel or obfuscated instructions. Limit the effects available after a model follows malicious content.

Use least-privilege credentials, tenant filters, read-only tools, network allowlists, filesystem roots, resource limits, approvals, and idempotency. Keep high-risk operations behind deterministic policy.

## Separate trust levels in context

Label the source and trust level of context. System policy, user instructions, retrieved documents, tool results, and stored memory should not appear as one undifferentiated transcript.

This improves reasoning and auditability, but labels are not a perfect defense. The model can still follow text in a data block.

## Protect confidentiality and integrity

Confidentiality failures disclose prompts, user data, credentials, retrieved documents, or cross-tenant state. Integrity failures change memory, plans, code, tickets, deployments, or business records.

Availability matters too. An attacker can trigger expensive loops, huge context, repeated tool calls, or resource-heavy queries.

## Approval needs an honest preview

Before a consequential action, show the user the normalized operation, target, scope, and expected effect. Do not ask “continue?” after hiding important arguments in a collapsed model message.

Approval is specific. Consent to draft an email is not consent to send it. Consent to restart one deployment is not consent to restart a namespace.

## Prepare for containment

Version prompts, models, policies, tools, and MCP servers. Keep a kill switch for a tool or agent release. Revoke credentials, stop queued work, invalidate poisoned memory, and identify affected executions through traces and audit records.

## Sources

- [OWASP Agentic AI threats and mitigations](https://genai.owasp.org/resource/agentic-ai-threats-and-mitigations/)
- [OWASP Top 10 for LLM Applications 2025](https://owasp.org/www-project-top-10-for-large-language-model-applications/assets/PDF/OWASP-Top-10-for-LLMs-v2025.pdf)
- [NIST AI 600-1 Generative AI Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)
