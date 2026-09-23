---
title: Agent production checklist
description: A lookup checklist for the controls required before an agent can take real actions.
---

## Scope and completion

- [ ] The task has a concrete success condition.
- [ ] The run has maximum steps, elapsed time, tokens, and cost.
- [ ] The agent has an explicit no-progress or repeated-action stop condition.
- [ ] Ordinary code owns invariants and irreversible business rules.
- [ ] Cancellation reaches models, tools, queues, and subagents where supported.

## Tools and permissions

- [ ] Every tool has one purpose and an unambiguous description.
- [ ] The application validates syntax, semantics, identity, and authorization.
- [ ] Read and write operations are distinguishable before execution.
- [ ] Consequential writes require approval or a policy decision outside the model.
- [ ] Credentials are scoped to the user, tenant, action, and duration where possible.
- [ ] Tool results remain untrusted data when they re-enter model context.
- [ ] Idempotency keys protect retryable side effects.

## State and recovery

- [ ] Durable state records committed effects separately from chat history.
- [ ] Checkpoints occur before or after clearly defined effects.
- [ ] The system can resume without repeating completed writes.
- [ ] Partial completion has reconciliation or compensation behavior.
- [ ] Dead-lettered work retains enough context for investigation without exposing secrets.

## Context and data

- [ ] Context assembly has an order and token budget.
- [ ] Retrieved data respects user and tenant authorization before ranking.
- [ ] Memory has provenance, retention, correction, and deletion rules.
- [ ] Secrets and unnecessary personal data stay out of prompts and traces.
- [ ] Summaries do not replace authoritative state.

## Security

- [ ] The threat model includes direct and indirect prompt injection.
- [ ] Network egress and code execution run in a sandbox appropriate to the risk.
- [ ] The agent cannot mint broader credentials or discover unauthorized tools.
- [ ] External instructions cannot override system policy.
- [ ] Cross-tenant tests cover retrieval, memory, caches, logs, and tools.
- [ ] A kill switch can disable a tool or agent version without a new deployment.

## Reliability and operation

- [ ] Retries depend on the operation and observed failure, not one global policy.
- [ ] The system distinguishes timeout from confirmed failure.
- [ ] Concurrency limits and backpressure protect dependencies.
- [ ] Fallback models have tested behavior and compatible tool contracts.
- [ ] Traces correlate the request, model calls, tool calls, subagents, MCP calls, and downstream services.
- [ ] Logs redact prompts, arguments, results, credentials, and personal data according to policy.

## Evaluation and release

- [ ] An evaluation set represents common, difficult, unsafe, and adversarial tasks.
- [ ] Evaluation checks the trajectory as well as the final answer.
- [ ] Tool selection, argument correctness, task success, safety, latency, and cost have separate measures.
- [ ] Every prompt, model, tool schema, retrieval configuration, and policy has a version.
- [ ] A release gate compares the candidate against the current production version.
- [ ] Online monitoring can detect quality, safety, latency, and cost regressions.

## MCP-specific checks

- [ ] The implementation names its supported MCP protocol revisions.
- [ ] Authorization binds tokens to the correct resource and issuer.
- [ ] The gateway enforces policy even when a tool is newly discovered.
- [ ] Tool-list and resource caches obey server-provided scope and lifetime.
- [ ] Long-running work exposes cancellation and terminal status.
- [ ] MCP server output receives the same trust treatment as any external tool result.

## Sources

- [OWASP Agentic AI threats and mitigations](https://genai.owasp.org/resource/agentic-ai-threats-and-mitigations/)
- [NIST AI RMF Generative AI Profile](https://nvlpubs.nist.gov/nistpubs/ai/NIST.AI.600-1.pdf)
- [MCP specification 2026-07-28](https://modelcontextprotocol.io/specification/2026-07-28)
