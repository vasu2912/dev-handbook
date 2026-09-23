---
title: Agent observability
description: Trace trajectories, measure model and tool behavior, redact sensitive content, and replay failures safely.
---

Agent observability connects a user request to every model call, tool call, subagent, MCP request, policy decision, and downstream service operation.

A final error message is not enough. Operators need the trajectory that produced it.

![A distributed trace links an agent run to model, retrieval, tool, MCP, and external API spans and then to run-level quality, safety, latency, and cost outcomes](/images/agentic-ai/vector/agent-observability.svg)

## Trace one task across boundaries

Use a trace for the end-to-end task. Create spans for meaningful operations such as:

- Context assembly
- Model generation
- Retrieval
- Tool selection and execution
- Policy and approval decisions
- Subagent runs
- MCP calls
- Queue waits and background tasks
- Verification and compensation

Propagate W3C Trace Context through HTTP and supported protocol metadata. Keep stable task and operation identifiers in logs and audit records.

## Record versions and outcomes

Useful attributes include model identifier, prompt version, tool name, tool-schema version, agent version, retry count, input and output tokens, cache use, latency, result status, and error class.

OpenTelemetry publishes GenAI semantic conventions, but several fields remain development-stage or have moved between packages. Pin the convention version used by instrumentation and plan migrations.

## Prompts and tool arguments are sensitive

Prompts can contain personal data, proprietary documents, credentials, and attacker content. Tool arguments and results may be more sensitive than the final answer.

Default to metadata and structured redaction. Capture full content only under a documented policy with access controls, retention, and a reason. Sampling does not make secret logging safe.

## Metrics answer different questions

Track service health with request rate, error rate, and duration. Track agent behavior with steps per task, tool calls, repeated actions, task completion, approvals, cancellations, and failure stage. Track economics with input tokens, output tokens, model cost, tool cost, and cost per successful task.

Use percentiles for latency. An average can hide a long tail caused by retries or one slow subagent.

## Replay with recorded inputs and controlled effects

A replay should reproduce model and orchestration analysis without repeating external writes. Replace write tools with recorded results or a sandbox. Mark nondeterministic model output and compare trajectories rather than expecting byte-identical text.

## Sources

- [OpenTelemetry specification](https://opentelemetry.io/docs/specs/otel/)
- [OpenTelemetry GenAI semantic conventions](https://opentelemetry.io/docs/specs/semconv/registry/attributes/gen-ai/)
- [W3C Trace Context](https://www.w3.org/TR/trace-context/)

*Last verified: September 23, 2026.*
